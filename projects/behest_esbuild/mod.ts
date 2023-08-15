import path from "node:path";
import { EsbuildBuilder, JSXConfig, EsbuildBuilderOptions } from "../esbuild/mod.ts";
import { EntryMeta, PluginAbstract } from "../behest/mod.ts";
import { fileExists } from "../file_system/file_exists/mod.ts";

const cwd = Deno.cwd()

export class BehestEsbuild extends PluginAbstract {
  entrypoints: {[key: string]: string} = {};
  operation(meta: EntryMeta) {
    if (this.opts.extNames.includes(meta.extDeep)) {
      this.entrypoints[meta.name] = meta.entryPath;
    }
  }
  async finalize() {
    const denoConfig = path.join(cwd, 'deno.json')
    const denoConfigExists = await fileExists(denoConfig)
    const options: EsbuildBuilderOptions = {
      entrypoints: this.entrypoints,
      dev: false,
      configPath: denoConfigExists ? path.join(cwd, 'deno.json') : undefined,
      jsxConfig: {
        jsx: "react",
      } as JSXConfig,
      outDir: this.outDirStatic,
      write: true,
    }
    const builder = new EsbuildBuilder(options)
    await builder.build()
  }
}
