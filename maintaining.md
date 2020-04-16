# Maintaining

## Resources

- [AST Explorer](https://astexplorer.net)
- [Working with ESLint rules](https://eslint.org/docs/developer-guide/working-with-rules)

## Deprecating rules

- Keep the file where it is.
- Remove the rule from the readme and the `recommended` config.
- Remove its documentation in `docs/rules/`.
- Set `deprecated: true` in `meta` property of the returned rule object.
- Prefix all rule messages with `(DEPRECATED) `.
- Remove the rule and its test sometime far in the future. No point in inconveniencing the user.
