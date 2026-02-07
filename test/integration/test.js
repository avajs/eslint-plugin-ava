#!/usr/bin/env node
import process from 'node:process';
import path from 'node:path';
import fs from 'node:fs/promises';
import os from 'node:os';
import {execa} from 'execa';
import chalk from 'chalk';

const packages = new Map([
	['chalk', 'https://github.com/chalk/chalk'],
	['wrap-ansi', 'https://github.com/chalk/wrap-ansi'],
	['np', 'https://github.com/sindresorhus/np'],
	['ora', 'https://github.com/sindresorhus/ora'],
	['p-map', 'https://github.com/sindresorhus/p-map'],
	['os-locale', 'https://github.com/sindresorhus/os-locale'],
	['execa', 'https://github.com/sindresorhus/execa'],
	['pify', 'https://github.com/sindresorhus/pify'],
	['boxen', 'https://github.com/sindresorhus/boxen'],
	['make-dir', 'https://github.com/sindresorhus/make-dir'],
	['listr', 'https://github.com/SamVerschueren/listr'],
	['listr-update-renderer', 'https://github.com/SamVerschueren/listr-update-renderer'],
	['bragg', 'https://github.com/SamVerschueren/bragg'],
	['bragg-router', 'https://github.com/SamVerschueren/bragg-router'],
	['dev-time', 'https://github.com/SamVerschueren/dev-time'],
	['decode-uri-component', 'https://github.com/SamVerschueren/decode-uri-component'],
	['to-ico', 'https://github.com/kevva/to-ico'],
	['download', 'https://github.com/kevva/download'],
	['brightness', 'https://github.com/kevva/brightness'],
	['decompress', 'https://github.com/kevva/decompress'],
	['npm-conf', 'https://github.com/kevva/npm-conf'],
	['imagemin', 'https://github.com/imagemin/imagemin'],
	['color-convert', 'https://github.com/qix-/color-convert'],
	['eslint-plugin-unicorn', 'https://github.com/sindresorhus/eslint-plugin-unicorn'],
	['ky', 'https://github.com/sindresorhus/ky'],
	['query-string', 'https://github.com/sindresorhus/query-string'],
	['meow', 'https://github.com/sindresorhus/meow'],
	['emittery', 'https://github.com/sindresorhus/emittery'],
	['p-queue', 'https://github.com/sindresorhus/p-queue'],
	['pretty-bytes', 'https://github.com/sindresorhus/pretty-bytes'],
	['normalize-url', 'https://github.com/sindresorhus/normalize-url'],
	['pageres', 'https://github.com/sindresorhus/pageres'],
	['got', 'https://github.com/sindresorhus/got'],
]);

const configDirectory = path.join(import.meta.dirname, 'eslint-config-ava-tester');

const runEslint = async (packageName, destination, extraArguments = []) => {
	const cliArguments = [
		'eslint',
		'--config',
		path.join(configDirectory, 'eslint.config.js'),
		'--no-config-lookup',
		destination,
		'--format',
		'json',
		...extraArguments,
	];

	let stdout;
	try {
		({stdout} = await execa('npx', cliArguments, {cwd: configDirectory}));
	} catch (error) {
		({stdout} = error);

		if (!stdout) {
			throw error;
		}
	}

	let files;
	try {
		files = JSON.parse(stdout);
	} catch (error) {
		console.error('Error while parsing eslint output:', error);
		throw error;
	}

	for (const file of files) {
		for (const message of file.messages) {
			if (message.fatal) {
				const error = new Error(message.message);
				error.eslintFile = file;
				error.eslintMessage = message;
				throw error;
			}
		}
	}
};

const testPackage = async (name, url) => {
	const destination = await fs.mkdtemp(path.join(os.tmpdir(), `eslint-ava-${name}-`));

	try {
		console.log(`${chalk.cyan(name)}: Cloning...`);
		await execa('git', ['clone', url, '--single-branch', destination]);

		console.log(`${chalk.cyan(name)}: Running eslint...`);
		await runEslint(name, destination);

		console.log(`${chalk.cyan(name)}: Running eslint --fix...`);
		await runEslint(name, destination, ['--fix-dry-run']);

		console.log(`${chalk.green(name)}: Passed`);
	} catch (error) {
		error.packageName = name;
		throw error;
	} finally {
		await fs.rm(destination, {recursive: true, force: true});
	}
};

// Setup
console.log('Installing dependencies...');
await execa('npm', ['install'], {cwd: configDirectory});

// Run integration tests concurrently
console.log('Running integration tests...');
const results = await Promise.allSettled(
	[...packages].map(([name, url]) => testPackage(name, url)),
);

// Report failures
const failures = results.filter(result => result.status === 'rejected');
if (failures.length > 0) {
	for (const {reason} of failures) {
		console.error('\n', chalk.red.bold.underline(reason.packageName));
		console.error(reason.message);

		if (reason.stderr) {
			console.error(chalk.gray(reason.stderr));
		}

		if (reason.eslintMessage) {
			console.error(chalk.gray(reason.eslintFile.filePath), chalk.gray(JSON.stringify(reason.eslintMessage, undefined, 2)));
		}
	}

	process.exit(1);
}

console.log(chalk.green('\nAll integration tests passed!'));
