import firebaseRulesPlugin from '@firebase/eslint-plugin-security-rules';

export default [
  {
    ignores: ['dist/**/*']
  },
  // Apply flat config recommended by the plugin
  firebaseRulesPlugin.configs['flat/recommended']
];
