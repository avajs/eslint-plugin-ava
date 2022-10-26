# Creating a new rule

Translations: [Français](https://github.com/avajs/ava-docs/blob/main/fr_FR/related/eslint-plugin-ava/docs/new-rule.md)

## Prerequisite

- [Read the ESLint docs on creating a new rule.](https://eslint.org/docs/developer-guide/working-with-rules)
- Look at the commit for how previous rules were added as inspiration. For example, the [`no-async-fn-without-await` rule](https://github.com/avajs/eslint-plugin-ava/commit/a443d7a9c94165f42749938e6b491a7c10749b6c).

## Tip

Use the [`astexplorer` site](https://astexplorer.net) with the `espree` parser and `ESLint v4` transform to interactively create the initial rule implementation. It lets you inspect the full AST as you would get from ESLint and you can even see the result of your auto-fixer implementation.

## Steps

- Go to the `test` directory and duplicate the `no-todo-test.js` file and rename it to the name of your rule. Then write some tests before starting to implement the rule.
- Go to the `rules` directory and duplicate the `no-todo-test.js` file and rename it to the name of your rule. Then start implementing the new rule logic.
- Add the correct [`meta.type`](https://eslint.org/docs/developer-guide/working-with-rules#rule-basics) to the rule.
- Go to the `docs/rules` directory and duplicate the `no-todo-test.md` file and rename it to the name of your rule. Then write some documentation.
- Add the rule in alphabetically sorted order to:
  - [The recommended config](https://github.com/avajs/eslint-plugin-ava/blob/0ded4b5c3cd09504e846309760566c9499a24196/index.js#L19)
  - [The recommended config in the readme](https://github.com/avajs/eslint-plugin-ava/blame/0ded4b5c3cd09504e846309760566c9499a24196/readme.md#L35)
	*(The description should be the same as the heading of the documentation file).*
- Run `$ npm test` to ensure the tests pass.
- Run `$ npm run integration` to run the rules against real projects to ensure your rule does not fail on real-world code.
- Run `$ npm run update:eslint-docs` to update the readme rules list and standardized rule doc title/notices.
- Open a pull request with a title in exactly the format `` Add `rule-name` rule ``, for example, `` Add `no-unused-properties` rule ``.
- The pull request description should include the issue it fixes, for example, `Fixes #123`.
