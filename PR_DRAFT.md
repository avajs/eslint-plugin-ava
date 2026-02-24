# PR: Enhance `prefer-t-throws` to detect try/catch that only asserts on caught errors

## Summary
This PR extends `ava/prefer-t-throws` to also flag a common pattern where a test uses `try/catch` to capture an error and assert on it, without using `t.fail()`.

Example currently used:

```js
try {
  await request(requestOptions);
} catch (error) {
  t.true(error.statusCode === 500);
}
```

Preferred:

```js
const error = await t.throwsAsync(request(requestOptions));

t.true(error.statusCode === 500);
```

## What changed
- Rule now detects two patterns:
  1) try block contains a direct `t.fail()` after code that should throw (existing)
  2) try block runs a single call (possibly awaited/returned) and the catch block asserts on the caught error (new)
- Added unit tests for the new pattern (sync + async).
- Updated docs for `prefer-t-throws` to describe the additional detection.

## Notes
- This PR does not attempt an auto-fix for the new pattern (non-trivial to rewrite while preserving variable usage). It only reports and guides toward `t.throws()` / `t.throwsAsync()`.
