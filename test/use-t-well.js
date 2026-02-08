import RuleTester, {testCase} from './helpers/rule-tester.js';
import rule from '../rules/use-t-well.js';

const ruleTester = new RuleTester();

function error(messageId) {
	return {messageId};
}

ruleTester.run('use-t-well', rule, {
	valid: [
		testCase('t;'),
		testCase('fn(t);'),
		testCase('t.end();'),
		testCase('t.pass();'),
		testCase('t.fail();'),
		testCase('t.assert(v);'),
		testCase('t.truthy(v);'),
		testCase('t.falsy(v);'),
		testCase('t.true(v);'),
		testCase('t.false(v);'),
		testCase('t.is(v);'),
		testCase('t.not(v);'),
		testCase('t.deepEqual(v, v);'),
		testCase('t.notDeepEqual(v, v);'),
		testCase('t.throws(fn);'),
		testCase('t.notThrows(fn);'),
		testCase('t.throwsAsync(fn);'),
		testCase('t.notThrowsAsync(fn);'),
		testCase('t.regex(v, /v/);'),
		testCase('t.notRegex(v, /v/);'),
		testCase('t.snapshot(v);'),
		testCase('t.ifError(error);'),
		testCase('t.deepEqual.skip(a, a);'),
		testCase('t.context.a = 1;'),
		testCase('t.context.foo.skip();'),
		testCase('console.log(t.context);'),
		testCase('t.true(t.context.title(foo));'),
		testCase('console.log(t.title);'),
		testCase('t.true(t.title.includes(\'Unicorns\'));'),
		testCase('setImmediate(t.end);'),
		testCase('t.deepEqual;'),
		testCase('t.plan(1);'),
		testCase('t.log(\'Unicorns\');'),
		testCase('a.foo();'),
		testCase('t.context.foo(a, a);'),
		testCase('t.context();'),
		testCase('t.context(\'arg\');'),
		testCase('foo.t.bar(a, a);'),
		testCase('t.teardown(() => {});'),
		testCase('t.timeout(100);'),
		testCase('t.try(tt => tt.pass())'),
		testCase('t.try(tt => tt.pass(), 1, 2)'),
		testCase('t.try(\'title\', tt => tt.pass())'),
		testCase('t.try(\'title\', tt => tt.pass(), 1, 2)'),
		testCase('t.like'),
		testCase('t.like(v, v)'),
		testCase('t.like(actual, {}, "")'),
		testCase('t.like.skip(v, v)'),
		// Alternative test object names for t.try() callbacks
		testCase('tt.pass();'),
		testCase('t_.is(v);'),
		testCase('t1.deepEqual(v, v);'),
		// Shouldn't be triggered since it's not a test file
		{code: testCase('t.foo(a, a);'), noHeader: true},
		{code: testCase('t.foo;'), noHeader: true},
	],
	invalid: [
		{
			code: testCase('t();'),
			errors: [error('not-function')],
		},
		{
			code: testCase('t.foo(a, a);'),
			errors: [error('unknown-assertion')],
		},
		{
			code: testCase('t.depEqual(a, a);'),
			output: testCase('t.deepEqual(a, a);'),
			errors: [error('misspelled')],
		},
		{
			code: testCase('t.deepEqual.skp(a, a);'),
			output: testCase('t.deepEqual.skip(a, a);'),
			errors: [error('misspelled')],
		},
		{
			code: testCase('t.title();'),
			errors: [error('unknown-assertion')],
		},
		{
			code: testCase('t.a = 1;'),
			errors: [error('unknown-member')],
		},
		{
			code: testCase('t.ctx.a = 1;'),
			errors: [error('unknown-member')],
		},
		{
			code: testCase('t.deepEqu;'),
			output: testCase('t.deepEqual;'),
			errors: [error('misspelled')],
		},
		{
			code: testCase('t.deepEqual.is(a, a);'),
			errors: [error('chaining')],
		},
		{
			code: testCase('t.paln(1);'),
			output: testCase('t.plan(1);'),
			errors: [error('misspelled')],
		},
		{
			code: testCase('t.skip();'),
			errors: [error('missing-assertion')],
		},
		{
			code: testCase('t.deepEqual.skip.skip(a, a);'),
			output: testCase('t.deepEqual.skip(a, a);'),
			errors: [error('too-many-skips')],
		},
		{
			code: testCase('t.falsey(a);'),
			output: testCase('t.falsy(a);'),
			errors: [error('misspelled')],
		},
		{
			code: testCase('t.truthey(a);'),
			output: testCase('t.truthy(a);'),
			errors: [error('misspelled')],
		},
		{
			code: testCase('t.deepequal(a, {});'),
			output: testCase('t.deepEqual(a, {});'),
			errors: [error('misspelled')],
		},
		{
			code: testCase('t.contxt;'),
			output: testCase('t.context;'),
			errors: [error('misspelled')],
		},
		{
			code: testCase('t.notdeepEqual(a, {});'),
			output: testCase('t.notDeepEqual(a, {});'),
			errors: [error('misspelled')],
		},
		{
			code: testCase('t.throw(a);'),
			output: testCase('t.throws(a);'),
			errors: [error('misspelled')],
		},
		{
			code: testCase('t.notThrow(a);'),
			output: testCase('t.notThrows(a);'),
			errors: [error('misspelled')],
		},
		{
			code: testCase('t.throwAsync(a);'),
			output: testCase('t.throwsAsync(a);'),
			errors: [error('misspelled')],
		},
		{
			code: testCase('t.notthrowAsync(a);'),
			output: testCase('t.notThrowsAsync(a);'),
			errors: [error('misspelled')],
		},
		{
			code: testCase('t.regexp(a, /r/);'),
			output: testCase('t.regex(a, /r/);'),
			errors: [error('misspelled')],
		},
		{
			code: testCase('t.notregexp(a, /r/);'),
			output: testCase('t.notRegex(a, /r/);'),
			errors: [error('misspelled')],
		},
		{
			code: testCase('t.contxt.foo = 1;'),
			output: testCase('t.context.foo = 1;'),
			errors: [error('misspelled')],
		},

		{
			code: testCase('t.skip.deepEqual(a, a);'),
			output: testCase('t.deepEqual.skip(a, a);'),
			errors: [error('skip-position')],
		},
		{
			code: testCase('t.skp.deepEqual(a, a);'),
			output: testCase('t.skip.deepEqual(a, a);'),
			errors: [error('misspelled')],
		},
		{
			code: testCase('t.deepEqual.context(a, a);'),
			errors: [error('unknown-assertion')],
		},
		{
			code: testCase('t.lik(a, a);'),
			output: testCase('t.like(a, a);'),
			errors: [error('misspelled')],
		},
		// Alternative test object names for t.try() callbacks
		{
			code: testCase('tt();'),
			errors: [error('not-function')],
		},
		{
			code: testCase('tt.foo(a, a);'),
			errors: [error('unknown-assertion')],
		},
		{
			code: testCase('tt.skip.deepEqual(a, a);'),
			output: testCase('tt.deepEqual.skip(a, a);'),
			errors: [error('skip-position')],
		},
		{
			code: testCase('tt.deepEqual.skip.skip(a, a);'),
			output: testCase('tt.deepEqual.skip(a, a);'),
			errors: [error('too-many-skips')],
		},
		{
			code: testCase('t_.depEqual(a, a);'),
			output: testCase('t_.deepEqual(a, a);'),
			errors: [error('misspelled')],
		},
	],
});
