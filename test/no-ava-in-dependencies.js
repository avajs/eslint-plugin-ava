import test from 'ava';
import AvaRuleTester from 'eslint-ava-rule-tester';
import json from '@eslint/json';
import rule from '../rules/no-ava-in-dependencies.js';

const ruleTester = new AvaRuleTester(test, {
	language: 'json/json',
	plugins: {json},
});

const errors = [{messageId: 'no-ava-in-dependencies'}];

ruleTester.run('no-ava-in-dependencies', rule, {
	valid: [
		{
			name: 'ava only in devDependencies',
			code: '{\n\t"devDependencies": {\n\t\t"ava": "^6.0.0"\n\t}\n}',
		},
		{
			name: 'no ava anywhere',
			code: '{\n\t"dependencies": {\n\t\t"foo": "^1.0.0"\n\t}\n}',
		},
		{
			name: 'empty dependencies',
			code: '{\n\t"dependencies": {}\n}',
		},
		{
			name: 'no dependencies key',
			code: '{\n\t"name": "my-package"\n}',
		},
		{
			name: 'dependencies value is not an object',
			code: '{\n\t"dependencies": "invalid"\n}',
		},
		{
			name: 'root is not an object',
			code: '"just a string"',
		},
		{
			name: 'root is an array',
			code: '[1, 2, 3]',
		},
	],
	invalid: [
		{
			name: 'ava is the only dependency - remove dependencies, create devDependencies',
			code: '{\n\t"dependencies": {\n\t\t"ava": "^6.0.0"\n\t}\n}',
			output: '{\n\t"devDependencies": {\n\t\t"ava": "^6.0.0"\n\t}\n}',
			errors,
		},
		{
			name: 'ava is first of multiple dependencies',
			code: '{\n\t"dependencies": {\n\t\t"ava": "^6.0.0",\n\t\t"foo": "^1.0.0"\n\t}\n}',
			output: '{\n\t"dependencies": {\n\t\t"foo": "^1.0.0"\n\t},\n\t"devDependencies": {\n\t\t"ava": "^6.0.0"\n\t}\n}',
			errors,
		},
		{
			name: 'ava is last of multiple dependencies',
			code: '{\n\t"dependencies": {\n\t\t"foo": "^1.0.0",\n\t\t"ava": "^6.0.0"\n\t}\n}',
			output: '{\n\t"dependencies": {\n\t\t"foo": "^1.0.0"\n\t},\n\t"devDependencies": {\n\t\t"ava": "^6.0.0"\n\t}\n}',
			errors,
		},
		{
			name: 'ava is middle of multiple dependencies',
			code: '{\n\t"dependencies": {\n\t\t"bar": "^2.0.0",\n\t\t"ava": "^6.0.0",\n\t\t"foo": "^1.0.0"\n\t}\n}',
			output: '{\n\t"dependencies": {\n\t\t"bar": "^2.0.0",\n\t\t"foo": "^1.0.0"\n\t},\n\t"devDependencies": {\n\t\t"ava": "^6.0.0"\n\t}\n}',
			errors,
		},
		{
			name: 'ava in deps with existing devDependencies',
			code: '{\n\t"dependencies": {\n\t\t"ava": "^6.0.0",\n\t\t"foo": "^1.0.0"\n\t},\n\t"devDependencies": {\n\t\t"bar": "^2.0.0"\n\t}\n}',
			output: '{\n\t"dependencies": {\n\t\t"foo": "^1.0.0"\n\t},\n\t"devDependencies": {\n\t\t"bar": "^2.0.0",\n\t\t"ava": "^6.0.0"\n\t}\n}',
			errors,
		},
		{
			name: 'ava in deps with empty devDependencies',
			code: '{\n\t"dependencies": {\n\t\t"ava": "^6.0.0",\n\t\t"foo": "^1.0.0"\n\t},\n\t"devDependencies": {}\n}',
			output: '{\n\t"dependencies": {\n\t\t"foo": "^1.0.0"\n\t},\n\t"devDependencies": {\n\t\t"ava": "^6.0.0"\n\t}\n}',
			errors,
		},
		{
			name: 'ava in both dependencies and devDependencies - just remove from dependencies',
			code: '{\n\t"dependencies": {\n\t\t"ava": "^6.0.0",\n\t\t"foo": "^1.0.0"\n\t},\n\t"devDependencies": {\n\t\t"ava": "^6.0.0"\n\t}\n}',
			output: '{\n\t"dependencies": {\n\t\t"foo": "^1.0.0"\n\t},\n\t"devDependencies": {\n\t\t"ava": "^6.0.0"\n\t}\n}',
			errors,
		},
		{
			name: 'ava is only dep, already in devDependencies - just remove dependencies',
			code: '{\n\t"dependencies": {\n\t\t"ava": "^6.0.0"\n\t},\n\t"devDependencies": {\n\t\t"ava": "^6.0.0"\n\t}\n}',
			output: '{\n\t"devDependencies": {\n\t\t"ava": "^6.0.0"\n\t}\n}',
			errors,
		},
		{
			name: 'ava is only dep with existing non-empty devDependencies',
			code: '{\n\t"dependencies": {\n\t\t"ava": "^6.0.0"\n\t},\n\t"devDependencies": {\n\t\t"xo": "^1.0.0"\n\t}\n}',
			output: '{\n\t"devDependencies": {\n\t\t"xo": "^1.0.0",\n\t\t"ava": "^6.0.0"\n\t}\n}',
			errors,
		},
		{
			name: 'ava is only dep with existing empty devDependencies',
			code: '{\n\t"dependencies": {\n\t\t"ava": "^6.0.0"\n\t},\n\t"devDependencies": {}\n}',
			output: '{\n\t"devDependencies": {\n\t\t"ava": "^6.0.0"\n\t}\n}',
			errors,
		},
		{
			name: 'ava is only dep with non-object devDependencies',
			code: '{\n\t"dependencies": {\n\t\t"ava": "^6.0.0"\n\t},\n\t"devDependencies": "invalid"\n}',
			output: '{\n\t"devDependencies": {\n\t\t"ava": "^6.0.0"\n\t}\n}',
			errors,
		},
		{
			name: '2-space indentation is preserved',
			code: '{\n  "dependencies": {\n    "ava": "^6.0.0",\n    "foo": "^1.0.0"\n  }\n}',
			output: '{\n  "dependencies": {\n    "foo": "^1.0.0"\n  },\n  "devDependencies": {\n    "ava": "^6.0.0"\n  }\n}',
			errors,
		},
	],
});
