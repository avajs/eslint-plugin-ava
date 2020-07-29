'use strict';
const {visitIf} = require('enhance-visitors');
const createAvaRule = require('../create-ava-rule');
const util = require('../util');
const InterfaceData = Symbol('Data for the Mock Interfaces');
const TestInterface = (() => {
	const CbOnlyInterface = {
		[InterfaceData]: {
			isNull: true
		}
	};
	const CbSkipInterface = {
		[InterfaceData]: {
			isNull: true
		}
	};
	const OnlyInterface = {
		[InterfaceData]: {
			isNull: true
		}
	};
	const SkipInterface = {
		[InterfaceData]: {
			isNull: true
		}
	};
	const TodoDeclaration = {
		[InterfaceData]: {
			isNull: true
		}
	};

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

	return {
		...SerialInterface,
		after: AfterInterface,
		afterEach: AfterInterface,
		before: BeforeInterface,
		beforeEach: BeforeInterface,
		serial: SerialInterface
	};
})();

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

				if (!util.testModifierNames.has(modifier.name)) {
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
