import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { globalIgnores } from 'eslint/config'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
  {
    files: ['components/**/*.{ts,tsx}', 'pages/**/*.{ts,tsx}'],
    ignores: ['**/ui.types.ts'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'TSInterfaceDeclaration',
          message:
            'Declare tipos de apresentação em ui.types.ts e importe no componente/página.',
        },
        {
          selector: 'TSTypeAliasDeclaration',
          message:
            'Declare tipos de apresentação em ui.types.ts e importe no componente/página.',
        },
      ],
    },
  },
])
