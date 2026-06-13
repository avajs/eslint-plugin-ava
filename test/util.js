import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import {test} from 'node:test';
import resolveFrom from 'resolve-from';
import util, {findProjectRoot} from '../util.js';

test('getStringValue: returns string literal value', () => {
	assert.equal(util.getStringValue({type: 'Literal', value: 'hello'}), 'hello');
});

test('getStringValue: returns template literal string when no expressions', () => {
	const node = {type: 'TemplateLiteral', expressions: [], quasis: [{value: {cooked: 'hello'}}]};
	assert.equal(util.getStringValue(node), 'hello');
});

test('getStringValue: returns undefined for template literal with null cooked value', () => {
	const node = {type: 'TemplateLiteral', expressions: [], quasis: [{value: {cooked: null}}]};
	assert.equal(util.getStringValue(node), undefined);
});

test('getStringValue: returns undefined for template literal with expressions', () => {
	const node = {type: 'TemplateLiteral', expressions: [{}], quasis: []};
	assert.equal(util.getStringValue(node), undefined);
});

test('getStringValue: returns undefined for non-string literal', () => {
	assert.equal(util.getStringValue({type: 'Literal', value: 42}), undefined);
});

test('unwrapParentTypeExpression: skips TypeScript wrapper parents', () => {
	const callExpression = {type: 'CallExpression'};
	const tsAsExpression = {type: 'TSAsExpression', parent: {type: 'ExpressionStatement'}};
	const tsNonNullExpression = {type: 'TSNonNullExpression', parent: tsAsExpression};
	callExpression.parent = tsNonNullExpression;

	assert.equal(util.unwrapParentTypeExpression(callExpression), tsAsExpression.parent);
});

test('returns the URL of the a named rule\'s documentation', () => {
	const url = 'https://github.com/avajs/eslint-plugin-ava/blob/main/docs/rules/foo.md';
	assert.equal(util.getDocsUrl('foo.js'), url);
});

test('determines the rule name from the file', () => {
	const url = 'https://github.com/avajs/eslint-plugin-ava/blob/main/docs/rules/util.md';
	assert.equal(util.getDocsUrl(import.meta.filename), url);
});

test('loadAvaHelper retries lookup when helper becomes available', async t => {
	const fixtureRootDirectory = await fs.mkdtemp(path.join(import.meta.dirname, 'tmp-load-ava-helper-'));
	t.after(async () => {
		await fs.rm(fixtureRootDirectory, {recursive: true, force: true});
	});

	const testFilename = path.join(fixtureRootDirectory, 'example.test.js');
	await fs.writeFile(path.join(fixtureRootDirectory, 'package.json'), '{"name":"fixture","ava":{}}');
	await fs.writeFile(testFilename, '');

	const overrides = {files: ['test.js']};
	const helperPath = path.join(fixtureRootDirectory, 'eslint-plugin-helper.js');
	await fs.writeFile(helperPath, 'exports.load = (rootDirectory, options) => ({rootDirectory, options});');

	const originalResolveFromSilent = resolveFrom.silent;
	let isHelperAvailable = false;
	resolveFrom.silent = () => isHelperAvailable ? helperPath : undefined;

	t.after(() => {
		resolveFrom.silent = originalResolveFromSilent;
	});

	assert.equal(util.loadAvaHelper(testFilename, overrides), undefined);
	isHelperAvailable = true;

	const helper = util.loadAvaHelper(testFilename, overrides);
	assert.deepEqual(helper, {rootDirectory: fixtureRootDirectory, options: overrides});
});

test('loadAvaHelper resolves helper from sub-package when config is at workspace root', async t => {
	const workspaceRootDirectory = await fs.mkdtemp(path.join(import.meta.dirname, 'tmp-load-ava-helper-workspace-'));
	t.after(async () => {
		await fs.rm(workspaceRootDirectory, {recursive: true, force: true});
	});

	await fs.writeFile(path.join(workspaceRootDirectory, 'package.json'), '{"name":"workspace","ava":{}}');
	const packageDirectory = path.join(workspaceRootDirectory, 'packages', 'pkg-a');
	await fs.mkdir(packageDirectory, {recursive: true});
	await fs.writeFile(path.join(packageDirectory, 'package.json'), '{"name":"pkg-a"}');
	const testFilename = path.join(packageDirectory, 'test', 'example.test.js');
	await fs.mkdir(path.join(packageDirectory, 'test'), {recursive: true});
	await fs.writeFile(testFilename, '');

	const helperPath = path.join(workspaceRootDirectory, 'eslint-plugin-helper.js');
	await fs.writeFile(helperPath, 'exports.load = (rootDirectory, options) => ({rootDirectory, options});');

	const originalResolveFromSilent = resolveFrom.silent;
	resolveFrom.silent = fromDirectory => {
		if (fromDirectory === workspaceRootDirectory) {
			return undefined;
		}

		return fromDirectory.startsWith(packageDirectory) ? helperPath : undefined;
	};

	t.after(() => {
		resolveFrom.silent = originalResolveFromSilent;
	});

	const overrides = {files: ['test.js']};
	const helper = util.loadAvaHelper(testFilename, overrides);
	assert.deepEqual(helper, {rootDirectory: workspaceRootDirectory, options: overrides});
});

test('loadAvaHelper resolves hoisted helper outside sub-package root', async t => {
	const workspaceRootDirectory = await fs.mkdtemp(path.join(import.meta.dirname, 'tmp-load-ava-helper-hoisted-'));
	t.after(async () => {
		await fs.rm(workspaceRootDirectory, {recursive: true, force: true});
	});

	// Sub-package has its own AVA config, but AVA is hoisted to the monorepo root.
	await fs.writeFile(path.join(workspaceRootDirectory, 'package.json'), '{"name":"workspace"}');
	const packageDirectory = path.join(workspaceRootDirectory, 'packages', 'pkg-a');
	await fs.mkdir(packageDirectory, {recursive: true});
	await fs.writeFile(path.join(packageDirectory, 'package.json'), '{"name":"pkg-a","ava":{}}');
	const testFilename = path.join(packageDirectory, 'test', 'example.test.js');
	await fs.mkdir(path.join(packageDirectory, 'test'), {recursive: true});
	await fs.writeFile(testFilename, '');

	// The helper lives at the workspace root (hoisted node_modules), outside the sub-package.
	const helperPath = path.join(workspaceRootDirectory, 'node_modules', 'ava', 'eslint-plugin-helper.js');
	await fs.mkdir(path.dirname(helperPath), {recursive: true});
	await fs.writeFile(helperPath, 'exports.load = (rootDirectory, options) => ({rootDirectory, options});');

	const originalResolveFromSilent = resolveFrom.silent;
	resolveFrom.silent = () => helperPath;

	t.after(() => {
		resolveFrom.silent = originalResolveFromSilent;
	});

	const overrides = {files: ['test.js']};
	const helper = util.loadAvaHelper(testFilename, overrides);
	assert.deepEqual(helper, {rootDirectory: packageDirectory, options: overrides});
});

const createFixtureDirectory = async t => {
	const directory = await fs.mkdtemp(path.join(import.meta.dirname, 'tmp-find-root-'));
	t.after(async () => {
		await fs.rm(directory, {recursive: true, force: true});
	});

	return directory;
};

test('findProjectRoot: finds directory with ava config in package.json', async t => {
	const root = await createFixtureDirectory(t);
	await fs.writeFile(path.join(root, 'package.json'), '{"name":"fixture","ava":{}}');
	const testFile = path.join(root, 'test', 'foo.test.js');
	await fs.mkdir(path.join(root, 'test'), {recursive: true});
	await fs.writeFile(testFile, '');

	assert.equal(findProjectRoot(testFile), root);
});

test('findProjectRoot: finds directory with ava.config.js', async t => {
	const root = await createFixtureDirectory(t);
	await fs.writeFile(path.join(root, 'package.json'), '{"name":"fixture"}');
	await fs.writeFile(path.join(root, 'ava.config.js'), '');
	const testFile = path.join(root, 'test', 'foo.test.js');
	await fs.mkdir(path.join(root, 'test'), {recursive: true});
	await fs.writeFile(testFile, '');

	assert.equal(findProjectRoot(testFile), root);
});

test('findProjectRoot: finds directory with ava.config.mjs', async t => {
	const root = await createFixtureDirectory(t);
	await fs.writeFile(path.join(root, 'package.json'), '{"name":"fixture"}');
	await fs.writeFile(path.join(root, 'ava.config.mjs'), '');
	const testFile = path.join(root, 'test', 'foo.test.js');
	await fs.mkdir(path.join(root, 'test'), {recursive: true});
	await fs.writeFile(testFile, '');

	assert.equal(findProjectRoot(testFile), root);
});

test('findProjectRoot: monorepo - finds root with ava config over sub-package', async t => {
	const root = await createFixtureDirectory(t);
	await fs.writeFile(path.join(root, 'package.json'), '{"name":"monorepo","ava":{}}');
	const packageDir = path.join(root, 'packages', 'pkg-a');
	await fs.mkdir(packageDir, {recursive: true});
	await fs.writeFile(path.join(packageDir, 'package.json'), '{"name":"pkg-a"}');
	const testFile = path.join(packageDir, 'test', 'foo.test.js');
	await fs.mkdir(path.join(packageDir, 'test'), {recursive: true});
	await fs.writeFile(testFile, '');

	assert.equal(findProjectRoot(testFile), root);
});

test('findProjectRoot: config file closer to file wins over package.json ava key higher up', async t => {
	const root = await createFixtureDirectory(t);
	await fs.writeFile(path.join(root, 'package.json'), '{"name":"monorepo","ava":{}}');
	const subDir = path.join(root, 'packages', 'pkg-a');
	await fs.mkdir(subDir, {recursive: true});
	await fs.writeFile(path.join(subDir, 'package.json'), '{"name":"pkg-a"}');
	await fs.writeFile(path.join(subDir, 'ava.config.js'), '');
	const testFile = path.join(subDir, 'test', 'foo.test.js');
	await fs.mkdir(path.join(subDir, 'test'), {recursive: true});
	await fs.writeFile(testFile, '');

	assert.equal(findProjectRoot(testFile), subDir);
});

test('findProjectRoot: skips package.json without ava key', async t => {
	const root = await createFixtureDirectory(t);
	await fs.writeFile(path.join(root, 'package.json'), '{"name":"fixture"}');
	await fs.mkdir(path.join(root, '.git'));
	const testFile = path.join(root, 'test', 'foo.test.js');
	await fs.mkdir(path.join(root, 'test'), {recursive: true});
	await fs.writeFile(testFile, '');

	// The fixture package.json has no "ava" key, but traversal should stop
	// at the repository boundary and return the nearest package root.
	const result = findProjectRoot(testFile);
	assert.equal(result, root);
});

test('findProjectRoot: does not escape repository boundary', async t => {
	const outsideDirectory = await createFixtureDirectory(t);
	await fs.writeFile(path.join(outsideDirectory, 'package.json'), '{"name":"outside","ava":{}}');
	await fs.writeFile(path.join(outsideDirectory, 'ava.config.js'), '');

	const root = path.join(outsideDirectory, 'project');
	await fs.mkdir(root, {recursive: true});
	await fs.mkdir(path.join(root, '.git'));
	await fs.writeFile(path.join(root, 'package.json'), '{"name":"fixture"}');
	const testFile = path.join(root, 'test', 'foo.test.js');
	await fs.mkdir(path.join(root, 'test'), {recursive: true});
	await fs.writeFile(testFile, '');

	assert.equal(findProjectRoot(testFile), root);
});

test('findProjectRoot: handles relative filename', async t => {
	const root = await createFixtureDirectory(t);
	await fs.writeFile(path.join(root, 'package.json'), '{"name":"fixture","ava":{}}');
	const testFile = path.join(root, 'test', 'foo.test.js');
	await fs.mkdir(path.join(root, 'test'), {recursive: true});
	await fs.writeFile(testFile, '');

	const relativeTestFile = path.relative(process.cwd(), testFile);
	assert.equal(findProjectRoot(relativeTestFile), root);
});
