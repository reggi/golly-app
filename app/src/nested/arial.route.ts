
export default (req: Request): Response => {
  return Response.json({ meow: true }, {
    headers: {
      "content-type": "text/plain",
    }
  })
}