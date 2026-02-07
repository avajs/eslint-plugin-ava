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
