module.exports = {
  preset: "jest-puppeteer",
  moduleNameMapper: {
    "\\.css$": "<rootDir>/src/__mocks__/styleMock.js",
  },
};
