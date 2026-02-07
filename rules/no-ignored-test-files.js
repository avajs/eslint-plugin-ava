import {visitIf} from 'enhance-visitors';
import util from '../util.js';
import createAvaRule from '../create-ava-rule.js';

const create = context => {
	const {filename} = context;
	const [overrides] = context.options;

	if (filename === '<input>' || filename === '<text>') {
		return {};
	}

	let hasTestCall = false;

	const ava = createAvaRule();
	return ava.merge({
		CallExpression: visitIf([
			ava.isInTestFile,
			ava.isTestNode,
		])(() => {
			hasTestCall = true;
		}),
		'Program:exit'(node) {
			if (!hasTestCall) {
				return;
			}

			const avaHelper = util.loadAvaHelper(filename, overrides);
			if (!avaHelper) {
				return {};
			}

			const {isHelper, isTest} = avaHelper.classifyFile(filename);

			if (!isTest) {
				if (isHelper) {
					context.report({node, message: 'AVA treats this as a helper file.'});
				} else {
					context.report({node, message: 'AVA ignores this file.'});
				}
			}

			hasTestCall = false;
		},
	});
};

const schema = [{
	type: 'object',
	properties: {
		extensions: {
			type: 'array',
		},
		files: {
			type: 'array',
		},
		helpers: {
			type: 'array',
		},
	},
	additionalProperties: false,
}];

export default {
	create,
	meta: {
		type: 'suggestion',
		docs: {
			description: 'Ensure no tests are written in ignored files.',
			url: util.getDocsUrl(import.meta.filename),
		},
		schema,
	},
};
