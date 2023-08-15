import path from 'node:path'
import { EntryMeta, PluginAbstract } from '../behest/mod.ts';
import { build } from '../html_schema/mod.ts';
import { Golly } from '../golly/golly.ts';

export function getHTML (schema?: any, name?: string, value?: any) {
  const html = Golly.createElement('html')
  const head = Golly.createElement('head')
  html.appendChild(head)
  const body = Golly.createElement('body')
  html.appendChild(body)
  const form = Golly.createElement('form', { method: 'post', action: `./${name}-schema` })
  form.appendChild(build(schema, undefined, value))
  form.appendChild(Golly.createElement('button', { type: 'submit', action: `./${name}-add`, value: '' }, 'Add'))
  form.appendChild(Golly.createElement('button', { type: 'submit' }, 'Submit'))
  body.appendChild(form)
  return html.toString()
}

export class BehestSchema extends PluginAbstract {
  entrypoints: {[key: string]: string} = {};
  operation (meta: EntryMeta) {
    if (this.opts.extNames.includes(meta.extDeep)) {
      const out = path.join(meta.outProjectionDirname, `${meta.coreDeep}.html`)
      this.entrypoints[meta.entryPath] = out
    }
  }
  async finalize(): Promise<void> {
    for (const [src, dest] of Object.entries(this.entrypoints)) {
      const schema = JSON.parse(await Deno.readTextFile(src))
      const name = path.basename(dest, path.extname(dest))
      const html = getHTML(schema, name)
      await Deno.mkdir(path.dirname(dest), {recursive: true})
      await Deno.writeTextFile(dest, html)
    }
  }
}
