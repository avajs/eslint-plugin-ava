import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {test} from 'node:test';
import index from '../index.js';

const ruleFiles = fs.readdirSync('rules').filter(file => path.extname(file) === '.js');

const testSorted = (actualOrder, sourceName) => {
	const sortedOrder = actualOrder.toSorted((a, b) => a.localeCompare(b));

	for (const [wantedIndex, name] of sortedOrder.entries()) {
		const actualIndex = actualOrder.indexOf(name);
		const whereMessage = (wantedIndex === 0) ? '' : `, after '${sortedOrder[wantedIndex - 1]}'`;
		assert.equal(actualIndex, wantedIndex, `${sourceName} should be alphabetically sorted, '${name}' should be placed at index ${wantedIndex}${whereMessage}`);
	}
};

test('Every rule is defined in index file in alphabetical order', () => {
	const allRecommendedRules = Object.assign(
		{},
		...index.configs.recommended.map(config => config.rules),
	);

	for (const file of ruleFiles) {
		const name = path.basename(file, '.js');

		// Ignoring tests for no-ignored-test-files
		if (name === 'no-ignored-test-files') {
			continue;
		}

		assert.ok(index.rules[name], `'${name}' is not exported in 'index.js'`);
		assert.ok(allRecommendedRules[`ava/${name}`], `'${name}' is not set in the recommended config`);
		assert.ok(fs.existsSync(path.join('docs/rules', `${name}.md`)), `There is no documentation for '${name}'`);
		assert.ok(fs.existsSync(path.join('test', file)), `There are no tests for '${name}'`);
	}

	assert.equal(Object.keys(index.rules).length, ruleFiles.length, 'There are more exported rules than rule files.');
	assert.equal(Object.keys(allRecommendedRules).length, ruleFiles.length, 'There are more exported rules in the recommended config than rule files.');

	for (const config of index.configs.recommended) {
		testSorted(Object.keys(config.rules), 'configs.recommended.rules');
	}
});
