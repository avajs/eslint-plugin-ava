'use strict';
const {visitIf} = require('enhance-visitors');
const util = require('../util');
const createAvaRule = require('../create-ava-rule');

const create = context => {
	const filename = context.getFilename();

	if (filename === '<text>') {
		return {};
	}

	const avaHelper = util.loadAvaHelper(filename);
	if (!avaHelper) {
		return {};
	}

	let hasTestCall = false;

	const ava = createAvaRule();
	return ava.merge({
		CallExpression: visitIf([
			ava.isInTestFile,
			ava.isTestNode
		])(() => {
			hasTestCall = true;
		}),
		'Program:exit': node => {
			if (!hasTestCall) {
				return;
			}

			const {isHelper, isSource, isTest} = avaHelper.classifyFile(filename);

			if (!isTest) {
				if (isHelper) {
					context.report({node, message: 'AVA treats this as a helper file.'});
				} else if (isSource) {
					context.report({node, message: 'AVA treats this as a source file.'});
				} else {
					context.report({node, message: 'AVA ignores this file.'});
				}
			}

			hasTestCall = false;
		}
	});
};

module.exports = {
	create,
	meta: {
		docs: {
			url: util.getDocsUrl(__filename)
		},
		type: 'suggestion'
	}
};
