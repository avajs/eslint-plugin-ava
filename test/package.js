import fs from 'fs';
import path from 'path';
import test from 'ava';
import pify from 'pify';
import index from '../';

test('Every rule is defined in index file', async t => {
	const ruleDir = path.resolve(__dirname, '../rules');
	const files = await pify(fs.readdir)(ruleDir);

	const rules = files.filter(file =>
		file.indexOf('.js') === file.length - 3 &&
		!fs.readFileSync(path.join(ruleDir, file), 'utf8').includes('deprecated: true')
	);

	rules.forEach(file => {
		const name = file.slice(0, -3);
		t.truthy(index.rules[name], `'${name}' is not exported in 'index.js'`);
		t.truthy(index.configs.recommended.rules[`ava/${name}`], `'${name}' is not set in the recommended config`);
	});

	t.is(Object.keys(index.configs.recommended.rules).length, rules.length,
		'There are more exported rules in the recommended config than rule files.');
});
