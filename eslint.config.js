import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import react from 'eslint-plugin-react'

export default [
  { ignores: ['dist/**', 'node_modules/**'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.browser },
      parserOptions: { ecmaFeatures: { jsx: true } }
    },
    plugins: { 'react-hooks': reactHooks, react },
    rules: {
      ...js.configs.recommended.rules,
      // Las dos reglas clásicas de hooks. El resto del preset de la v7
      // marca patrones deliberados de este repo (la transición de fase
      // del pomodoro en un efecto, el ref «último valor» de los
      // modales), así que no se activan aquí.
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      // Sin esto, no-unused-vars no ve que un identificador se usa
      // dentro de JSX y da falsos positivos con los componentes.
      'react/jsx-uses-vars': 'error',
      // El repo importa React en cada componente; esta regla lo cuenta
      // como usado cuando el fichero contiene JSX.
      'react/jsx-uses-react': 'error',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }]
    }
  },
  {
    // El service worker corre fuera de la app, con su propio ámbito.
    files: ['public/sw.js'],
    languageOptions: { globals: { ...globals.serviceworker } }
  },
  {
    // Las pruebas corren en Node, no en el navegador. Sin esto, el lint
    // ni las miraba: son .mjs y el bloque de arriba solo coge .js/.jsx.
    files: ['test/**/*.mjs'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      // Node y navegador a la vez: las de Playwright corren en Node pero
      // los callbacks de page.evaluate se ejecutan dentro de la página.
      globals: { ...globals.node, ...globals.browser }
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      // Un catch vacío es deliberado en varios sitios: «inténtalo y si
      // no, sigue» (esperar a que levante el servidor, leer un fichero
      // que puede no estar).
      'no-empty': ['error', { allowEmptyCatch: true }]
    }
  }
]
