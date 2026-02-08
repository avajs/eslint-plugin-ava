# ava/no-ava-in-dependencies

📝 Disallow AVA in `dependencies`.

💼 This rule is enabled in the ✅ `recommended` [config](https://github.com/avajs/eslint-plugin-ava#recommended-config).

🔧 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

<!-- end auto-generated rule header -->

AVA is a test runner and should be in `devDependencies`, not `dependencies`. Having it in `dependencies` means it will be installed by consumers of your package, which is unnecessary and increases install size.

### Fail

```json
{
	"dependencies": {
		"ava": "^6.0.0"
	}
}
```

### Pass

```json
{
	"devDependencies": {
		"ava": "^6.0.0"
	}
}
```
