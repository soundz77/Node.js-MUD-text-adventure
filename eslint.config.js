import globals from "globals";
import pluginJs from "@eslint/js";

export default [
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      ecmaVersion: 12, // Allows for the parsing of modern ECMAScript features
    },
  },
  pluginJs.configs.recommended,
];
