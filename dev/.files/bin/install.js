#!/usr/bin/env node
/**
 * Prepare CLI.
 *
 * @note PLEASE DO NOT EDIT THIS FILE!
 * @note This entire file will be updated automatically.
 * @note Instead of editing here, please review <https://github.com/clevercanyon/skeleton>.
 */
/* eslint-env es2021, node */

import _ from 'lodash';

import fs from 'node:fs';
import path from 'node:path';
import { dirname } from 'desm';

import coloredBox from 'boxen';
import terminalImage from 'term-img';
import chalk, { supportsColor } from 'chalk';

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import spawn from 'spawn-please';

const __dirname = dirname(import.meta.url);
const projDir = path.resolve(__dirname, '../../..');
const binDir = path.resolve(__dirname, '../../../dev/.files/bin');

const { log } = console;
const echo = process.stdout.write.bind(process.stdout);

const isParentTTY = process.stdout.isTTY ? true : false;
const isTTY = process.stdout.isTTY || process.env.PARENT_IS_TTY ? true : false;

const noisySpawnCfg = {
	cwd: projDir,
	env: { ...process.env, PARENT_IS_TTY: isTTY },
	stdout: (buffer) => echo(chalk.white(buffer.toString())),
	stderr: (buffer) => echo(chalk.gray(buffer.toString())),
};
const quietSpawnCfg = _.pick(noisySpawnCfg, ['cwd', 'env']);

const c10nLogo = path.resolve(__dirname, '../assets/brands/c10n/logo.png');
const c10nLogoDev = path.resolve(__dirname, '../assets/brands/c10n/logo-dev.png');

/**
 * NOTE: All commands in this file must support both interactive and noninteractive sessions. Installations occur across
 * a variety of platforms and environments. Therefore, it's important to exercise caution before making changes.
 */

/**
 * Project command.
 */
class Project {
	constructor(args) {
		this.args = args;
	}

	async run() {
		await this.install();

		if (this.args.dryRun) {
			log(chalk.cyanBright('Dry run. This was all a simulation.'));
		}
	}

	async install() {
		if ((await u.isGitRepo()) && (await u.isGitRepoDirty())) {
			// Now, we will allow a single `package-lock.json` change to exist as only difference.
			// e.g., In case of `npm install` having been run vs. `npm clean-install`, which does better.
			if ('M package-lock.json' !== u.gitStatus({ short: true })) {
				throw new Error('Git repo is dirty.');
			}
		}

		if (fs.existsSync(path.resolve(projDir, './package-lock.json'))) {
			log(chalk.green('Running a clean install of NPM packages.'));
			if (!this.args.dryRun) {
				await u.npmCleanInstall();
			}
		} else {
			log(chalk.green('Running an install of NPM packages.'));
			if (!this.args.dryRun) {
				await u.npmInstall();
			}
		}

		if (await u.isEnvsVault()) {
			log(chalk.green('Setting up `.env.vault`.'));
			if (!this.args.dryRun) {
				await u.envsSetupOrDecrypt({ mode: this.args.mode });
			}
		}

		log(chalk.green('Building with Vite; `' + this.args.mode + '` mode.'));
		if (!this.args.dryRun) {
			await u.viteBuild({ mode: this.args.mode });
		}

		log(await u.finale('Success', 'Project install complete.'));
	}
}

/**
 * Utilities.
 */
class u {
	/*
	 * TTY utilities.
	 */

	static async isInteractive() {
		return isTTY && process.env.TERM && 'dumb' !== process.env.TERM && 'true' !== process.env.CI;
	}

	/*
	 * Git utilities.
	 */

	static async isGitRepo() {
		try {
			return 'true' === String(await spawn('git', ['rev-parse', '--is-inside-work-tree'], quietSpawnCfg)).trim();
		} catch {
			return false;
		}
	}

	static async isGitRepoDirty() {
		return '' !== (await u.gitStatus({ short: true }));
	}

	static async gitStatus(opts = { short: false }) {
		return String(await spawn('git', ['status', ...(opts.short ? ['--short'] : []), '--porcelain'], quietSpawnCfg)).trim();
	}

	/*
	 * Env utilities.
	 */

	static async isEnvsVault() {
		return fs.existsSync(path.resolve(projDir, './.env.vault'));
	}

	static async envsSetupOrDecrypt(opts = { mode: 'prod' }) {
		if (!(await u.isInteractive()) /* Use keys. */) {
			const env = process.env; // Shorter reference.
			const keys = [_.get(env, 'C10N_DOTENV_KEY_MAIN', '')];

			if ('dev' === opts.mode) {
				keys.push(_.get(env, 'C10N_DOTENV_KEY_DEV', ''));
			} else if ('ci' === opts.mode) {
				keys.push(_.get(env, 'C10N_DOTENV_KEY_CI', ''));
			} else if ('stage' === opts.mode) {
				keys.push(_.get(env, 'C10N_DOTENV_KEY_STAGE', ''));
			} else if ('prod' === opts.mode) {
				keys.push(_.get(env, 'C10N_DOTENV_KEY_PROD', ''));
			}
			for (const key of keys) {
				if (!key) {
					throw new Error('Missing env key(s).');
				}
			}
			await spawn(path.resolve(binDir, './envs.js'), ['decrypt', '--keys', ...keys], noisySpawnCfg);
		} else {
			await spawn(path.resolve(binDir, './envs.js'), ['setup'], noisySpawnCfg);
		}
	}

	/*
	 * NPM utilities.
	 */

	static async npmLifecycleEvent() {
		return process.env.npm_lifecycle_event || ''; // NPM script name.
	}

	static async npmLifecycleScript() {
		return process.env.npm_lifecycle_script || ''; // NPM script value.
	}

	static async npmInstall() {
		await spawn('npm', ['install'], noisySpawnCfg);
	}

	static async npmCleanInstall() {
		await spawn('npm', ['ci'], noisySpawnCfg);
	}

	/*
	 * Vite utilities.
	 */

	static async viteBuild(opts = { mode: 'prod' }) {
		await spawn('npx', ['vite', 'build', '--mode', opts.mode], noisySpawnCfg);
		await spawn('npx', ['tsc'], noisySpawnCfg); // TypeScript types.
	}

	/**
	 * Error utilities.
	 */
	static async error(title, text) {
		if (!isParentTTY || !supportsColor?.has16m) {
			return chalk.red(text); // No box.
		}
		return (
			'\n' +
			coloredBox(chalk.red(text), {
				margin: 0,
				padding: 0.75,
				textAlignment: 'left',

				dimBorder: false,
				borderStyle: 'round',
				borderColor: '#551819',
				backgroundColor: '',

				titleAlignment: 'left',
				title: chalk.redBright('⚑ ' + title),
			}) +
			'\n' +
			(await terminalImage(c10nLogoDev, { width: '300px', fallback: () => '' }))
		);
	}

	/**
	 * Finale utilities.
	 */
	static async finale(title, text) {
		if (!isParentTTY || !supportsColor?.has16m) {
			return chalk.green(text); // No box.
		}
		return (
			'\n' +
			coloredBox(chalk.green(text), {
				margin: 0,
				padding: 0.75,
				textAlignment: 'left',

				dimBorder: false,
				borderStyle: 'round',
				borderColor: '#445d2c',
				backgroundColor: '',

				titleAlignment: 'left',
				title: chalk.greenBright('✓ ' + title),
			}) +
			'\n' +
			(await terminalImage(c10nLogo, { width: '300px', fallback: () => '' }))
		);
	}
}

/**
 * Yargs ⛵🏴‍☠
 *
 * @see http://yargs.js.org/docs/
 */
(async () => {
	await yargs(hideBin(process.argv))
		.command({
			command: ['project'],
			desc: 'Installs NPM packages, envs, and builds distro.',
			builder: (yargs) => {
				yargs
					.options({
						mode: {
							type: 'string',
							requiresArg: true,
							demandOption: false,
							default: 'prod',
							choices: ['dev', 'ci', 'stage', 'prod'],
							description: 'Build and env mode.',
						},
						dryRun: {
							type: 'boolean',
							requiresArg: false,
							demandOption: false,
							default: false,
							description: 'Dry run?',
						},
					})
					.check(async (/* args */) => {
						return true;
					});
			},
			handler: async (args) => {
				await new Project(args).run();
			},
		})
		.fail(async (message, error /* , yargs */) => {
			if (error.stack && typeof error.stack === 'string') log(chalk.gray(error.stack));
			log(await u.error('Problem', error ? error.toString() : message));
			process.exit(1);
		})
		.strict()
		.parse();
})();
