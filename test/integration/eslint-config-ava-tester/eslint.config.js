import avaPlugin from 'eslint-plugin-ava';
import typescriptParser from '@typescript-eslint/parser';

export default [
	avaPlugin.configs.recommended,
	{
		files: ['**/*.ts'],
		languageOptions: {
			parser: typescriptParser,
		},
	},
];
