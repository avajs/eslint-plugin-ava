'use strict';
const {visitIf} = require('enhance-visitors');
const createAvaRule = require('../create-ava-rule');
const util = require('../util');

const create = context => {
	const ava = createAvaRule();

	const booleanTests = [
		'true',
		'false',
		'truthy',
		'falsy'
	];

	const equalityTests = ['is', 'deepEqual'];

	const findReference = name => {
		const reference = context.getScope().references.find(reference => reference.identifier.name === name);
		const definitions = reference.resolved.defs;

		// Many integration tests have identifiers that match zero definitions
		if (definitions.length === 0) {
			return undefined;
		}

		return definitions[definitions.length - 1].node;
	};

	const isRegExp = lookup => {
		let isRegex = lookup.regex;

		// It's not a regexp but an identifier
		if (!isRegex && lookup.type === 'Identifier') {
			const reference = findReference(lookup.name);

			// Not all possible references have an init field
			if (reference && reference.init) {
				isRegex = reference.init.regex;
			}
		}

		return isRegex;
	};

	const booleanHandler = node => {
		const firstArg = node.arguments[0];

		// First argument is a call expression
		const isFunctionCall = firstArg.type === 'CallExpression';
		if (!isFunctionCall || !firstArg.callee.property) {
			return;
		}

		const {name} = firstArg.callee.property;
		let lookup = {};
		let variable = {};

		if (name === 'test') {
			// `lookup.test(variable)`
			lookup = firstArg.callee.object;
			variable = firstArg.arguments[0];
		} else if (['search', 'match'].includes(name)) {
			// `variable.match(lookup)`
			lookup = firstArg.arguments[0];
			variable = firstArg.callee.object;
		}

		if (!isRegExp(lookup)) {
			return;
		}

		const assertion = ['true', 'truthy'].includes(node.callee.property.name) ? 'regex' : 'notRegex';

		const fix = fixer => {
			const source = context.getSourceCode();
			return [
				fixer.replaceText(node.callee.property, assertion),
				fixer.replaceText(firstArg, `${source.getText(variable)}, ${source.getText(lookup)}`)
			];
		};

		context.report({
			node,
			message: `Prefer using the \`t.${assertion}()\` assertion.`,
			fix
		});
	};

	const equalityHandler = node => {
		const [firstArg, secondArg] = node.arguments;

		const firstArgumentIsRegex = isRegExp(firstArg);
		const secondArgumentIsRegex = isRegExp(secondArg);

		// If both are regex, or neither are, the expression is ok
		if (firstArgumentIsRegex === secondArgumentIsRegex) {
			return;
		}

		const matchee = secondArgumentIsRegex ? firstArg : secondArg;
		const regex = secondArgumentIsRegex ? secondArg : firstArg;

		const assertion = 'regex';

		const fix = fixer => {
			const source = context.getSourceCode();
			return [
				fixer.replaceText(node.callee.property, assertion),
				fixer.replaceText(firstArg, `${source.getText(matchee)}`),
				fixer.replaceText(secondArg, `${source.getText(regex)}`)
			];
		};

		context.report({
			node,
			message: `Prefer using the \`t.${assertion}()\` assertion.`,
			fix
		});
	};

	return ava.merge({
		CallExpression: visitIf([
			ava.isInTestFile,
			ava.isInTestNode
		])(node => {
			const isAssertion = node.callee.type === 'MemberExpression' &&
				util.getNameOfRootNodeObject(node.callee) === 't';

			// Call a boolean assertion, for example, `t.true`, `t.false`, …
			const isBooleanAssertion = isAssertion &&
				booleanTests.includes(node.callee.property.name);

			// Call an equality assertion, ie. 't.is', 't.deepEqual'
			const isEqualityAssertion = isAssertion &&
				equalityTests.includes(node.callee.property.name);

			if (isBooleanAssertion) {
				booleanHandler(node);
			} else if (isEqualityAssertion) {
				equalityHandler(node);
			}
		})
	});
};

module.exports = {
	create,
	meta: {
		docs: {
			url: util.getDocsUrl(__filename)
		},
		fixable: 'code',
		type: 'suggestion'
	}
};
