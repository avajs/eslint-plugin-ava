'use strict';
const path = require('path');
const arrify = require('arrify');
const pkgUp = require('pkg-up');
const multimatch = require('multimatch');
const {visitIf} = require('enhance-visitors');
const util = require('../util');
const createAvaRule = require('../create-ava-rule');

const excludedFolders = [
	'**/fixtures/**',
	'**/helpers/**'
];

function isIgnored(rootDir, files, filepath) {
	const relativeFilePath = path.relative(rootDir, filepath);

	if (multimatch([relativeFilePath], excludedFolders).length !== 0) {
		return `Test file is ignored because it is in \`${excludedFolders.join(' ')}\`.`;
	}

	if (multimatch([relativeFilePath], files).length === 0) {
		return `Test file is ignored because it is not in \`${files.join(' ')}\`.`;
	}

	return null;
}

function getPackageInfo() {
	const packageFilePath = pkgUp.sync();

	return {
		rootDir: packageFilePath && path.dirname(packageFilePath),
		files: util.getAvaConfig(packageFilePath).files
	};
}

const create = context => {
	const filename = context.getFilename();

	if (filename === '<text>') {
		return {};
	}

	const ava = createAvaRule();
	const packageInfo = getPackageInfo();
	const options = context.options[0] || {};
	const files = arrify(options.files || packageInfo.files || util.defaultFiles);
	let hasTestCall = false;

	if (!packageInfo.rootDir) {
		// Could not find a package.json folder
		return {};
	}

	return ava.merge({
		CallExpression: visitIf([
			ava.isInTestFile,
			ava.isTestNode
		])(() => {
			hasTestCall = true;
		}),
		'Program:exit': node => {
			if (!hasTestCall) {
				return;
			}

			const ignoredReason = isIgnored(packageInfo.rootDir, files, filename);

			if (ignoredReason) {
				context.report({
					node,
					message: ignoredReason
				});
			}

			hasTestCall = false;
		}
	});
};

const schema = [{
	title: 'The `files` option is an array of strings representing the files glob that AVA will use to find test files.',
	$comment: 'The default value of the `files` option is from `package.json` or `ava.config.js`.',
	type: 'object',
	properties: {
		files: {
			type: 'array',
			minItems: 0,
			uniqueItems: true,
			items: {
				type: 'string'
			},
			examples: [
				['lib/**/*.test.js', 'utils/**/*.test.js']
			],
			default: undefined
		}
	}
}];

module.exports = {
	create,
	meta: {
		docs: {
			url: util.getDocsUrl(__filename)
		},
		type: 'problem',
		schema
	}
};
