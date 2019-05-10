'use strict';
module.exports = {
	parser: 'babel-eslint',
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
