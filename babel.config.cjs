module.exports = {
  env: {
    test: {
      presets: ["@babel/preset-react", "@babel/preset-env"],
      plugins: ["@babel/plugin-transform-runtime"],
    },
  },
};