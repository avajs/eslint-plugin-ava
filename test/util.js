import {createRequire} from 'node:module';
import test from 'ava';
import util from '../util.js';

const require = createRequire(import.meta.url);
const packageJson = require('../package.json');

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
	t.is(util.getDocsUrl(import.meta.filename), url);
});
