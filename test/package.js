'use strict';

const fs = require('fs');
const path = require('path');
const test = require('ava');
const pify = require('pify');
const index = require('..');

let ruleFiles;

test.before(async () => {
	const files = await pify(fs.readdir)('rules');
	ruleFiles = files.filter(file => path.extname(file) === '.js');
});

const testSorted = (t, actualOrder, sourceName) => {
	const sortedOrder = [...actualOrder].sort();

	for (const [wantedIndex, name] of sortedOrder.entries()) {
		const actualIndex = actualOrder.indexOf(name);
		const whereMessage = (wantedIndex === 0) ? '' : `, after '${sortedOrder[wantedIndex - 1]}'`;
		t.is(actualIndex, wantedIndex, `${sourceName} should be alphabetically sorted, '${name}' should be placed at index ${wantedIndex}${whereMessage}`);
	}
};

test('Every rule is defined in index file in alphabetical order', t => {
	for (const file of ruleFiles) {
		const name = path.basename(file, '.js');

		// Ignoring tests for no-ignored-test-files
		if (name === 'no-ignored-test-files') {
			return;
		}

		t.truthy(index.rules[name], `'${name}' is not exported in 'index.js'`);
		t.truthy(index.configs.recommended.rules[`ava/${name}`], `'${name}' is not set in the recommended config`);
		t.truthy(fs.existsSync(path.join('docs/rules', `${name}.md`)), `There is no documentation for '${name}'`);
		t.truthy(fs.existsSync(path.join('test', file)), `There are no tests for '${name}'`);
	}

	t.is(Object.keys(index.rules).length, ruleFiles.length,
		'There are more exported rules than rule files.');
	t.is(Object.keys(index.configs.recommended.rules).length, ruleFiles.length,
		'There are more exported rules in the recommended config than rule files.');

	testSorted(t, Object.keys(index.configs.recommended.rules), 'configs.recommended.rules');
});
