/**
 * Dotfiles updater.
 *
 * @note PLEASE DO NOT EDIT THIS FILE!
 * @note This entire file will be updated automatically.
 * @note Instead of editing here, please review <https://github.com/clevercanyon/skeleton>.
 */
/* eslint-env es2021, node */

import fs from 'node:fs';
import path from 'node:path';
import fsp from 'node:fs/promises';

import chalk from 'chalk';
import mc from 'merge-change';
import { dirname } from 'desm';
import spawn from 'spawn-please';
import { globbyStream } from 'globby';

import customRegexp from './data/custom-regexp.js';

const { log } = console;

export default async ({ projDir, args }) => {
	/**
	 * Initializes vars.
	 */
	const __dirname = dirname(import.meta.url);

	const projsDir = path.dirname(projDir);
	const thisS6nDir = path.resolve(__dirname, '../../../..');

	const pkgFile = path.resolve(projDir, './package.json');
	const pkg = JSON.parse((await fsp.readFile(pkgFile)).toString());

	let locks = pkg.config?.c10n?.['&']?.dotfiles?.lock || [];
	locks = locks.map((relPath) => path.resolve(projDir, relPath));

	const quietSpawnCfg = { cwd: projDir };

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
		await fsp.cp(path.resolve(thisS6nDir, relPath), path.resolve(projDir, relPath), { recursive: true });
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
		'./.prettierignore',
		'./.prettierrc.cjs',
		'./.shellcheckrc',
		'./.stylelintrc.cjs',
		'./.tailwindrc.cjs',
		'./tsconfig.json',
		'./vite.config.js',
		'./wrangler.toml',
	]) {
		if (isLocked(relPath)) {
			continue; // Locked 🔒.
		}
		let newFileContents = ''; // Initialize.

		if (fs.existsSync(path.resolve(projDir, relPath))) {
			const oldFileContents = (await fsp.readFile(path.resolve(projDir, relPath))).toString();
			const oldFileMatches = customRegexp.exec(oldFileContents); // See: `./data/custom-regexp.js`.
			const oldFileCustomCode = oldFileMatches ? oldFileMatches[2] : ''; // We'll preserve any custom code.
			newFileContents = (await fsp.readFile(path.resolve(thisS6nDir, relPath))).toString().replace(customRegexp, ($_, $1, $2, $3) => $1 + oldFileCustomCode + $3);
		} else {
			newFileContents = (await fsp.readFile(path.resolve(thisS6nDir, relPath))).toString();
		}
		await fsp.mkdir(path.dirname(path.resolve(projDir, relPath)), { recursive: true });
		await fsp.writeFile(path.resolve(projDir, relPath), newFileContents);

		if ('@clevercanyon/skeleton' === pkg.name && args.skeletonUpdatesOthers && ['./.gitattributes', './.gitignore', './.npmignore', './.npmrc'].includes(relPath)) {
			const otherGlobs = '{skeleton-dev-deps,*.fork,forks/*.fork}'; // The "others" we'll update.
			const globStream = globbyStream(otherGlobs, { expandDirectories: false, onlyDirectories: true, absolute: true, cwd: projsDir, dot: false });

			for await (const projDir of globStream) {
				if (!fs.existsSync(path.resolve(projDir, './package.json'))) {
					continue; // False positive. No `package.json` file.
				}
				let newFileContents = ''; // Initialize.

				if (fs.existsSync(path.resolve(projDir, relPath))) {
					const oldFileContents = (await fsp.readFile(path.resolve(projDir, relPath))).toString();
					const oldFileMatches = customRegexp.exec(oldFileContents); // See: `./data/custom-regexp.js`.
					const oldFileCustomCode = oldFileMatches ? oldFileMatches[2] : ''; // We'll preserve any custom code.
					newFileContents = (await fsp.readFile(path.resolve(thisS6nDir, relPath))).toString().replace(customRegexp, ($_, $1, $2, $3) => $1 + oldFileCustomCode + $3);
				} else {
					newFileContents = (await fsp.readFile(path.resolve(thisS6nDir, relPath))).toString();
				}
				await fsp.mkdir(path.dirname(path.resolve(projDir, relPath)), { recursive: true });
				await fsp.writeFile(path.resolve(projDir, relPath), newFileContents);
			}
		}
	}

	/**
	 * Adds up-to-date copies of missing mutable files.
	 */
	for (const relPath of [
		'./LICENSE.txt', //
		'./README.md',
	]) {
		if (isLocked(relPath)) {
			continue; // Locked 🔒.
		}
		if (!fs.existsSync(path.resolve(projDir, relPath))) {
			await fsp.cp(path.resolve(thisS6nDir, relPath), path.resolve(projDir, relPath));
		}
	}

	/**
	 * Adds and/or updates updateable JSON files.
	 */
	for (const relPath of [
		'./package.json', //
	]) {
		if (isLocked(relPath)) {
			continue; // Locked 🔒.
		}
		if (!fs.existsSync(path.resolve(projDir, relPath))) {
			await fsp.cp(path.resolve(thisS6nDir, relPath), path.resolve(projDir, relPath));
		}
		const json = JSON.parse((await fsp.readFile(path.resolve(projDir, relPath))).toString());
		const updatesFile = path.resolve(thisS6nDir, './dev/.files/bin/updater/data', relPath, './updates.json');

		if (fs.existsSync(updatesFile)) {
			mc.patch(json, JSON.parse((await fsp.readFile(updatesFile)).toString()));
			await fsp.writeFile(path.resolve(projDir, relPath), JSON.stringify(json, null, 4));
		}
	}

	/**
	 * Updates `@clevercanyon/skeleton-dev-deps` in project dir.
	 */
	log(chalk.green('Updating project to latest `@clevercanyon/skeleton-dev-deps`.'));
	await spawn('npm', ['udpate', '@clevercanyon/skeleton-dev-deps', '--silent'], quietSpawnCfg);
};
