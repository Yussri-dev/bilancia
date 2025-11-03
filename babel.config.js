module.exports = function (api) {
    api.cache(true);
    return {
        presets: ["babel-preset-expo"],
        plugins: [
            [
                "module-resolver",
                {
                    root: ["./"],
                    alias: {
                        "@api": "./src/api",
                        "@apiClient": "./src/api/apiClient.js",
                        "@screens": "./src/screens",
                        "@components": "./src/components",
                        "@contexts": "./src/contexts",
                        "@theme": "./src/theme",
                        "@assets": "./assets"
                    },
                },
            ],
            "react-native-reanimated/plugin",
        ],
    };
};
