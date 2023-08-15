import { BehestEsbuild } from "../projects/behest_esbuild/mod.ts";
import { BehestMove } from "../projects/behest_move/mod.ts";
import { BehestRoute } from "../projects/behest_route/mod.ts";
import { BehestTwindJSON } from "../projects/behest_twind_json/mod.ts";
import { build } from "../projects/behest/mod.ts";
import { BehestSchema } from "../projects/behest_schema/mod.ts";

const srcDir = 'app/src'
const outDir = 'app/out'

await build({ srcDir, outDir }, [
  new BehestTwindJSON({ extNames: ['.tailwind.json'] }),
  new BehestEsbuild({ extNames: ['.ts', '.tsx'] }),
  new BehestMove({ extNames: ['.html', '.schema.json', '.json'] }),
  new BehestRoute({ extNames: ['.route.ts'], serverDep: "../../projects/waiter/mod.ts" }),
  new BehestSchema({ extNames: ['.schema.json'] })
])