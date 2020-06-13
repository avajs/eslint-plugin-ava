'use strict';
const {visitIf} = require('enhance-visitors');
const createAvaRule = require('../create-ava-rule');
const util = require('../util');

const create = context => {
	const ava = createAvaRule();

	const booleanTests = new Set([
		'true',
		'false',
		'truthy',
		'falsy'
	]);

	const findReference = name => {
		const reference = context.getScope().references.find(reference => reference.identifier.name === name);
		const definitions = reference.resolved.defs;
		return definitions[definitions.length - 1].node;
	};

	return ava.merge({
		CallExpression: visitIf([
			ava.isInTestFile,
			ava.isInTestNode
		])(node => {
			// Call a boolean assertion, for example, `t.true`, `t.false`, …
			const isBooleanAssertion = node.callee.type === 'MemberExpression' &&
				booleanTests.has(node.callee.property.name) &&
				util.getNameOfRootNodeObject(node.callee) === 't';

			if (!isBooleanAssertion) {
				return;
			}

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

			let isRegExp = lookup.regex;

			// It's not a regexp but an identifier
			if (!isRegExp && lookup.type === 'Identifier') {
				const reference = findReference(lookup.name);
				isRegExp = reference.init.regex;
			}

			if (!isRegExp) {
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
