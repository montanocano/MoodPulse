module.exports = function (api) {
  api.cache(true);

  const isTest =
    process.env.BABEL_ENV === "test" || process.env.NODE_ENV === "test";

  return {
    presets: ["babel-preset-expo"],
    plugins: isTest
      ? []
      : [
          [
            "@tamagui/babel-plugin",
            {
              components: ["tamagui"],
              config: "./src/shared/ui/theme/tamagui.config.ts",
              logTimings: true,
              disableExtraction: process.env.NODE_ENV === "development",
            },
          ],
          "react-native-reanimated/plugin",
        ],
  };
};
