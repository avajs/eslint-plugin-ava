'use strict';
module.exports = {
	parser: '@babel/eslint-parser',
	parserOptions: {
		ecmaFeatures: {
			jsx: true
		}
	},
	plugins: [
		'ava'
	],
	extends: 'plugin:ava/recommended'
};
