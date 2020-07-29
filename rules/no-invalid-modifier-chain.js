'use strict';
const {visitIf} = require('enhance-visitors');
const createAvaRule = require('../create-ava-rule');
const util = require('../util');
const validModifiers = new Set([
	'after',
	'afterEach',
	'always',
	'before',
	'beforeEach',
	'cb',
	'only',
	'serial',
	'skip',
	'todo',
	'failing'
]);
const TestInterface = {};
{
	const CbOnlyInterface = null;
	const CbSkipInterface = null;
	const OnlyInterface = null;
	const SkipInterface = null;
	const TodoDeclaration = null;

	const FailingInterface = {
		only: OnlyInterface,
		skip: SkipInterface
	};

	const CbFailingInterface = {
		only: CbOnlyInterface,
		skip: CbSkipInterface
	};

	const CbInterface = {
		...CbFailingInterface,
		failing: CbFailingInterface
	};

	const SerialInterface = {
		...FailingInterface,
		cb: CbInterface,
		failing: FailingInterface,
		todo: TodoDeclaration
	};

	const HookCbInterface = {
		...CbFailingInterface,
		failing: CbFailingInterface
	};

	const AlwaysInterface = {
		cb: HookCbInterface,
		skip: SkipInterface
	};

	const AfterInterface = {
		...AlwaysInterface,
		always: AlwaysInterface
	};

	const BeforeInterface = {
		...AlwaysInterface
	};

	Object.assign(TestInterface, SerialInterface);
	/* eslint-disable no-multi-assign */
	TestInterface.after = TestInterface.afterEach = AfterInterface;
	TestInterface.before = TestInterface.beforeEach = BeforeInterface;
	/* eslint-enable no-multi-assign */
	TestInterface.serial = SerialInterface;
}

const create = context => {
	const ava = createAvaRule();

	return ava.merge({
		CallExpression: visitIf([
			ava.isInTestFile,
			ava.isTestNode
		])(node => {
			const modifiers = util.getTestModifiers(node);
			let currentInterface = TestInterface;
			for (const modifier of modifiers) {
				if (currentInterface === null) {
					return context.report({
						node: modifier,
						messageId: 'last',
						data: {
							name: modifier.name
						}
					});
				}

				if (!validModifiers.has(modifier.name)) {
					return context.report({
						node: modifier,
						messageId: 'unknown',
						data: {
							name: modifier.name
						}
					});
				}

				currentInterface = currentInterface[modifier.name];
				if (currentInterface === undefined) {
					return context.report({
						node,
						messageId: 'invalid',
						data: {
							name: modifier.name
						}
					});
				}
			}
		})
	});
};

module.exports = {
	create,
	meta: {
		messages: {
			unknown: 'Unknown Test Modifier `{{ name }}`',
			invalid: 'Invalid Test Modifier `{{ name }}`',
			last: 'Unexpected Test Modifier `{{ name }}` after a terminal modifier'
		},
		docs: {
			url: util.getDocsUrl(__filename)
		},
		type: 'problem'
	}
};
