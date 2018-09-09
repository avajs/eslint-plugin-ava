import test from 'ava';
import avaRuleTester from 'eslint-ava-rule-tester';
import rule from '../rules/no-statement-after-end';

const ruleTester = avaRuleTester(test, {
	env: {
		es6: true
	}
});

const errors = [{ruleId: 'no-statement-after-end'}];
const header = 'const test = require(\'ava\');\n';

function cbTest(contents, prependHeader) {
	let ret = `test.cb(t => { ${contents} });`;

	if (prependHeader !== false) {
		ret = header + ret;
	}

	return ret;
}

ruleTester.run('no-statement-after-end', rule, {
	valid: [
		cbTest('t.end();'),
		cbTest('t.is(1, 1); t.end();'),
		cbTest('notT.end(); t.is(1, 1);'),
		cbTest('if (t.context.a === 1) { return t.end(); } \n t.is(1, 1); t.end();'),
		cbTest('return t.end();'),
		cbTest('t.end(); return;'),
		// Valid because it is not a test file (no header)
		cbTest('t.end(); t.is(1, 1);', false)
	],
	invalid: [
		{
			code: cbTest('t.end(); t.is(1, 1);'),
			errors
		},
		{
			code: cbTest('t.end(); return 3 + 4;'),
			errors
		},
		{
			code: cbTest('t.end(); console.log("end");'),
			errors
		},
		{
			code: cbTest('if (t.context.a === 1) { t.end(); }\nt.is(1, 1); t.end();'),
			errors
		}
	]
});
