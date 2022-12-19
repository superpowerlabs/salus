module.exports = {
  useTabs: false,
  printWidth: 128,
  tabWidth: 2,
  overrides: [
    {
      files: "*.sol",
      options: {
        printWidth: 80,
        tabWidth: 4,
        useTabs: false,
        singleQuote: false,
        bracketSpacing: false,
      },
    },
  ],
};
