import manifestItem1 from "../src/nested/arial.route.ts"
import manifestItem2 from "../src/example.route.ts"
import manifestItem3 from "../src/json-schema/custom-array-schema.route.ts"

export default {
  "/nested/arial": manifestItem1,
  "/example": manifestItem2,
  "/json-schema/custom-array-schema": manifestItem3,
}
