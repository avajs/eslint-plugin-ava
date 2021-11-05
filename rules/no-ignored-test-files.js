'use strict';

const {visitIf} = require('enhance-visitors');
const util = require('../util');
const createAvaRule = require('../create-ava-rule');

const create = context => {
	const filename = context.getFilename();
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
		'Program:exit': node => {
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
}];

module.exports = {
	create,
	meta: {
		type: 'suggestion',
		docs: {
			url: util.getDocsUrl(__filename),
		},
		schema,
	},
};
