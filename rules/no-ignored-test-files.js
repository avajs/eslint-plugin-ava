import {visitIf} from 'enhance-visitors';
import util from '../util.js';
import createAvaRule from '../create-ava-rule.js';

const MESSAGE_ID_HELPER = 'helper-file';
const MESSAGE_ID_IGNORED = 'ignored-file';

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
					context.report({node, messageId: MESSAGE_ID_HELPER});
				} else {
					context.report({node, messageId: MESSAGE_ID_IGNORED});
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
			description: 'File extensions recognized as test files.',
			type: 'array',
		},
		files: {
			description: 'Glob patterns to match test files.',
			type: 'array',
		},
		helpers: {
			description: 'Glob patterns to match helper files.',
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
			description: 'Disallow tests in ignored files.',
			recommended: true,
			url: util.getDocsUrl(import.meta.filename),
		},
		schema,
		defaultOptions: [{}],
		messages: {
			[MESSAGE_ID_HELPER]: 'AVA treats this as a helper file.',
			[MESSAGE_ID_IGNORED]: 'AVA ignores this file.',
		},
	},
};
