const header = 'const test = require(\'ava\');';

/**
 * @typedef {Function} TestCase
 * @param {string} content - Code to test
 * @param {Object} [config] - Set of configuration for the test
 * @param {Array} 	[config.errorMessage] - List of error message that the rule should report
 * @param {Boolean} [config.useHeader=true] - Don't prepend a `require` to the code, not making it a test file
 * @param {Boolean} [config.wrapInTest=true] - Don't wrap the code inside a `test` function
 * @returns {{code, options, errors}} Description of a test case
 */
/**
 * Can be called to prepare a new test case with its rule ID and options
 * @param {string} ruleId - Unique ID of the rule
 * @param {*} [options] - Options for the rule
 * @returns {TestCase} Function to call on each test case
 */
module.exports = (ruleId, options = []) => {
	if (!Array.isArray(options)) {
		options = [options];
	}

	return (content, {errorMessage = [], useHeader = true, wrapInTest = true} = {}) => {
		const testFn = wrapInTest ? `
			test('main', t => {
				${content}
			});
		` : content;

		if (!Array.isArray(errorMessage)) {
			errorMessage = [errorMessage];
		}

		return {
			code: (useHeader ? header : '') + testFn,
			options,
			errors: errorMessage.length && errorMessage.map(message => ({
				ruleId,
				message
			}))
		};
	};
};
