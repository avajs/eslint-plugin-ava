import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import test from 'ava';
import resolveFrom from 'resolve-from';
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

test.serial('loadAvaHelper retries lookup when helper becomes available', async t => {
	const fixtureRootDirectory = await fs.mkdtemp(path.join(import.meta.dirname, 'tmp-load-ava-helper-'));
	t.teardown(async () => {
		await fs.rm(fixtureRootDirectory, {recursive: true, force: true});
	});

	const testFilename = path.join(fixtureRootDirectory, 'example.test.js');
	await fs.writeFile(path.join(fixtureRootDirectory, 'package.json'), '{"name":"fixture"}');
	await fs.writeFile(testFilename, '');

	const overrides = {files: ['test.js']};
	const helperPath = path.join(fixtureRootDirectory, 'eslint-plugin-helper.js');
	await fs.writeFile(helperPath, 'module.exports = {load(rootDirectory, options) { return {rootDirectory, options}; }};');

	const originalResolveFromSilent = resolveFrom.silent;
	let numberOfResolveCalls = 0;
	resolveFrom.silent = () => {
		numberOfResolveCalls += 1;
		return numberOfResolveCalls === 1 ? undefined : helperPath;
	};

	t.teardown(() => {
		resolveFrom.silent = originalResolveFromSilent;
	});

	t.is(util.loadAvaHelper(testFilename, overrides), undefined);

	const helper = util.loadAvaHelper(testFilename, overrides);
	t.is(numberOfResolveCalls, 2);
	t.deepEqual(helper, {rootDirectory: fixtureRootDirectory, options: overrides});
});
