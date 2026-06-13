import assert from 'node:assert/strict';
import {test} from 'node:test';
import {Linter} from 'eslint';
import plugin from '../index.js';

test('recommended config reports and fixes AVA in package.json dependencies', () => {
	const linter = new Linter();
	const code = '{"dependencies":{"ava":"^6.0.0"}}';
	const output = '{"devDependencies":{"ava":"^6.0.0"}}';

	for (const filename of ['package.json', 'packages/example/package.json']) {
		const messages = linter.verify(code, plugin.configs.recommended, {filename});
		assert.deepEqual(messages.map(message => message.ruleId), ['ava/no-ava-in-dependencies']);
		assert.deepEqual(linter.verifyAndFix(code, plugin.configs.recommended, {filename}), {
			fixed: true,
			messages: [],
			output,
		});
	}
});
