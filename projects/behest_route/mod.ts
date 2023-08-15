import path from 'node:path'
import { EntryMeta, PluginAbstract } from '../behest/mod.ts';

export function getMainFile (props: { serverDep: string, staticDir: string }) {
return `import { serveFolders } from "${props.serverDep}"
import manifest from './manifest.ts'
type ManifestType = {
  [key: string]: (req: Request) => Promise<Response> | Response;
}
const nerfedManifest: ManifestType = manifest
Deno.serve((req) => {
  const url = new URL(req.url)
  const path = url.pathname
  if (path in nerfedManifest) {
    const file = nerfedManifest[path]
    return file(req)
  }
  return serveFolders(['${props.staticDir}'], req)
})`
}

export function getManifestFile(manifest: Record<string, string>): string {
  let importStatements = '';
  let exportMapping = 'export default {\n';
  let counter = 1;
  for (const [key, value] of Object.entries(manifest)) {
    const manifestItem = `manifestItem${counter}`;
    importStatements += `import ${manifestItem} from "${value}"\n`;
    exportMapping += `  "/${key}": ${manifestItem},\n`;
    counter++;
  }
  exportMapping += '}\n';
  return importStatements + '\n' + exportMapping;
}

export class BehestRoute extends PluginAbstract<{ serverDep: string }> {
  entrypoints: {[key: string]: string} = {};
  operation (meta: EntryMeta) {
    if (this.opts.extNames.includes(meta.extDeep)) {
      const location = path.relative(meta.outDir, meta.entryPath)
      this.entrypoints[meta.nameDeep] = location
    }
  }
  async writeManifest () {
    const location = path.join(this.outDir, `manifest.ts`)
    const content = getManifestFile(this.entrypoints)
    await Deno.writeTextFile(location, content)
  }
  async writeMain () {
    const staticDir = this.outDirStatic
    const serverDep = this.opts.serverDep
    const main = getMainFile({ serverDep, staticDir })
    await Deno.writeTextFile(path.join(this.outDir, `main.ts`), main)
  }
  async finalize(): Promise<void> {
    await Promise.all([
      this.writeMain(),
      this.writeManifest()
    ])
  }
}
