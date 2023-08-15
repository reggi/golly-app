import { Golly, Children, Props, GollyElement, toNameAttribute, isNotUndefined } from "../golly/mod.ts"
import { JSONSchema7Definition } from "../json_schema_type/mod.ts"

const item = Golly.createElement('div', { 'data-item': '' }).clone

const elements: Record<string, (props: Props, children?: Children) => GollyElement> = {
  string: (props: Props) => {
    const { title, ...rest } = props
    return item({ 'data-type': props['data-type'] }, [
      Golly.createElement('label', { 'data-title': '', for: rest.name}, title),
      Golly.createElement('input', { type: 'string', ...rest })
    ])
  },
  integer: (props: Props) => {
    const { title, ...rest } = props
    return item({ 'data-type': props['data-type'] }, [
      Golly.createElement('label', { 'data-title': '', for: rest.name}, title),
      Golly.createElement('input', { type: 'integer', ...rest })
    ])
  },
  object: (props: Props, children?: Children) => {
    const { title, ...rest } = props
    const root = Golly.createElement('div', { 'data-type': props['data-type'] }).clone(rest, children)
    return root.prependChild(Golly.createElement('label', { 'data-title': '' }).clone({}, title))
  }, 
  array: (props: Props, children?: Children) => {
    const { title, ...rest } = props
    const root = Golly.createElement('div', { 'data-type': props['data-type'] }).clone(rest, children)
    return root.prependChild(Golly.createElement('label', { 'data-title': '' }).clone({}, title))
  }
}

export function build (
  schema: JSONSchema7Definition,
  _rootName?: undefined | string | number | (string | number)[],
  rootValue?: any
): GollyElement | undefined {
  if (typeof schema !== 'object') return undefined
  const rootName = _rootName ? [_rootName].flat() : []
  const items = schema.items
  const properties = schema.properties
  const type = schema.type
  const attrib = { 'data-type': type as string }
  if (type === 'array') {
    if (Array.isArray(items)) {
      const children = items.map((innerSchema, index) => {
        return build(innerSchema, [...rootName, index], rootValue && rootValue[index])
      })
      const name = toNameAttribute(rootName)
      return elements.array({ ...attrib, 'data-name': name }, children)
    } else if (items === true) {
      // noop
    } else if (items) {
      if (Array.isArray(rootValue)) {
        const children = rootValue.map((value, index) => {
          return build(items, [...rootName, index], value)
        })
        children.push(build(items, [...rootName, rootValue.length]))
        const name = toNameAttribute(rootName)
        return elements.array({ ...attrib, 'data-name': name, title: schema.title }, children)
      } else {
        const children = build(items, [...rootName, 0], rootValue)
        const name = toNameAttribute(rootName)
        return elements.array({ ...attrib, 'data-name': name, title: schema.title }, children)
      }
    }
  } else if (type === 'object') {
    if (properties) {
      const children = Object.entries(properties).map(([key, props]) => {
        if (typeof props !== 'object') return undefined
        if (typeof props.type !== 'string') return undefined
        return build(props, [...rootName, key], rootValue && rootValue[key])
      }).filter(isNotUndefined)
      const name = toNameAttribute(rootName)
      return elements.object({ ...attrib, 'data-name': name, title: schema.title }, children)
    }
  } else if (type === 'string') {
    const name = toNameAttribute(rootName)
    return elements.string({ ...attrib, name, value: rootValue, title: schema.title })
  } else if (type === 'integer') {
    const name = toNameAttribute(rootName)
    return elements.integer({ ...attrib, name, value: rootValue, title: schema.title })
  }
  return undefined
}