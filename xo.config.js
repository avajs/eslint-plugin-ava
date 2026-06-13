import eslintPlugin from 'eslint-plugin-eslint-plugin';

export default [
	{
		ignores: [
			'test/integration/**',
		],
	},
	{
		rules: {
			'ava/no-ignored-test-files': 'off',
			// This package's rule modules are named after AVA rules, so `no-skip-test.js`, `no-todo-test.js` and `use-test.js` all end in `-test` and read as test files. The shared `RuleTester` helper also lives under `test/`, which the rule treats as a test file.
			'node-test/no-import-test-files': 'off',
			// `test/helpers/rule-tester.js` is a shared helper, but the rule assumes every file in a `test` directory is a test file.
			'node-test/no-export': 'off',
			// The suite asserts through `node:assert/strict`. `t.assert` only exists from Node.js 22.3, so it cannot be used with an `engines.node` floor of 22.
			'node-test/prefer-test-context-assert': 'off',
			// The rule test tables assert inside a `for` loop over the case list, which is what the tables are for. The assertion is not conditional on the input, only on the loop running.
			'node-test/no-conditional-assertion': 'off',
			// Doc comments here are deliberately one-line `/** … */` blocks; converting them to `//` would break the house style.
			'unicorn/single-line-block-comment-style': 'off',
			// No JSDoc in this repository declares `@param` tags. The parameter names are already in the signature.
			'jsdoc/require-param': 'off',
			// Rewriting the visitor bodies in `rules/*.js` and `util.js` from `if`/`return` into ternaries and combined guards changes shipped rule logic for no gain. These are style rules, left off deliberately rather than churning published source.
			'unicorn/prefer-ternary': 'off',
			'unicorn/prefer-early-return': 'off',
			'unicorn/prefer-combined-guards': 'off',
			'unicorn/prefer-simple-condition-first': 'off',
			'unicorn/prefer-minimal-ternary': 'off',
			'unicorn/prefer-continue': 'off',
			'unicorn/no-break-in-nested-loop': 'off',
			'unicorn/no-negated-array-predicate': 'off',
			'unicorn/prefer-includes-over-repeated-comparisons': 'off',
			'unicorn/no-immediate-mutation': 'off',
			'unicorn/no-declarations-before-early-exit': 'off',
			'unicorn/no-computed-property-existence-check': 'off',
			'unicorn/no-subtraction-comparison': 'off',
			// Recursive visitors over the AST are clearer than the equivalent loop, and `prefer-async-await` relies on this shape.
			'unicorn/no-useless-recursion': 'off',
			// `index.js` assigns `plugin.configs` after building `plugin`, because the recommended configs reference the plugin object itself. That self-reference cannot be expressed inside the object literal.
			'unicorn/no-top-level-side-effects': 'off',
			// The existing `eslint-disable` comments are file-scoped and self-explanatory; they are not per-configuration.
			'@eslint-community/eslint-comments/require-description': 'off',
			'import-x/extensions': 'off',
			'import-x/no-anonymous-default-export': 'off',
			'import-x/order': 'off',
		},
	},
	{
		files: [
			'rules/*.js',
			'create-ava-rule.js',
			'util.js',
			'index.js',
		],
		plugins: {
			'eslint-plugin': eslintPlugin,
		},
		rules: {
			...eslintPlugin.configs.all.rules,
			'eslint-plugin/require-meta-docs-description': ['error', {
				pattern: '^(Enforce|Require|Disallow|Prefer|Limit)',
			}],
			// These two have to be turned off here rather than in the shared block above, because
			// `configs.all.rules` is spread into this same object and would otherwise re-enable them
			// for exactly these files. Not recommended upstream: `require-meta-languages` only accepts
			// `'*'` or `'namespace/language'` and every rule here is plain JavaScript, and the
			// `type: 'array'` schemas take glob patterns and are deliberately left untyped.
			'eslint-plugin/require-meta-languages': 'off',
			'eslint-plugin/no-incomplete-meta-schema': 'off',
		},
	},
	{
		files: ['create-ava-rule.js'],
		rules: {
			'eslint-plugin/require-meta-docs-url': 'off',
			'unicorn/no-anonymous-default-export': 'off',
		},
	},
];
