module.exports = {
  root: true,
  extends: '@react-native',
  parserOptions: {
    // Let the editor parse JS files even when its ESLint working directory is
    // the parent monorepo instead of this React Native package.
    requireConfigFile: false,
  },
  rules: {
    // Formatting is prettier's job; inline styles are deliberate for one-off layout.
    'prettier/prettier': 'off',
    quotes: 'off',
    semi: 'off',
    'react-native/no-inline-styles': 'off',
    curly: 'off',
  },
};
