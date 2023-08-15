import path from 'node:path'
import { EntryMeta, PluginAbstract } from "../behest/mod.ts";

export class BehestMove extends PluginAbstract {
  entrypoints: {[key: string]: string} = {};
  operation (meta: EntryMeta) {
    if (this.opts.extNames.includes(meta.extDeep)) {
      this.entrypoints[meta.entryPath] = meta.outStaticProjection
    }
  }
  async finalize () {
    for (const [src, dest] of Object.entries(this.entrypoints)) {
      await Deno.mkdir(path.dirname(dest), { recursive: true });
      await Deno.copyFile(src, dest);
    }
  }
}
