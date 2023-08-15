import { serveFoldersHandler } from "./mod.ts";
import { parse } from "https://deno.land/std@0.198.0/flags/mod.ts";

const flags = parse(Deno.args, {
  collect: ['_'],
  string: ["_", "port"]
})

const port = flags.port ? parseInt(flags.port) : 8000

Deno.serve({ port }, serveFoldersHandler(flags._))