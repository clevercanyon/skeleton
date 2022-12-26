/**
 * Dotfiles updater.
 *
 * @note PLEASE DO NOT EDIT THIS FILE!
 * @note This entire file will be updated automatically.
 * @note Instead of editing here, please review <https://github.com/clevercanyon/skeleton>.
 */
/* eslint-env es2021, node */

import chalk from 'chalk';
import desm from 'desm';
import mc from 'merge-change';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import spawn from 'spawn-please';
import customRegexp from './data/custom-regexp.js';

export default async ({ projDir }) => {
	/**
	 * Initializes vars.
	 */
	const __dirname = desm(import.meta.url);
	const tmpDir = path.resolve(__dirname, '../../../..');
	const pkg = JSON.parse(await fsp.readFile(path.resolve(projDir, './package.json')));

	let locks = pkg.config?.c10n?.['&']?.dotfiles?.lock || [];
	locks = locks.map((relPath) => path.resolve(projDir, relPath));

	/**
	 * Checks dotfile locks.
	 *
	 * @param   {string}  relPath Relative dotfile path.
	 *
	 * @returns {boolean}         True if relative path is locked by `package.json`.
	 */
	const isLocked = (relPath) => {
		// Compares absolute paths to each other.
		const absPath = path.resolve(projDir, relPath);

		for (let i = 0; i < locks.length; i++) {
			if (absPath === locks[i]) {
				return true; // Locked 🔒.
			}
		}
		return false;
	};

	/**
	 * Updates immutable directories.
	 */
	for (const relPath of ['./dev/.files']) {
		await fsp.rm(path.resolve(projDir, relPath), { recursive: true, force: true });
		await fsp.mkdir(path.resolve(projDir, relPath), { recursive: true });
		await fsp.cp(path.resolve(tmpDir, relPath), path.resolve(projDir, relPath), { recursive: true });
	}
	await fsp.chmod(path.resolve(projDir, './dev/.files/bin/update.js'), 0o700);

	/**
	 * Updates semi-immutable dotfiles.
	 */
	for (const relPath of [
		'./.github/FUNDING.yml', //
		'./.browserslistrc',
		'./.editorconfig',
		'./.eslintrc.cjs',
		'./.gitattributes',
		'./.gitignore',
		'./.npmignore',
		'./.npmrc',
		'./.postcssrc.cjs',
		'./.prettierrc.cjs',
		'./.shellcheckrc',
		'./.stylelintrc.cjs',
		'./.tailwindrc.cjs',
		'./tsconfig.json',
		'./vite.config.js',
		'./wrangler.toml',
	]) {
		if (isLocked(relPath)) {
			return; // Locked 🔒.
		}
		let newFileContents = ''; // Initialize.

		if (fs.existsSync(path.resolve(projDir, relPath))) {
			const oldFileContents = await fsp.readFile(path.resolve(projDir, relPath), 'utf8');
			const oldFileMatches = customRegexp.exec(oldFileContents); // See: `./data/custom-regexp.js`.
			const oldFileCustomCode = oldFileMatches ? oldFileMatches[2] : ''; // We'll preserve any custom code.
			newFileContents = (await fsp.readFile(path.resolve(tmpDir, relPath), 'utf8')).replace(customRegexp, ($_, $1, $2, $3) => $1 + oldFileCustomCode + $3);
		} else {
			newFileContents = await fsp.readFile(path.resolve(tmpDir, relPath), 'utf8');
		}
		await fsp.mkdir(path.dirname(path.resolve(projDir, relPath)), { recursive: true });
		await fsp.writeFile(path.resolve(projDir, relPath), newFileContents);
	}

	/**
	 * Adds up-to-date copies of missing mutable files.
	 */
	for (const relPath of [
		'./LICENSE.txt', //
		'./README.md',
	]) {
		if (isLocked(relPath)) {
			return; // Locked 🔒.
		}
		if (!fs.existsSync(path.resolve(projDir, relPath))) {
			await fsp.cp(path.resolve(tmpDir, relPath), path.resolve(projDir, relPath));
		}
	}

	/**
	 * Adds and/or updates updateable JSON files.
	 */
	for (const relPath of [
		'./package.json', //
	]) {
		if (isLocked(relPath)) {
			return; // Locked 🔒.
		}
		if (!fs.existsSync(path.resolve(projDir, relPath))) {
			await fsp.cp(path.resolve(tmpDir, relPath), path.resolve(projDir, relPath));
		}
		const json = JSON.parse(await fsp.readFile(path.resolve(projDir, relPath)));
		const updatesFile = path.resolve(tmpDir, './dev/.files/bin/updater/data', relPath, './updates.json');

		if (fs.existsSync(updatesFile)) {
			mc.patch(json, JSON.parse(await fsp.readFile(updatesFile)));
			await fsp.writeFile(path.resolve(projDir, relPath), JSON.stringify(json, null, 4));
		}
	}

	/**
	 * Updates `@clevercanyon/skeleton-dev-deps` in project dir.
	 */
	console.log(chalk.green('Updating project to latest `clevercanyon/skeleton-dev-deps`.'));

	await spawn('npm', ['udpate', '@clevercanyon/skeleton-dev-deps', '--silent'], {
		cwd: projDir, // Displays output while running.
		stdout: (buffer) => console.log(chalk.blue(buffer.toString())),
		stderr: (buffer) => console.log(chalk.redBright(buffer.toString())),
	});
};
