# ava/use-test

📝 Require AVA to be imported as `test`.

💼 This rule is enabled in the ✅ `recommended` [config](https://github.com/avajs/eslint-plugin-ava#recommended-config).

<!-- end auto-generated rule header -->

Translations: [Français](https://github.com/avajs/ava-docs/blob/main/fr_FR/related/eslint-plugin-ava/docs/rules/use-test.md)

The convention is to import AVA and assign it to a variable named `test`. Most rules in `eslint-plugin-ava` are based on that assumption.
In a TypeScript file (`.ts`, `.tsx`, `.mts`, or `.cts`) AVA can be assigned to a variable named `anyTest` in order to define the types of `t.context` (see [Typing t.context](https://github.com/avajs/ava/blob/main/docs/recipes/typescript.md#typing-tcontext)). Type-only imports (`import type ... from 'ava'` and `import {type ...} from 'ava'`) are not linted.

### Fail

```js
import ava from 'ava';
```

### Pass

```js
import test from 'ava';
```

```ts
import anyTest from 'ava';
import type {TestFn} from 'ava';

const test = anyTest as TestFn<{foo: string}>;
```

```ts
import anyTest, {type TestFn} from 'ava';

const test = anyTest as TestFn<{foo: string}>;
```
