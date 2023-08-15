import { getHTML } from "../../../projects/behest_schema/mod.ts"
import { reqFormParser } from "../../../projects/form_parser/mod.ts"
import schema from './custom-array.schema.json' assert { type: 'json' }

export default async (req: Request): Promise<Response> => {
  const value = await reqFormParser(req)
  const html = getHTML(schema, 'custom-array', value)
  return new Response(html, {
    headers: {
      "content-type": "text/html",
    }
  })
}