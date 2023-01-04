#!/usr/bin/env node
/**
 * Update CLI.
 *
 * @note PLEASE DO NOT EDIT THIS FILE!
 * @note This entire file will be updated automatically.
 * @note Instead of editing here, please review <https://github.com/clevercanyon/skeleton>.
 */
/* eslint-env es2021, node */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import fsp from 'node:fs/promises';

import _ from 'lodash';
import chalk from 'chalk';
import { dirname } from 'desm';
import spawn from 'spawn-please';
import { globby } from 'globby';
import mm from 'micromatch';

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { splitCMD } from '@clevercanyon/split-cmd.fork';

const __dirname = dirname(import.meta.url);
const projsDir = path.resolve(__dirname, '../../../..');
const projDir = path.resolve(__dirname, '../../..');
const binDir = path.resolve(__dirname, '../../../dev/.files/bin');

const pkgFile = path.resolve(projDir, './package.json');
const pkg = JSON.parse(fs.readFileSync(pkgFile).toString());

const { log } = console;
const echo = process.stdout.write.bind(process.stdout);
const isTTY = process.stdout.isTTY || process.env.IS_PARENT_TTY ? true : false;

const noisySpawnCfg = {
	cwd: projDir,
	env: { ...process.env, IS_PARENT_TTY: isTTY },
	stdout: (buffer) => echo(chalk.blue(buffer.toString())),
	stderr: (buffer) => echo(chalk.redBright(buffer.toString())),
};
const quietSpawnCfg = _.pick(noisySpawnCfg, ['cwd', 'env']);

const coreProjectsIgnore = ['.*', 'forks/'];
const coreProjectsOrder = [
	'forks/is-number.fork',
	'forks/to-regex-range.fork',
	'forks/fill-range.fork',
	'forks/braces.fork',
	'forks/picomatch.fork',
	'forks/micromatch.fork',

	'forks/split-cmd.fork',
	'forks/merge-change.fork',
	'forks/*.fork',

	'skeleton-dev-deps',
	'skeleton',

	'utilities',
	'utilities.php',
	'utilities.bash',
	'utilities.web',
	'utilities.web',
	'utilities.webw',
	'utilities.node',
	'utilities.cfw',
	'utilities.cfp',
	'utilities.*',

	'skeleton.*',
];

/**
 * NOTE: All of these commands _must_ be performed interactively. Please eview the Yargs configuration below for further
 * details. At this time, there are no exceptions. Every update _must_ occur interactively.
 */

/**
 * Projects command.
 */
class Projects {
	constructor(args) {
		this.args = args;
	}

	async run() {
		await this.update();

		if (this.args.dryRun) {
			log(chalk.cyanBright('Dry run. This was all a simulation.'));
		}
	}

	async update() {
		let i; // Initialize.
		const orderedResults = [];
		const hasAllGlob = this.args.glob.includes('*');

		await this.doGitIgnoreSetup(); // `.~gitignore` file.

		const unorderedResults = await globby(this.args.glob, {
			cwd: projsDir,
			onlyDirectories: true,
			expandDirectories: false,

			gitignore: true,
			ignoreFiles: ['.~gitignore'],
			ignore: coreProjectsIgnore.concat(this.args.ignore),
		});
		for (const projDirSubpathGlob of coreProjectsOrder.concat(this.args.order)) {
			for (const projDirSubpath of mm(unorderedResults, projDirSubpathGlob)) {
				if (-1 === (i = unorderedResults.indexOf(projDirSubpath))) {
					continue; // Not applicable.
				}
				orderedResults.push(unorderedResults[i]);
				unorderedResults.splice(i, 1);
			}
		}
		for await (const projDirSubpath of orderedResults.concat(unorderedResults)) {
			const projDir = path.resolve(projsDir, projDirSubpath);
			const projDisplayDir = path.basename(projsDir) + '/' + projDirSubpath;

			const devFilesDir = path.resolve(projDir, './dev/.files');
			const pkgFile = path.resolve(projDir, './package.json');

			if (hasAllGlob && !fs.existsSync(devFilesDir)) {
				log(chalk.gray('No `./dev/.files` inside `' + projDisplayDir + '`. Bypassing on all-glob.'));
				continue; // No `./dev/.files` directory.
			}
			if (hasAllGlob && !fs.existsSync(pkgFile)) {
				log(chalk.gray('No `./package.json` in `' + projDisplayDir + '`. Bypassing on all-glob.'));
				continue; // No `./package.json` file.
			}
			if (this.args.cmd) {
				for (const cmd of this.args.cmd.split(/\s*&&\s*/u)) {
					log(chalk.green('Running `' + cmd + '` in:') + ' ' + chalk.yellow(projDisplayDir));
					if (!this.args.dryRun) {
						const split = splitCMD(cmd); // Splits into props.
						await spawn(split.cmd, split.args, { ...noisySpawnCfg, cwd: projDir });
					}
				}
			}
			if (this.args.run.length) {
				for (const run of this.args.run) {
					log(chalk.green('Running `npm run ' + run + '` in:') + ' ' + chalk.yellow(projDisplayDir));
					if (!this.args.dryRun) {
						await spawn('npm', ['run', run], { ...noisySpawnCfg, cwd: projDir });
					}
				}
			}
		}
		log(chalk.green('Project updates complete.'));
	}

	async doGitIgnoreSetup() {
		if (fs.existsSync(path.resolve(projDir, './.gitignore'))) {
			const gitIgnoreFile = path.resolve(projsDir, './.~gitignore');
			await fsp.copyFile(path.resolve(projDir, './.gitignore'), gitIgnoreFile);
		}
	}
}

/**
 * Dotfiles command.
 */
class Dotfiles {
	constructor(args) {
		this.args = args;
	}

	async run() {
		await this.update();

		if (this.args.dryRun) {
			log(chalk.cyanBright('Dry run. This was all a simulation.'));
		}
	}

	async update() {
		/**
		 * Saves skeleton changes.
		 */
		if ('@clevercanyon/skeleton' === pkg.name && (await u.isGitRepo()) && (await u.isGitRepoDirty())) {
			log(chalk.green('Updating `@clevercanyon/skeleton` git repo; `' + (await u.gitCurrentBranch()) + '` branch.'));
			log('    ' + chalk.green('i.e., saving latest skeleton changes before self-update.'));

			if (!this.args.dryRun) {
				await u.gitAddCommitPush();
			}
		}

		/**
		 * Prepares latest skeleton.
		 */
		const s6nRepoURI = 'git@github.com:clevercanyon/skeleton.git';
		const s6nRepoDir = path.resolve(os.tmpdir(), './clevercanyon/7fbdd94a-544e-4914-8955-22ab82bc6b29');

		if (fs.existsSync(s6nRepoDir) && (await u.gitLocalRepoSHA(s6nRepoDir, 'main')) === (await u.gitRemoteRepoSHA(s6nRepoURI, 'main'))) {
			log(chalk.green('Using latest `@clevercanyon/skeleton` from cache.'));
		} else {
			log(chalk.green('Git-cloning, and caching, latest `@clevercanyon/skeleton`.'));
			if (!this.args.dryRun) {
				await fsp.rm(s6nRepoDir, { recursive: true, force: true });
				await fsp.mkdir(s6nRepoDir, { recursive: true }); // Starts fresh.
				await spawn('git', ['clone', s6nRepoURI, s6nRepoDir, '--branch=main', '--depth=1', '--quiet'], { ...noisySpawnCfg, cwd: s6nRepoDir });
			}
			log(chalk.green('Installing `@clevercanyon/skeleton`’s NPM dependencies.'));
			if (!this.args.dryRun) {
				await spawn('npm', ['clean-install', '--include=dev', '--silent'], { ...noisySpawnCfg, cwd: s6nRepoDir });
			}
		}

		/**
		 * Runs updater using files from latest skeleton.
		 */
		log(chalk.green('Running updater using latest `@clevercanyon/skeleton`.'));
		if (!this.args.dryRun) {
			await (await import(path.resolve(s6nRepoDir, './dev/.files/bin/updater/index.js'))).default({ projDir, args: this.args });
		}

		/**
		 * Completes dotfiles update.
		 */
		log(chalk.green('Dotfiles update complete.'));
	}
}

/**
 * Project command.
 */
class Project {
	constructor(args) {
		this.args = args;
	}

	async run() {
		await this.update();

		if (this.args.dryRun) {
			log(chalk.cyanBright('Dry run. This was all a simulation.'));
		}
	}

	async update() {
		log(chalk.green('Updating NPM packages.'));
		if (!this.args.dryRun) {
			await u.npmUpdate();
		}

		if (await u.isEnvsVault()) {
			log(chalk.green('Encrypting `.env.vault`.'));
			if (!this.args.dryRun) {
				await u.envsEncrypt(); // Before NPM version patch.
			}
		}
		if (this.args.repos && this.args.pkgs && (await u.isNPMPkgPublishable({ mode: this.args.mode }))) {
			log(chalk.green('NPM package will publish, so patching NPM version prior to build.'));
			if (!this.args.dryRun) {
				await u.npmVersionPatch(); // Git commit(s) + tag.
			}
		}
		log(chalk.green('Updating Vite build; `' + this.args.mode + '` mode.'));
		if (!this.args.dryRun) {
			await u.viteBuild({ mode: this.args.mode });
		}

		if (this.args.repos) {
			if (await u.isGitRepo()) {
				log(chalk.green('Updating git repo; `' + (await u.gitCurrentBranch()) + '` branch.'));
				if (!this.args.dryRun) {
					await u.gitAddCommitPush();
				}
			} else {
				log(chalk.gray('Not a git repo.'));
			}

			if (await u.isEnvsVault()) {
				log(chalk.green('Updating envs repo.'));
				if (!this.args.dryRun) {
					await u.envsPush();
				}
			} else {
				log(chalk.gray('Not an envs repo.'));
			}

			if (this.args.pkgs) {
				if (await u.isNPMPkgPublishable({ mode: this.args.mode })) {
					log(chalk.green('Publishing NPM package.'));
					if (!this.args.dryRun) {
						await u.npmPublish();
					}
				} else {
					log(chalk.gray('Not an NPM package. Or, not in a publishable state.'));
				}
			}
		}
		log(chalk.green('Project update complete.'));
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

	static async gitChange() {
		await fsp.writeFile(path.resolve(projDir, './.gitchange'), String(Date.now()));
	}

	static async gitAddCommit(message = 'Robotic update.') {
		await u.gitChange(); // Force a change.
		await spawn('git', ['add', '--all'], noisySpawnCfg);
		await spawn('git', ['commit', '--message', message], noisySpawnCfg);
	}

	static async gitAddCommitPush(message = 'Robotic update.') {
		await u.gitChange(); // Force a change.
		const branch = await u.gitCurrentBranch();

		await spawn('git', ['add', '--all'], noisySpawnCfg);
		await spawn('git', ['commit', '--message', message], noisySpawnCfg);

		await spawn('git', ['push', '--set-upstream', 'origin', branch], noisySpawnCfg);
		await spawn('git', ['push', 'origin', '--tags'], noisySpawnCfg);
	}

	static async gitCurrentBranch() {
		return String(await spawn('git', ['symbolic-ref', '--short', '--quiet', 'HEAD'], quietSpawnCfg)).trim();
	}

	static async gitLocalRepoSHA(repoDir, branch) {
		return String(await spawn('git', ['rev-parse', branch], { ...quietSpawnCfg, cwd: repoDir }))
			.trim()
			.toLowerCase();
	}

	static async gitRemoteRepoSHA(repoURI, branch) {
		return String(await spawn('git', ['ls-remote', repoURI, branch], { ...quietSpawnCfg, cwd: os.tmpdir() }))
			.trim()
			.toLowerCase()
			.split(/\s+/u)[0];
	}

	/*
	 * Env utilities.
	 */

	static async isEnvsVault() {
		return fs.existsSync(path.resolve(projDir, './.env.vault'));
	}

	static async envsPush() {
		await spawn(path.resolve(binDir, './envs.js'), ['push'], quietSpawnCfg);
	}

	static async envsEncrypt() {
		await spawn(path.resolve(binDir, './envs.js'), ['encrypt'], quietSpawnCfg);
	}

	/*
	 * NPM utilities.
	 */

	static async isNPMPkg() {
		return (await u.isGitRepo()) && false === pkg.private;
	}

	static async npmLifecycleEvent() {
		return process.env.npm_lifecycle_event || ''; // NPM script name.
	}

	static async npmLifecycleScript() {
		return process.env.npm_lifecycle_script || ''; // NPM script value.
	}

	static async isNPMPkgPublishable(opts = { mode: 'prod' }) {
		return (await u.isNPMPkg()) && 'main' === (await u.gitCurrentBranch()) && 'prod' === opts.mode;
	}

	static async npmUpdate() {
		await spawn('npm', ['update', '--ignore-scripts', '--save', '--silent'], quietSpawnCfg);
	}

	static async npmVersionPatch() {
		if (await u.isGitRepoDirty()) await u.gitAddCommit();
		await spawn('npm', ['version', 'patch', '--ignore-scripts'], noisySpawnCfg);
	}

	static async npmPublish() {
		await spawn('npm', ['publish', '--ignore-scripts'], noisySpawnCfg);
	}

	/*
	 * Vite utilities.
	 */

	static async viteBuild(opts = { mode: 'prod' }) {
		await spawn('npx', ['vite', 'build', '--mode', opts.mode], noisySpawnCfg);
		await spawn('npx', ['tsc'], noisySpawnCfg); // TypeScript types.
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
			command: ['projects'],
			desc: 'Updates multiple projects.',
			builder: (yargs) => {
				yargs
					.options({
						glob: {
							type: 'array',
							requiresArg: true,
							demandOption: false,
							default: ['*'],
							description:  // prettier-ignore
						'Glob matching is relative to `' + projsDir + '` and finds directories only.' +
						' Note: Globstars `**` are not allowed given the nature of this command and will therefore throw an error.' +
						' Please be more specific. Wildcards `*` are fine, but globstars `**` are prohibited in this option.',
						},
						ignore: {
							type: 'array',
							requiresArg: true,
							demandOption: false,
							default: coreProjectsIgnore,
							description: // prettier-ignore
						'Glob matching is relative to `' + projsDir + '`. This effectively excludes directories otherwise found by the `glob` option.' +
						' Note: The default ignore patterns are always in effect and cannot be overridden, only appended with this option.' +
						' Additionally, patterns in this project’s `.gitignore` file, and those within each matched project directory, are also always in effect.',
						},
						order: {
							type: 'array',
							requiresArg: true,
							demandOption: false,
							default: coreProjectsOrder,
							description: // prettier-ignore
						'Project subpaths to prioritize, in order. Also, globbing is supported in this option, for loose ordering.' +
						' Note: It’s not necessary to list every single project directory, only those you need to prioritize, in a specific order.' +
						' Any that are not listed explicitly, in order, will run last, in an arbitrary glob-based ordering, which is generally unpredictable.' +
						' Note: The default ordering is always in effect and cannot be overridden, only appended with this option.',
						},
						cmd: {
							type: 'string',
							requiresArg: true,
							demandOption: false,
							default: '',
							description: // prettier-ignore
						'Arbitrary `command args` to run in each project directory.' +
						' Note: The use of `&&` is allowed, but the use of `||` or `|` pipes is not permitted at this time.',
						},
						run: {
							type: 'array',
							requiresArg: true,
							demandOption: false,
							default: [],
							description: // prettier-ignore
						'Scripts to `npm run [script]` in each project directory.' +
						' If both `cmd` and `run` are given, `cmd` will always come first.',
						},
						dryRun: {
							type: 'boolean',
							requiresArg: false,
							demandOption: false,
							default: false,
							description: 'Dry run?',
						},
					})
					.check(async (args) => {
						if (!args.glob.length) {
							throw new Error(chalk.red('Empty `glob` option.'));
						}
						if (args.glob.includes('**') || mm(args.glob, ['\\*\\*'], { contains: true }).length) {
							throw new Error(chalk.red('Globstars `**` are prohitibed in `glob` option.'));
						}
						if (!args.run.length && !args.cmd) {
							throw new Error(chalk.red('One of `cmd` and/or `run` is required.'));
						}
						if (!(await u.isInteractive())) {
							throw new Error(chalk.red('This *must* be performed interactively.'));
						}
						return true;
					});
			},
			handler: async (args) => {
				await new Projects(args).run();
			},
		})
		.command({
			command: ['dotfiles'],
			desc: 'Updates project dotfiles.',
			builder: (yargs) => {
				yargs
					.options({
						skeletonUpdatesOthers: {
							type: 'boolean',
							requiresArg: false,
							demandOption: false,
							default: false,
							description: 'Updating `@clevercanyon/skeleton` also updates others? Such as `skeleton-dev-deps` and `*.fork`s.',
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
						if (!(await u.isInteractive())) {
							throw new Error(chalk.red('This *must* be performed interactively.'));
						}
						return true;
					});
			},
			handler: async (args) => {
				await new Dotfiles(args).run();
			},
		})
		.command({
			command: ['project'],
			desc: 'Updates NPM packages + optionally pushes to repo(s) + optionally publishes package(s).',
			builder: (yargs) => {
				yargs
					.options({
						repos: {
							type: 'boolean',
							requiresArg: false,
							demandOption: false,
							default: false,
							description: 'Push to project repo(s)?',
						},
						pkgs: {
							type: 'boolean',
							requiresArg: false,
							demandOption: false,
							default: false,
							implies: ['repos'],
							description: 'Publish updated project package(s)?',
						},
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
						if (!(await u.isInteractive())) {
							throw new Error(chalk.red('This *must* be performed interactively.'));
						}
						return true;
					});
			},
			handler: async (args) => {
				await new Project(args).run();
			},
		})
		.strict()
		.parse();
})();
