import nodePath from 'node:path'
import { typeByExtension } from "https://deno.land/std@0.197.0/media_types/type_by_extension.ts";
const {basename, dirname, extname, join} = nodePath

function determineContentType(filename: string): string {
  const extension = filename.split(".").pop();
  // if (extension === 'ts') return "application/javascript";
  if (!extension) return "text/plain";
  const value = typeByExtension(extension)
  if (value) return value
  return "text/plain";
}

async function exists (filePath: string) {
  try {
    const value = await Deno.stat(filePath);
    if (!value.isFile) throw new Error('not a file')
    return filePath; // File found, return full path
  } catch (_error) {
    return false
  }
}

async function findFileOrIndexInFolders(folders: string[], fileName: string, indexFiles: string[], ghostExt: string[]): Promise<string | null> {
  for (const folder of folders) {
    const filePath = join(folder, fileName);
    const exactExists = await exists(filePath)
    if (exactExists) return filePath
    for (const indexFile of indexFiles) {
      const base = basename(fileName)
      if (base === indexFile) {
        const ext = extname(indexFile)
        const filePath = dirname(join(folder, fileName)) + ext
        const withoutExt = await exists(filePath)
        if (withoutExt) return withoutExt  
      }
      const filePath = join(folder, fileName, indexFile)
      const indexExists = await exists(filePath)
      if (indexExists) return indexExists
    }
    for (const ghost of ghostExt) {
      const filePath = join(folder, fileName.replace(/\/$/, '') + ghost)
      const indexExists = await exists(filePath)
      if (indexExists) return indexExists
    }
  }
  return null
}

export const defaultIndexFiles = ["index.html", "index.js"]
export const defaultGhostExt = [".html"]

export const serveFolders = async (folders: string[], req: Request, indexFiles = defaultIndexFiles, ghostExt = defaultGhostExt) => {
  const url = new URL(req.url)
  const path = url.pathname;
  try {
    const match = await findFileOrIndexInFolders(folders, path, indexFiles, ghostExt)
    if (!match) throw new Error('File not found')
    if (match.endsWith('.html') && extname(path) !== '.html' && !path.endsWith('/')) {
      // this is so that relative assets work correctly
      return Response.redirect(req.url + '/')
    }
    const content = await Deno.readTextFile(match)
    return new Response(content, { headers: new Headers({ "Content-Type": determineContentType(extname(match)) }) });
  } catch (_error) {
    return new Response('File not found', { status: 404 });
  }
}

export const serveFoldersHandler = (folders: string[]) => {
  return (req: Request) => {
    return serveFolders(folders, req)
  }
}
