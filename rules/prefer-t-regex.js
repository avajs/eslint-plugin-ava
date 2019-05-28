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

	const findReference = name => {
		const reference = context.getScope().references.find(ref => ref.identifier.name === name);
		const definitions = reference.resolved.defs;
		return definitions[definitions.length - 1].node;
	};

	return ava.merge({
		CallExpression: visitIf([
			ava.isInTestFile,
			ava.isInTestNode
		])(node => {
			// Call a boolean assertion (eg: `.true`, `.false` ...)
			if (node.callee.type === 'MemberExpression' &&
				booleanTests.includes(node.callee.property.name) &&
				util.getNameOfRootNodeObject(node.callee) === 't') {
				const arg = node.arguments[0];

				// Call the `test` function
				if (arg.type === 'CallExpression') {
					const {name} = arg.callee.property;
					let lookup = {};
					let variable = {};

					if (name === 'test') {
						// `lookup.test(variable)`
						lookup = arg.callee.object;
						variable = arg.arguments[0];
					} else if (['search', 'match'].includes(name)) {
						// `variable.match(lookup)`
						lookup = arg.arguments[0];
						variable = arg.callee.object;
					}

					let isRegExp = lookup.regex;

					// It's not a regexp but an identifier
					if (!isRegExp && lookup.type === 'Identifier') {
						const reference = findReference(lookup.name);
						isRegExp = reference.init.regex;
					}

					if (isRegExp) {
						const fix = fixer => {
							const assert = ['true', 'truthy'].includes(node.callee.property.name) ? 'regex' : 'notRegex';
							const source = context.getSourceCode();
							return [
								fixer.replaceText(node.callee.property, assert),
								fixer.replaceText(arg, `${source.getText(variable)}, ${source.getText(lookup)}`)
							];
						};

						context.report({
							node,
							message: 'Prefer using the `.regex` assert function.',
							fix
						});
					}
				}
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
