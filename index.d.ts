import type {ESLint, Linter} from 'eslint';

declare const eslintPluginAva: ESLint.Plugin & {
	configs: {
		recommended: Linter.Config;
	};
};

export default eslintPluginAva;
