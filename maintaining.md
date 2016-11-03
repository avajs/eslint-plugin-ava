# Maintaining


## Resources

- [AST Explorer](http://astexplorer.net)
- [Working with ESLint rules](http://eslint.org/docs/developer-guide/working-with-rules)


## Deprecating rules

- Keep the file where it is.
- Remove the rule from the readme and the `recommended` config.
- Set `deprecated: true` in `meta` property of the returned rule object.
- Prefix all rule messages with `(DEPRECATED) `.
- Remove the rule and its test sometime far in the future. No point in inconveniencing the user.
