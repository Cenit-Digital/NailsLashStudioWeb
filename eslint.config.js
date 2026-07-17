import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  // `.experimentos-tmp` es scratch gitignored: la genera `trampas-del-horneado.test.tsx` (builds SSG
  // efímeros) y la dejó la verificación previa de F-06. Como `dist`/`.stryker-tmp`, no se lintea.
  { ignores: ['dist', 'coverage', 'reports', '.stryker-tmp', '.experimentos-tmp', 'node_modules', 'design'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
)
