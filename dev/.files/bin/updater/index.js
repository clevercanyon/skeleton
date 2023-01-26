/**
 * Dotfiles updater.
 *
 * @note PLEASE DO NOT EDIT THIS FILE!
 * @note This entire file will be updated automatically.
 * @note Instead of editing here, please review <https://github.com/clevercanyon/skeleton>.
 */
/* eslint-env es2021, node */

import _ from 'lodash';

import fs from 'node:fs';
import path from 'node:path';
import fsp from 'node:fs/promises';

import { dirname } from 'desm';
import { globbyStream } from 'globby';

import chalk from 'chalk';
import mc from 'merge-change';
import prettier from 'prettier';
import spawn from 'spawn-please';

import customRegexp from './data/custom-regexp.js';
import coreProjects from '../includes/core-projects.js';

const { log } = console; // Shorter reference.

export default async ({ projDir, args }) => {
	/**
	 * Initializes vars.
	 */
	const __dirname = dirname(import.meta.url);
	const projsDir = path.dirname(projDir); // One level up.
	const skeletonDir = path.resolve(__dirname, '../../../..');

	/**
	 * Escapes string for use in a regular expression.
	 *
	 * @param   {string} str String to escape.
	 *
	 * @returns {string}     Escaped string.
	 */
	const escRegExp = (str) => {
		return str.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
	};

	/**
	 * Gets current `./package.json`.
	 *
	 * @returns {object} Parsed `./package.json`.
	 */
	const getPkg = async () => {
		const pkgFile = path.resolve(projDir, './package.json');
		const pkg = JSON.parse(fs.readFileSync(pkgFile).toString());

		if (typeof pkg !== 'object') {
			throw new Error('updater.getPkg: Unable to parse `./package.json`.');
		}
		return pkg;
	};

	/**
	 * Gets properties from `./package.json` file.
	 */
	const { pkgRepository, pkgDotfileLocks } = await (async () => {
		const pkg = await getPkg();
		const pkgRepository = pkg.repository || '';

		let pkgDotfileLocks = _.get(pkg, 'config.c10n.&.dotfiles.lock', []);
		pkgDotfileLocks = pkgDotfileLocks.map((relPath) => path.resolve(projDir, relPath));

		return { pkgRepository, pkgDotfileLocks };
	})();

	/**
	 * Tests `pkgRepository` against an `owner/repo` string.
	 *
	 * @param   {string}  ownerRepo An `owner/repo` string.
	 *
	 * @returns {boolean}           True if current package repo is `ownerRepo`.
	 */
	const isPkgRepo = async (ownerRepo) => {
		return new RegExp('[:/]' + escRegExp(ownerRepo) + '(?:\\.git)?$', 'iu').test(pkgRepository);
	};

	/**
	 * Checks dotfile locks.
	 *
	 * @param   {string}  relPath Relative dotfile path.
	 *
	 * @returns {boolean}         True if relative path is locked by `package.json`.
	 */
	const isLocked = async (relPath) => {
		// Compares absolute paths to each other.
		const absPath = path.resolve(projDir, relPath);

		for (let i = 0; i < pkgDotfileLocks.length; i++) {
			if (absPath === pkgDotfileLocks[i]) {
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
		await fsp.cp(path.resolve(skeletonDir, relPath), path.resolve(projDir, relPath), { recursive: true });
	}
	await fsp.chmod(path.resolve(projDir, './dev/.files/bin/envs.js'), 0o700);
	await fsp.chmod(path.resolve(projDir, './dev/.files/bin/install.js'), 0o700);
	await fsp.chmod(path.resolve(projDir, './dev/.files/bin/update.js'), 0o700);

	/**
	 * Updates semi-immutable dotfiles.
	 */
	for (const relPath of [
		'./.github/dependabot.yml',
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
		if (await isLocked(relPath)) {
			continue; // Locked 🔒.
		}
		let newFileContents = ''; // Initialize.

		if (fs.existsSync(path.resolve(projDir, relPath))) {
			const oldFileContents = (await fsp.readFile(path.resolve(projDir, relPath))).toString();
			const oldFileMatches = customRegexp.exec(oldFileContents); // See: `./data/custom-regexp.js`.
			const oldFileCustomCode = oldFileMatches ? oldFileMatches[2] : ''; // We'll preserve any custom code.
			newFileContents = (await fsp.readFile(path.resolve(skeletonDir, relPath))).toString().replace(customRegexp, ($_, $1, $2, $3) => $1 + oldFileCustomCode + $3);
		} else {
			newFileContents = (await fsp.readFile(path.resolve(skeletonDir, relPath))).toString();
		}
		await fsp.mkdir(path.dirname(path.resolve(projDir, relPath)), { recursive: true });
		await fsp.writeFile(path.resolve(projDir, relPath), newFileContents);

		if (args.skeletonUpdatesOthers && (await isPkgRepo('clevercanyon/skeleton')) && coreProjects.updates.skeletonOthers.files.includes(relPath)) {
			const otherGlobs = coreProjects.updates.skeletonOthers.globs; // The “others” we'll update.
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
					newFileContents = (await fsp.readFile(path.resolve(skeletonDir, relPath))).toString().replace(customRegexp, ($_, $1, $2, $3) => $1 + oldFileCustomCode + $3);
				} else {
					newFileContents = (await fsp.readFile(path.resolve(skeletonDir, relPath))).toString();
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
		if (await isLocked(relPath)) {
			continue; // Locked 🔒.
		}
		if (!fs.existsSync(path.resolve(projDir, relPath))) {
			await fsp.cp(path.resolve(skeletonDir, relPath), path.resolve(projDir, relPath));
		}
	}

	/**
	 * Adds and/or updates updateable JSON files.
	 */
	for (const relPath of [
		'./package.json', //
	]) {
		if (await isLocked(relPath)) {
			continue; // Locked 🔒.
		}
		if (!fs.existsSync(path.resolve(projDir, relPath))) {
			await fsp.cp(path.resolve(skeletonDir, relPath), path.resolve(projDir, relPath));
		}
		const json = JSON.parse((await fsp.readFile(path.resolve(projDir, relPath))).toString());
		const jsonUpdatesFile = path.resolve(skeletonDir, './dev/.files/bin/updater/data', relPath, './updates.json');

		if (typeof json !== 'object') {
			throw new Error('updater: Unable to parse `' + relPath + '`.');
		}
		if (fs.existsSync(jsonUpdatesFile)) {
			const jsonUpdates = JSON.parse((await fsp.readFile(jsonUpdatesFile)).toString());

			if (typeof jsonUpdates !== 'object') {
				throw new Error('updater: Unable to parse `' + jsonUpdatesFile + '`.');
			}
			if ('./package.json' === relPath && (await isPkgRepo('clevercanyon/skeleton-dev-deps'))) {
				if (jsonUpdates.devDependencies?.['@clevercanyon/skeleton-dev-deps']) {
					delete jsonUpdates.devDependencies['@clevercanyon/skeleton-dev-deps'];
				}
				if (jsonUpdates.devDependencies?.$set?.['@clevercanyon/skeleton-dev-deps']) {
					delete jsonUpdates.devDependencies.$set['@clevercanyon/skeleton-dev-deps'];
				}
			}
			mc.patch(json, jsonUpdates); // Merges potentially declarative ops.
			const prettierCfg = { ...(await prettier.resolveConfig(path.resolve(projDir, relPath))), parser: 'json' };
			await fsp.writeFile(path.resolve(projDir, relPath), prettier.format(JSON.stringify(json, null, 4), prettierCfg));
		}
	}

	/**
	 * Updates `@clevercanyon/skeleton-dev-deps` in project dir.
	 */
	if (!(await isPkgRepo('clevercanyon/skeleton-dev-deps'))) {
		log(chalk.green('Updating project to latest `@clevercanyon/skeleton-dev-deps`.'));
		await spawn('npm', ['udpate', '@clevercanyon/skeleton-dev-deps', '--silent'], { cwd: projDir });
	}
};
