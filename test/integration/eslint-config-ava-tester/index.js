'use strict';

module.exports = {
	root: true,
	parser: '@babel/eslint-parser',
	parserOptions: {
		requireConfigFile: false,
		babelOptions: {
			babelrc: false,
			configFile: false,
		},
	},
	plugins: [
		'ava',
	],
	extends: 'plugin:ava/recommended',
};
