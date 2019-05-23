const header = 'const test = require(\'ava\');';

function testCaseBuilder(ruleId, options = []) {
	return function testCase(content, errorMessage = [], withoutHeader = false) {
		const testFn = `
			test(t => {
				${content}
			});
		`;

		if (!Array.isArray(errorMessage)) {
			errorMessage = [errorMessage];
		}

		return {
			errors: errorMessage.length && errorMessage.map(message => ({
				ruleId,
				message
			})),
			options,
			code: (withoutHeader ? '' : header) + testFn
		};
	}
}


module.exports = testCaseBuilder;
