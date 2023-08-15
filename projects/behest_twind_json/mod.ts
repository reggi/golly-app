import path from 'node:path'
import { tailwindObjectToGloablStyles } from "https://deno.land/x/resume@0.0.12/src/twind/mod.ts";
import { EntryMeta, PluginAbstract } from '../behest/mod.ts';

export class BehestTwindJSON extends PluginAbstract {
  entrypoints: {[key: string]: string} = {};
  operation (meta: EntryMeta) {
    if (this.opts.extNames.includes(meta.extDeep)) {
      this.entrypoints[meta.entryPath] = path.join(meta.outStaticProjectionDirname, `${meta.nameDeep}.css`)
    }
  }
  async finalize () {
    await Promise.all(Object.entries(this.entrypoints).map(async ([src, out]) => {
      const contents = await Deno.readTextFile(src);
      const { style } = tailwindObjectToGloablStyles(JSON.parse(contents))
      await Deno.writeTextFile(out, style)
    }))
  }
}