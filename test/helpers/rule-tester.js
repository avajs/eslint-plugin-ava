import assert from 'node:assert/strict';
import path from 'node:path';
import {test} from 'node:test';
import AvaRuleTester from 'eslint-ava-rule-tester';

const header = 'import test from \'ava\';\n';

function addHeaderToCase(scenario) {
	if (typeof scenario === 'string') {
		return header + scenario;
	}

	if (scenario.noHeader) {
		const {noHeader, ...rest} = scenario;
		return rest;
	}

	const result = {...scenario, code: header + scenario.code};

	if (typeof result.output === 'string') {
		result.output = header + result.output;
	}

	result.errors &&= result.errors.map(error => {
		if (!error.suggestions) {
			return error;
		}

		return {
			...error,
			suggestions: error.suggestions.map(suggestion => typeof suggestion.output === 'string'
				? {...suggestion, output: header + suggestion.output}
				: suggestion),
		};
	});

	return result;
}

const defaultConfig = {
	languageOptions: {
		ecmaVersion: 'latest',
		sourceType: 'module',
	},
};

/**
`eslint-ava-rule-tester` predates `node:test` and still calls the test function the AVA way: `test(title, t => …)`, with `t.pass()` on success and `t.is(actual, expected, message)` on a `strictEqual` assertion failure, always followed by a rethrow of the original error.

Only those two members are used, so the adapter stays that small.
*/
export function nodeTest(name, implementation) {
	test(name, () => {
		implementation({
			pass() {},
			is(actual, expected, message) {
				assert.equal(actual, expected, message);
			},
		});
	});
}

// `RuleTester` reads `test.only` when it is constructed, so it has to exist.
nodeTest.only = nodeTest;

export default class RuleTester extends AvaRuleTester {
	#autoHeader;

	constructor({autoHeader, ...config} = {}) {
		super(nodeTest, {
			...defaultConfig,
			...config,
			languageOptions: {
				...defaultConfig.languageOptions,
				...config.languageOptions,
			},
		});
		this.#autoHeader = autoHeader ?? true;
	}

	run(name, rule, tests) {
		const processed = this.#autoHeader
			? {
				valid: tests.valid.map(scenario => addHeaderToCase(scenario)),
				invalid: tests.invalid.map(scenario => addHeaderToCase(scenario)),
			}
			: {};

		return super.run(name, rule, {
			assertionOptions: {requireMessage: true},
			...tests,
			...processed,
		});
	}
}

export function testCase(contents) {
	return `test(t => { ${contents} });`;
}

export function asyncTestCase(contents) {
	return `test(async t => { ${contents} });`;
}

export const toPath = subPath => path.join(path.dirname(path.dirname(import.meta.dirname)), subPath);

export {header};
