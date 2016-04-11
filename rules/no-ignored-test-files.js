'use strict';
var path = require('path');
var pkgUp = require('pkg-up');
var multimatch = require('multimatch');
var util = require('../util');
var createAvaRule = require('../create-ava-rule');

var defaultFiles = [
	'test.js',
	'test-*.js',
	'test/**/*.js',
	'**/__tests__/**/*.js',
	'**/*.test.js'
];

var excludedFolders = [
	'**/fixtures/**',
	'**/helpers/**'
];

function isIgnored(rootDir, files, filepath) {
	var relativeFilePath = path.relative(rootDir, filepath);
	if (multimatch([relativeFilePath], excludedFolders).length !== 0) {
		return 'Test file is ignored because it is in `' + excludedFolders.join(' ') + '`';
	}

	if (multimatch([relativeFilePath], files).length === 0) {
		return 'Test file is ignored because it is not in `' + files.join(' ') + '`';
	}

	return null;
}

function getPackageInfo() {
	var packageFilePath = pkgUp.sync();
	return {
		rootDir: packageFilePath && path.dirname(packageFilePath),
		files: util.getAvaConfig(packageFilePath).files
	};
}

/* eslint quote-props: [2, "as-needed"] */
module.exports = function (context) {
	var ava = createAvaRule();
	var packageInfo = getPackageInfo();
	var options = context.options[0] || {};
	var files = options.files || packageInfo.files || defaultFiles;
	var hasTestCall = false;

	if (!packageInfo.rootDir) {
		// Could not find a package.json folder
		return {};
	}

	return ava.merge({
		CallExpression: function (node) {
			if (ava.isTestFile && ava.currentTestNode === node) {
				hasTestCall = true;
			}
		},
		'Program:exit': function (node) {
			if (!hasTestCall) {
				return;
			}

			var ignoredReason = isIgnored(packageInfo.rootDir, files, context.getFilename());
			if (ignoredReason) {
				context.report(node, ignoredReason);
			}
			hasTestCall = false;
		}
	});
};

module.exports.schema = [{
	type: 'object',
	properties: {
		files: {
			type: 'array'
		}
	}
}];
