# Waiter

Waitier is a simple static HTTP server.

## Features

* Allows for multiple static directories
* Resolves indexes via allow-list (default: `["index.html", "index.js"]`)
* Redirects to directories appending `/` to allow for relative HTML `src` / `hrefs`

## Programatic use

You can use it as a catch all to serve folders.

```ts
import { serveFolders } from "../script/serve_folders/mod.ts";
import manifest from './manifest.ts'

type ManifestType = {
  [key: string]: (req: Request) => Promise<Response>;
};

const nerfedManifest: ManifestType = manifest

Deno.serve((req) => {
  const url = new URL(req.url)
  const path = url.pathname

  if (path in nerfedManifest) {
    const file = nerfedManifest[path]
    return file(req)
  }

  return serveFolders(['./dist/static'], req)
})
```

## Serve handler 

```ts
import { serveFoldersHandler } from "./mod.ts";
Deno.serve(serveFoldersHandler(Deno.args))
```

## CLI Use

```sh
deno run --allow-net --allow-read ./projects/waiter/bin.ts ./projects/waiter
deno run --allow-net --allow-read ./projects/waiter/bin.ts --port 3000 ./projects/waiter
```
