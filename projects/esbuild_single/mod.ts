import path from 'node:path'
import { EsbuildBuilder, EsbuildBuilderOptions, JSXConfig } from '../esbuild/mod.ts';
import { fileExists } from '../file_system/file_exists/mod.ts';

export async function bundleSingle (parent: string, fileName: string) {
  const cwd = Deno.cwd()
  const entrypoints: Record<string, string> = {};
  const filePath = path.join(parent, fileName)
  entrypoints[fileName.replace(".ts", "")] = filePath
  const denoConfig = path.join(cwd, 'deno.json')
  const denoConfigExists = await fileExists(denoConfig)
  const options: EsbuildBuilderOptions = {
    entrypoints: entrypoints,
    dev: false,
    configPath: denoConfigExists ? path.join(cwd, 'deno.json') : undefined,
    jsxConfig: {
      jsx: "react",
    } as JSXConfig,
    write: false,
  }
  const builder = new EsbuildBuilder(options)
  const results = await builder.build()
  return results.outputFiles && results.outputFiles[0].text
}
