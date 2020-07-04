const test = require('ava');
const util = require('../util');
const packageJson = require('../package');

test('returns the URL of the a named rule\'s documentation', t => {
	const url = `https://github.com/avajs/eslint-plugin-ava/blob/v${packageJson.version}/docs/rules/foo.md`;
	t.is(util.getDocsUrl('foo.js'), url);
});

test('returns the URL of the a named rule\'s documentation at a commit hash', t => {
	const url = 'https://github.com/avajs/eslint-plugin-ava/blob/bar/docs/rules/foo.md';
	t.is(util.getDocsUrl('foo.js', 'bar'), url);
});

test('determines the rule name from the file', t => {
	const url = `https://github.com/avajs/eslint-plugin-ava/blob/v${packageJson.version}/docs/rules/util.md`;
	t.is(util.getDocsUrl(__filename), url);
});
