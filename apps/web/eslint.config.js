import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { globalIgnores } from 'eslint/config'

const restrictedDirectApiFetchSyntax = [
  {
    selector:
      'CallExpression[callee.name="fetch"][arguments.0.type="Literal"][arguments.0.value=/^\\/api(\\/|$)/]',
    message:
      'Use requestApi(...) de src/lib/utils/http para chamadas da API.',
  },
  {
    selector:
      'CallExpression[callee.name="fetch"][arguments.0.type="TemplateLiteral"][arguments.0.quasis.0.value.raw=/^\\/api(\\/|$)/]',
    message:
      'Use requestApi(...) de src/lib/utils/http para chamadas da API.',
  },
  {
    selector:
      'CallExpression[callee.object.name="window"][callee.property.name="fetch"][arguments.0.type="Literal"][arguments.0.value=/^\\/api(\\/|$)/]',
    message:
      'Use requestApi(...) de src/lib/utils/http para chamadas da API.',
  },
  {
    selector:
      'CallExpression[callee.object.name="window"][callee.property.name="fetch"][arguments.0.type="TemplateLiteral"][arguments.0.quasis.0.value.raw=/^\\/api(\\/|$)/]',
    message:
      'Use requestApi(...) de src/lib/utils/http para chamadas da API.',
  },
]

const restrictedPresentationTypeSyntax = [
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
]

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
    rules: {
      'no-restricted-syntax': ['error', ...restrictedDirectApiFetchSyntax],
    },
  },
  {
    files: ['components/**/*.{ts,tsx}', 'pages/**/*.{ts,tsx}'],
    ignores: ['**/ui.types.ts'],
    rules: {
      'no-restricted-syntax': [
        'error',
        ...restrictedDirectApiFetchSyntax,
        ...restrictedPresentationTypeSyntax,
      ],
    },
  },
])
