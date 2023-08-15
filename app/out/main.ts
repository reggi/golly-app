import { serveFolders } from "../../projects/waiter/mod.ts"
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
  return serveFolders(['app/out/static'], req)
})