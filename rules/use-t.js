import {visitIf} from 'enhance-visitors';
import createAvaRule from '../create-ava-rule.js';
import util from '../util.js';

const create = context => {
	const ava = createAvaRule();

	return ava.merge({
		CallExpression: visitIf([
			ava.isInTestFile,
			ava.isTestNode,
		])(node => {
			const index = node.arguments.length - 1;
			if (index > 1) {
				return;
			}

			let implementationArgument = node.arguments[index];
			if (ava.hasTestModifier('macro') && implementationArgument.type === 'ObjectExpression') {
				const execProperty = implementationArgument.properties.find(p => p.key.name === 'exec');
				implementationArgument = execProperty?.value;
			}

			if (!implementationArgument || !implementationArgument.params || implementationArgument.params.length === 0) {
				return;
			}

			if (implementationArgument.params[0].name !== 't') {
				context.report({
					node,
					message: 'Test parameter should be named `t`.',
				});
			}
		}),
	});
};

export default {
	create,
	meta: {
		type: 'suggestion',
		docs: {
			description: 'Ensure test functions use `t` as their parameter.',
			url: util.getDocsUrl(import.meta.filename),
		},
		schema: [],
	},
};
