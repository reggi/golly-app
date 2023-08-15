import path from 'node:path'
import { EntryMeta, PluginAbstract } from "../behest/mod.ts";

const INDEX = 'index'
export class BehestIndex extends PluginAbstract {
  entrypoints: {[key: string]: string} = {};
  operation(meta: EntryMeta) {
    if (this.opts.extNames.includes(meta.extDeep) && meta.nameDeep !== INDEX) {
      const d = meta.outStaticProjectionDirname
      const n = meta.nameDeep
      const f = `${INDEX}${meta.extDeep}`
      this.entrypoints[meta.entryPath] = path.join(d, n, f)
    }
  }
  async finalize() {
    for (const [src, dest] of Object.entries(this.entrypoints)) {
      await Deno.mkdir(path.dirname(dest), { recursive: true });
      await Deno.copyFile(src, dest);
    }
  }
}
