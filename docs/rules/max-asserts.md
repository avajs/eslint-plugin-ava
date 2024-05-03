# Enforce a limit on the number of assertions in a test (`ava/max-asserts`)

🚫 This rule is _disabled_ in the ✅ `recommended` [config](https://github.com/avajs/eslint-plugin-ava#recommended-config).

<!-- end auto-generated rule header -->

Translations: [Français](https://github.com/avajs/ava-docs/blob/main/fr_FR/related/eslint-plugin-ava/docs/rules/max-asserts.md)

Limit the amount of assertions in a test to enforce splitting up large tests into smaller ones.

Skipped assertions are counted.

## Fail

```js
/*eslint ava/max-asserts: ["error", 5]*/
const test = require('ava');

test('getSomeObject should define the players\' names', t => {
	const object = lib.getSomeObject();

	t.is(typeof object, 'object');
	t.is(typeof object.player, 'object');
	t.is(object.player.firstName, 'Luke');
	t.is(object.player.lastName, 'Skywalker');
	t.is(typeof object.opponent, 'object');
	t.is(object.opponent.firstName, 'Darth');
	t.is(object.opponent.lastName, 'Vader');
});
```

## Pass

```js
const test = require('ava');

test('getSomeObject should define the player\'s name', t => {
	const object = lib.getSomeObject();

	t.is(typeof object, 'object');
	t.is(typeof object.player, 'object');
	t.is(object.player.firstName, 'Luke');
	t.is(object.player.lastName, 'Skywalker');
});

test('getSomeObject should define the opponent\'s name', t => {
	const object = lib.getSomeObject();

	t.is(typeof object, 'object');
	t.is(typeof object.opponent, 'object');
	t.is(object.opponent.firstName, 'Darth');
	t.is(object.opponent.lastName, 'Vader');
});
```

## Options

The rule takes one option, a number, which is the maximum number of assertions for each test. The default is 5.

You can set the option in configuration like this:

```js
"ava/max-asserts": ["error", 5]
```
