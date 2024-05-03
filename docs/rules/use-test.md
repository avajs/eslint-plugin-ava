# Ensure that AVA is imported with `test` as the variable name (`ava/use-test`)

💼 This rule is enabled in the ✅ `recommended` [config](https://github.com/avajs/eslint-plugin-ava#recommended-config).

<!-- end auto-generated rule header -->

Translations: [Français](https://github.com/avajs/ava-docs/blob/main/fr_FR/related/eslint-plugin-ava/docs/rules/use-test.md)

The convention is to import AVA and assign it to a variable named `test`. Most rules in `eslint-plugin-ava` are based on that assumption.
In a TypeScript file (`.ts` or `.tsx`) AVA can be assigned to a variable named `anyTest` in order to define the types of `t.context` (see [Typing t.context](https://github.com/avajs/ava/blob/main/docs/recipes/typescript.md#typing-tcontext)). Type-only imports (`import type ... from 'ava'`) are not linted.

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
import type {TestInterface} from 'ava';

const test = anyTest as TestInterface<{foo: string}>;
```
