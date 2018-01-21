import test from 'ava';
import util from '../util';

test('returns the URL of the a named rule\'s documentation', t => {
	const url = 'https://github.com/avajs/eslint-plugin-ava/blob/master/docs/rules/foo.md';
	t.is(util.getDocsUrl('foo'), url);
});

test('returns the URL of the a named rule\'s documentation at a commit hash', t => {
	const url = 'https://github.com/avajs/eslint-plugin-ava/blob/bar/docs/rules/foo.md';
	t.is(util.getDocsUrl('foo', 'bar'), url);
});

test('determines the rule name from the file', t => {
	const url = 'https://github.com/avajs/eslint-plugin-ava/blob/master/docs/rules/util.md';
	t.is(util.getDocsUrl(), url);
});
