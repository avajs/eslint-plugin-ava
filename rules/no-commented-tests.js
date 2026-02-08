import createAvaRule from '../create-ava-rule.js';
import util from '../util.js';

const MESSAGE_ID = 'no-commented-tests';

const commentedTestPattern = /^\s*\*?\s*test\s*(?:\.\s*\w+\s*)*\(/;

const create = context => {
	const ava = createAvaRule();

	return ava.merge({
		'Program:exit'() {
			if (!ava.isInTestFile()) {
				return;
			}

			for (const comment of context.sourceCode.getAllComments()) {
				const lines = comment.value.split('\n');
				for (const [index, line] of lines.entries()) {
					if (commentedTestPattern.test(line)) {
						context.report({
							loc: {
								line: comment.loc.start.line + index,
								column: 0,
							},
							messageId: MESSAGE_ID,
						});
						break;
					}
				}
			}
		},
	});
};

export default {
	create,
	meta: {
		type: 'suggestion',
		docs: {
			description: 'Disallow commented-out tests.',
			recommended: true,
			url: util.getDocsUrl(import.meta.filename),
		},
		schema: [],
		messages: {
			[MESSAGE_ID]: 'Use `test.skip()` instead of commenting out a test.',
		},
	},
};
