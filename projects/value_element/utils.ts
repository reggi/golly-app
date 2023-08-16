export function getStringifyValue (value: any) {
  if (typeof value === "string") {
    return value
  } else if (typeof value === "object" || Array.isArray(value)) {
    return JSON.stringify(value)
  } else if (value && value.toString) {
    return value.toString()
  }
  return JSON.stringify(value)
}
