import path from 'node:path'
import { walk } from "https://deno.land/std@0.197.0/fs/walk.ts";

/** for filename like meow.schema.json returns .schema.json */
export function getDeepExt(filename: string) {
  const parts = filename.split('.');
  if (parts.length > 2) {
    return '.' + parts.slice(1).join('.');
  }
  return path.extname(filename);
}

export async function ensureDir (directory: string) {
  try {
    await Deno.mkdirSync(directory, { recursive: true });
  } catch (_e) {
    // noop
  }
}

export function getEntryMeta (props: BuildInput, entry: { name: string, path: string }) {
  const { outDir, srcDir } = props
  const entryName = entry.name
  const entryPath = entry.path
  const ext = path.extname(entry.name);
  const extDeep = getDeepExt(entry.name)
  const relativePath = path.relative(props.srcDir, entry.path)
  const core = path.basename(relativePath, ext)
  const coreDeep = path.basename(relativePath, extDeep)
  const dirname = path.dirname(relativePath)
  const name = path.join(dirname, core)
  const nameDeep = path.join(dirname, coreDeep)
  const outDirStatic = path.join(props.outDir, 'static')
  const outStaticProjection = path.join(outDirStatic, relativePath)
  const outProjection = path.join(outDirStatic, relativePath)
  const outStaticProjectionDirname = path.dirname(outStaticProjection)
  const outProjectionDirname = path.dirname(outProjection)
  return {
    srcDir, relativePath, dirname,
    entryName, entryPath,
    outDir, outDirStatic,
    outProjection, outStaticProjection,
    ext, extDeep,
    core, coreDeep, 
    name, nameDeep,
    outStaticProjectionDirname, outProjectionDirname
  }
}

export const walkDirectory = async (props: BuildInputInternal, callback: EntryCalback) => {
  await ensureDir(props.outDirStatic)
  for await (const entry of walk(props.srcDir)) {
    if (entry.isFile) {
      const meta = getEntryMeta(props, entry)
      await callback(meta)
    }
  }
}

export type EntryMeta = ReturnType<typeof getEntryMeta>

export type BuildInput = {
  srcDir: string,
  outDir: string,
}

export type BuildInputInternal = BuildInput & {
  outDirStatic: string,
}

export type EntryCalback = ((meta: EntryMeta) => void)
export type PluginOne = (cb: EntryCalback) => Promise<BuildInput & { outDirStatic: string }>
export type Plugin = (cb: PluginOne) => void

export interface IPlugin<T = unknown> {
  init: (props: { srcDir: string, outDir: string, outDirStatic: string }) => void;
  opts: { extNames: string[] } & T
  operation(meta: EntryMeta): void;
  finalize(): Promise<void>;
}

export abstract class PluginAbstract<T = unknown> implements IPlugin<T> {
  constructor (public opts: { extNames: string[] } & T) {}
  _srcDir?: string
  _outDir?: string
  _outDirStatic?: string
  init (props: { srcDir: string, outDir: string, outDirStatic: string }) {
    this._srcDir = props.srcDir
    this._outDir = props.outDir
    this._outDirStatic = props.outDirStatic
  }
  get srcDir () {
    if (this._srcDir === undefined) {
      throw new Error('srcDir is undefined')
    }
    return this._srcDir
  }
  get outDir () {
    if (this._outDir === undefined) {
      throw new Error('outDir is undefined')
    }
    return this._outDir
  }
  get outDirStatic () {
    if (this._outDirStatic === undefined) {
      throw new Error('outDirStatic is undefined')
    }
    return this._outDirStatic
  }
  abstract operation(meta: EntryMeta): void;
  abstract finalize(): Promise<void>;
}

class Plugins {
  constructor (public plugins: IPlugin[]) {}
  async loop (cb: (plugin: IPlugin) => void) {
    await Promise.all(this.plugins.map(async plugin => {
      return await cb(plugin)
    }))
  }
}

export async function build (props: BuildInput, plugins: IPlugin[]) {
  const P = new Plugins(plugins)
  const outDirStatic = path.join(props.outDir, 'static')
  await P.loop(plugin => plugin.init({ ...props, outDirStatic }))
  await walkDirectory({ ...props, outDirStatic }, async (meta) => {
    await P.loop(plugin => plugin.operation(meta))
  })
  await P.loop(plugin => plugin.finalize())
}
