import { rollup } from "rollup";

import rollupConfig from "./rollup.config.js";

(async () => {
  const bundle = await rollup(rollupConfig);
  await bundle.write(rollupConfig.output);
})();
