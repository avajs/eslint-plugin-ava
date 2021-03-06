# Ensure that AVA is imported with `test` as the variable name

Translations: [Français](https://github.com/avajs/ava-docs/blob/main/fr_FR/related/eslint-plugin-ava/docs/rules/use-test.md)

The convention is to import AVA and assign it to a variable named `test`. Most rules in `eslint-plugin-ava` are based on that assumption.
In a TypeScript file (`.ts` or `.tsx`) AVA can be assigned to a variable named `anyTest` in order to define the types of `t.context` (see [Typing t.context](https://github.com/avajs/ava/blob/main/docs/recipes/typescript.md#typing-tcontext)).

### Fail

```js
var ava = require('ava');
let ava = require('ava');
const ava = require('ava');
import ava from 'ava';
```

### Pass

```js
var test = require('ava');
let test = require('ava');
const test = require('ava');
import test from 'ava';

var test = require('foo');
const test = require('foo');
```

```ts
import anyTest from 'ava';

const test = anyTest as TestInterface<{foo: string}>;
```
