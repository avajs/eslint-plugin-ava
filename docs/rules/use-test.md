# Ensure that AVA is imported with `test` as the variable name

Translations: [Français](https://github.com/avajs/ava-docs/blob/master/fr_FR/related/eslint-plugin-ava/docs/rules/use-test.md)

The convention is to import AVA and assign it to a variable named `test`. Most rules in `eslint-plugin-ava` are based on that assumption.

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
import test from 'foo';
```
