import { ValueElement } from '../value_element/mod.ts'
import { build } from '../html_schema/mod.ts'

class InputSchema extends ValueElement {
  render () {
    const schema = JSON.parse(this.getAttribute('schema') || '{}')
    const value = JSON.parse(this.getAttribute('value') || '{}')
    const name = this.getAttribute('name') || undefined
    const b = build(schema, name, value)
    if (b) {
      const s = b?.toString()
      if (s) {
        this.innerHTML = s
      }
    }
  }
}

customElements.define('input-schema', InputSchema)
