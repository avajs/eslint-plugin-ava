import RuleTester from './helpers/rule-tester.js';
import rule from '../rules/use-t.js';

const ruleTester = new RuleTester();

const parameterNotNamedTErrors = [{
	messageId: 'use-t',
}];

ruleTester.run('use-t', rule, {
	valid: [
		'test();',
		'test(() => {});',
		'test(t => {});',
		'test("test name", t => {});',
		'test((t, foo) => {});',
		'test(function (t) {});',
		'test(testFunction);',
		'test.macro();',
		'test.macro(testFunction);',
		'test.macro(t => {});',
		'test.macro({exec: t => {}, title: () => "title"});',
		'test.macro({...macroArgs, exec: t => {}});',
		'const macro = t => {}; test(macro, {exec(foo) {}});',
		'import macro from "./macro.js"; test(macro, {exec(foo) {}});',
		'const implementation = {exec(foo) {}}; test(implementation);',
		'test.todo("test name");',
		'const macro = (t, callback) => { t.true(callback()); }; test(macro, callback => true);',
		'import macro from "./macro.js"; test(macro, callback => true);',
		'let serial = test.serial; serial = helper; serial(foo => {});',
		'const serial = test.serial; function wrap(serial) { serial(foo => {}); }',
		'const helper = test.custom; helper(foo => {});',
		// Shouldn't be triggered since it's not a test file
		{code: 'test(foo => {});', noHeader: true},
		'test(macro, arg1, (p1) => {})',
		'test("name", macro, arg1, (p1) => {})',
		'test("name", macro, (p1) => {})',
	],
	invalid: [
		{
			code: 'test(foo => {});',
			errors: parameterNotNamedTErrors,
		},
		{
			code: 'test("test name", foo => {});',
			errors: parameterNotNamedTErrors,
		},
		{
			code: 'import anyTest from "ava"; let test = anyTest; test(foo => {});',
			noHeader: true,
			errors: parameterNotNamedTErrors,
		},
		{
			code: 'test(function (foo) {});',
			errors: parameterNotNamedTErrors,
		},
		{
			code: 'test.macro(function (foo) {});',
			errors: parameterNotNamedTErrors,
		},
		{
			code: 'test.macro({ exec(foo) {} });',
			errors: parameterNotNamedTErrors,
		},
		{
			code: 'test.macro({...macroArgs, exec(foo) {}});',
			errors: parameterNotNamedTErrors,
		},
		{
			code: 'test({exec(foo) {}});',
			errors: parameterNotNamedTErrors,
		},
		{
			code: 'test("title", {exec(foo) {}});',
			errors: parameterNotNamedTErrors,
		},
		{
			code: 'const title = getTitle(); test(title, {exec(foo) {}});',
			errors: parameterNotNamedTErrors,
		},
		{
			code: 'test({exec(foo, value) {}}, 123);',
			errors: parameterNotNamedTErrors,
		},
		{
			code: 'test("title", {exec(foo, value) {}}, 123);',
			errors: parameterNotNamedTErrors,
		},
		{
			code: 'test.serial("title", {exec(foo) {}});',
			errors: parameterNotNamedTErrors,
		},
		{
			code: 'let serial = test.serial; serial(foo => {}); serial = helper;',
			errors: parameterNotNamedTErrors,
		},
		{
			code: 'let serial = test.serial; function mutate() { serial = helper; } serial(foo => {});',
			errors: parameterNotNamedTErrors,
		},
	],
});
