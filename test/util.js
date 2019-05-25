import path from 'path';
import test from 'ava';
import util from '../util';
import packageJson from '../package';

const buildPackageFilepath = fixture => path.join(__dirname, 'fixtures', 'load-config', fixture, 'package.json');

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

test('finds config in package.json', t => {
	const config = util.getAvaConfig(buildPackageFilepath('package-only'));
	t.is(config.failFast, true);
});

test('returns an empty object if both configs are present', t => {
	t.deepEqual(util.getAvaConfig(buildPackageFilepath('package-yes-file-yes')), {});
});

test('loads config from file with `export default` syntax', t => {
	const config = util.getAvaConfig(buildPackageFilepath('package-no-file-yes'));
	t.is(config.files, 'config-file-esm-test-value');
});

test('loads config from factory function', t => {
	const config = util.getAvaConfig(buildPackageFilepath('package-no-file-yes-factory'));
	t.true(config.files.startsWith(__dirname));
});

test('returns an empty object if a config factory returns a promise', t => {
	t.deepEqual(util.getAvaConfig(buildPackageFilepath('factory-no-promise-return')), {});
});

test('returns an empty object if a config exports a promise', t => {
	t.deepEqual(util.getAvaConfig(buildPackageFilepath('no-promise-config')), {});
});

test('returns an empty object if a config factory does not return a plain object', t => {
	t.deepEqual(util.getAvaConfig(buildPackageFilepath('factory-no-plain-return')), {});
});

test('returns an empty object if a config does not export a plain object', t => {
	t.deepEqual(util.getAvaConfig(buildPackageFilepath('no-plain-config')), {});
});

test('returns an empty object if the ava.config.js file throws', t => {
	t.deepEqual(util.getAvaConfig(buildPackageFilepath('throws')), {});
});

test('returns an empty object if a config file has no default export', t => {
	t.deepEqual(util.getAvaConfig(buildPackageFilepath('no-default-export')), {});
});
