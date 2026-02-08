import {createRequire} from 'node:module';
import json from '@eslint/json';
import assertionArguments from './rules/assertion-arguments.js';
import failingTestUrl from './rules/failing-test-url.js';
import hooksOrder from './rules/hooks-order.js';
import maxAsserts from './rules/max-asserts.js';
import noAvaInDependencies from './rules/no-ava-in-dependencies.js';
import noAsyncFnWithoutAwait from './rules/no-async-fn-without-await.js';
import noCommentedTests from './rules/no-commented-tests.js';
import noDuplicateModifiers from './rules/no-duplicate-modifiers.js';
import noIdenticalTitle from './rules/no-identical-title.js';
import noIgnoredTestFiles from './rules/no-ignored-test-files.js';
import noImportTestFiles from './rules/no-import-test-files.js';
import noIncorrectDeepEqual from './rules/no-incorrect-deep-equal.js';
import noInlineAssertions from './rules/no-inline-assertions.js';
import noNestedAssertions from './rules/no-nested-assertions.js';
import noNestedTests from './rules/no-nested-tests.js';
import noOnlyTest from './rules/no-only-test.js';
import noSkipAssert from './rules/no-skip-assert.js';
import noSkipTest from './rules/no-skip-test.js';
import noTodoImplementation from './rules/no-todo-implementation.js';
import noTodoTest from './rules/no-todo-test.js';
import noUnknownModifiers from './rules/no-unknown-modifiers.js';
import noUselessTPass from './rules/no-useless-t-pass.js';
import preferAsyncAwait from './rules/prefer-async-await.js';
import preferPowerAssert from './rules/prefer-power-assert.js';
import preferTRegex from './rules/prefer-t-regex.js';
import preferTThrows from './rules/prefer-t-throws.js';
import testTitle from './rules/test-title.js';
import testTitleFormat from './rules/test-title-format.js';
import useT from './rules/use-t.js';
import useTThrowsAsyncWell from './rules/use-t-throws-async-well.js';
import useTWell from './rules/use-t-well.js';
import useTest from './rules/use-test.js';
import useTrueFalse from './rules/use-true-false.js';

const require = createRequire(import.meta.url);
const {name, version} = require('./package.json');

const rules = {
	'assertion-arguments': assertionArguments,
	'failing-test-url': failingTestUrl,
	'hooks-order': hooksOrder,
	'max-asserts': maxAsserts,
	'no-ava-in-dependencies': noAvaInDependencies,
	'no-async-fn-without-await': noAsyncFnWithoutAwait,
	'no-commented-tests': noCommentedTests,
	'no-duplicate-modifiers': noDuplicateModifiers,
	'no-identical-title': noIdenticalTitle,
	'no-ignored-test-files': noIgnoredTestFiles,
	'no-import-test-files': noImportTestFiles,
	'no-incorrect-deep-equal': noIncorrectDeepEqual,
	'no-inline-assertions': noInlineAssertions,
	'no-nested-assertions': noNestedAssertions,
	'no-nested-tests': noNestedTests,
	'no-only-test': noOnlyTest,
	'no-skip-assert': noSkipAssert,
	'no-skip-test': noSkipTest,
	'no-todo-implementation': noTodoImplementation,
	'no-todo-test': noTodoTest,
	'no-unknown-modifiers': noUnknownModifiers,
	'no-useless-t-pass': noUselessTPass,
	'prefer-async-await': preferAsyncAwait,
	'prefer-power-assert': preferPowerAssert,
	'prefer-t-regex': preferTRegex,
	'prefer-t-throws': preferTThrows,
	'test-title': testTitle,
	'test-title-format': testTitleFormat,
	'use-t': useT,
	'use-t-throws-async-well': useTThrowsAsyncWell,
	'use-t-well': useTWell,
	'use-test': useTest,
	'use-true-false': useTrueFalse,
};

const recommendedRules = {
	'ava/assertion-arguments': 'error',
	'ava/failing-test-url': 'off',
	'ava/hooks-order': 'error',
	'ava/max-asserts': [
		'off',
		5,
	],
	'ava/no-async-fn-without-await': 'error',
	'ava/no-commented-tests': 'warn',
	'ava/no-duplicate-modifiers': 'error',
	'ava/no-identical-title': 'error',
	'ava/no-ignored-test-files': 'error',
	'ava/no-import-test-files': 'error',
	'ava/no-incorrect-deep-equal': 'error',
	'ava/no-inline-assertions': 'error',
	'ava/no-nested-assertions': 'error',
	'ava/no-nested-tests': 'error',
	'ava/no-only-test': 'error',
	'ava/no-skip-assert': 'error',
	'ava/no-skip-test': 'error',
	'ava/no-todo-implementation': 'error',
	'ava/no-todo-test': 'warn',
	'ava/no-unknown-modifiers': 'error',
	'ava/no-useless-t-pass': 'error',
	'ava/prefer-async-await': 'error',
	'ava/prefer-power-assert': 'off',
	'ava/prefer-t-regex': 'error',
	'ava/prefer-t-throws': 'error',
	'ava/test-title': 'error',
	'ava/test-title-format': 'off',
	'ava/use-t': 'error',
	'ava/use-t-throws-async-well': 'error',
	'ava/use-t-well': 'error',
	'ava/use-test': 'error',
	'ava/use-true-false': 'error',
};

const plugin = {
	meta: {
		name,
		version,
	},
	rules,
	configs: {},
};

Object.assign(plugin.configs, {
	recommended: [
		{
			plugins: {
				ava: plugin,
			},
			rules: {
				...recommendedRules,
			},
		},
		{
			files: ['**/package.json'],
			language: 'json/json',
			plugins: {json, ava: plugin},
			rules: {
				'ava/no-ava-in-dependencies': 'error',
			},
		},
	],
});

export default plugin;
