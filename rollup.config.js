import commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";
import copy from "rollup-plugin-copy";
import replace from "@rollup/plugin-replace";
import { babel } from "@rollup/plugin-babel";
import postcss from "rollup-plugin-postcss";
import { terser } from "rollup-plugin-terser";

const development = Boolean(process.env.ROLLUP_WATCH);

export default {
  input: "./src/index.js",
  output: {
    dir: "dist",
    format: "esm",
    sourcemap: development,
    plugins: [!development && terser()],
  },
  plugins: [
    replace({
      preventAssignment: false,
      "process.env.NODE_ENV": JSON.stringify(
        development ? "development" : "production"
      ),
    }),
    nodeResolve({ browser: true }),
    commonjs({
      include: ["node_modules/**"],
    }),
    babel({
      babelHelpers: "bundled",
      presets: ["@babel/preset-react"],
      plugins: [],
    }),
    postcss({
      modules: false,
      minimize: !development,
    }),
    copy({
      targets: [
        {
          src: "images",
          dest: "dist",
        },
        {
          src: "index.html",
          dest: "dist",
        },
      ],
    }),
  ],
};
