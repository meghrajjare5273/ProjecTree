import {
  createSystem,
  defaultConfig,
  defineConfig,
  mergeConfigs,
} from "@chakra-ui/react";

// Define the custom theme configuration
const theme = defineConfig({
  theme: {
    recipes: {
      Button: {
        variants: {
          variant: {
            custom: {
              borderRadius: "full",
              bg: "blue",
              color: "white",
              textTransform: "uppercase",
            },
          },
        },
      },
      global: {
        base: {
          margin: 0,
          padding: 0,
        },
      },
    },
  },
});

// Extend the default theme by merging configurations
const config = mergeConfigs(defaultConfig, theme);

// Create the system with the merged configuration
const system = createSystem(config);

export default system;
