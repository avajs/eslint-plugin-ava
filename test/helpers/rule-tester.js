import path from 'node:path';
import test from 'ava';
import AvaRuleTester from 'eslint-ava-rule-tester';

const header = 'import test from \'ava\';\n';

function addHeaderToCase(testCase) {
	if (typeof testCase === 'string') {
		return header + testCase;
	}

	if (testCase.noHeader) {
		const {noHeader, ...rest} = testCase;
		return rest;
	}

	const result = {...testCase, code: header + testCase.code};

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

export default class RuleTester extends AvaRuleTester {
	#autoHeader;

	constructor({autoHeader, ...config} = {}) {
		super(test, {
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
				valid: tests.valid.map(testCase => addHeaderToCase(testCase)),
				invalid: tests.invalid.map(testCase => addHeaderToCase(testCase)),
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
