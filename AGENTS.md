# Project Instructions

- We only target ESM. Do not add or maintain CommonJS (`require`/`module.exports`) code paths or tests.

`../eslint-node-test` ports and adapts rules from this plugin for the Node.js built-in test runner. When adding or fixing a rule here, consider whether the equivalent should be ported over there. Its `rules/utils/`, `rules/ast/`, and `rules/fix/` directories are also worth checking before adding a helper to `util.js`, since some started as ports of helpers from here.
