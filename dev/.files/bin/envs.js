#!/usr/bin/env node
/**
 * Env CLI.
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
import fsp from 'node:fs/promises';

import coloredBox from 'boxen';
import terminalImage from 'term-img';
import chalk, { supportsColor } from 'chalk';

import spawn from 'spawn-please';

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import { Octokit as OctokitCore } from '@octokit/core';
import { paginateRest as OctokitPluginPaginateRest } from '@octokit/plugin-paginate-rest';
import sodium from 'libsodium-wrappers'; // Used to encrypt GitHub secret values.

import dotenvVaultCore from 'dotenv-vault-core';

const __dirname = dirname(import.meta.url);
const projDir = path.resolve(__dirname, '../../..');

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

const envFiles = {
	main: path.resolve(projDir, './dev/.envs/.env'),
	dev: path.resolve(projDir, './dev/.envs/.env.dev'),
	ci: path.resolve(projDir, './dev/.envs/.env.ci'),
	stage: path.resolve(projDir, './dev/.envs/.env.stage'),
	prod: path.resolve(projDir, './dev/.envs/.env.prod'),
};
const Octokit = OctokitCore.plugin(OctokitPluginPaginateRest);
const octokit = new Octokit({ auth: process.env.USER_GITHUB_TOKEN });

const c10nLogo = path.resolve(__dirname, '../assets/brands/c10n/logo.png');
const c10nLogoDev = path.resolve(__dirname, '../assets/brands/c10n/logo-dev.png');

/**
 * NOTE: Most of these commands _must_ be performed interactively. Please review the Yargs configuration below for
 * further details. At this time, only the `decrypt` command is allowed noninteractively, and _only_ noninteractively.
 */

/**
 * Install command.
 */
class Install {
	constructor(args) {
		this.args = args;
	}

	async run() {
		if (this.args['new']) {
			await this.installNew();
		} else {
			await this.install();
		}
		if (this.args.dryRun) {
			log(chalk.cyanBright('Dry run. This was all a simulation.'));
		}
	}

	async installNew() {
		log(chalk.green('Installing all new envs.'));

		log(chalk.gray('Deleting `.env.me`, `.env.vault`.'));
		if (!this.args.dryRun) {
			await fsp.rm(path.resolve(projDir, './.env.me'), { force: true });
			await fsp.rm(path.resolve(projDir, './.env.vault'), { force: true });
		}
		log(chalk.gray('Running `dotenv-vault new`, `login`, `open`.'));
		if (!this.args.dryRun) {
			await spawn('npx', ['dotenv-vault', 'new', '--yes'], noisySpawnCfg);
			await spawn('npx', ['dotenv-vault', 'login', '--yes'], noisySpawnCfg);
			await spawn('npx', ['dotenv-vault', 'open', '--yes'], noisySpawnCfg);
		}
		log(chalk.gray('Pushing all envs.'));
		await u.push({ dryRun: this.args.dryRun });

		log(chalk.gray('Encrypting all envs.'));
		await u.encrypt({ dryRun: this.args.dryRun });

		log(await u.finale('Success', 'New install complete.'));
	}

	async install() {
		log(chalk.green('Installing all envs.'));

		if (!(await u.isEnvsVault())) {
			throw new Error('Not a Dotenv Vault.');
		}
		if (!fs.existsSync(path.resolve(projDir, './.env.me'))) {
			log(chalk.gray('Running `dotenv-vault login`, `open`.'));
			if (!this.args.dryRun) {
				await spawn('npx', ['dotenv-vault', 'login', '--yes'], noisySpawnCfg);
				await spawn('npx', ['dotenv-vault', 'open', '--yes'], noisySpawnCfg);
			}
		}
		if (this.args.pull || !fs.existsSync(envFiles.main)) {
			log(chalk.gray('Pulling all envs.'));
			await u.pull({ dryRun: this.args.dryRun });
		}
		log(await u.finale('Success', 'Install complete.'));
	}
}

/**
 * Push command.
 */
class Push {
	constructor(args) {
		this.args = args;
	}

	async run() {
		log(chalk.green('Pushing all envs.'));

		if (!(await u.isEnvsVault())) {
			throw new Error('Not a Dotenv Vault.');
		}
		await u.push({ dryRun: this.args.dryRun });

		log(await u.finale('Success', 'Push complete.'));

		if (this.args.dryRun) {
			log(chalk.cyanBright('Dry run. This was all a simulation.'));
		}
	}
}

/**
 * Pull command.
 */
class Pull {
	constructor(args) {
		this.args = args;
	}

	async run() {
		log(chalk.green('Pulling all envs.'));

		if (!(await u.isEnvsVault())) {
			throw new Error('Not a Dotenv Vault.');
		}
		await u.pull({ dryRun: this.args.dryRun });

		log(await u.finale('Success', 'Pull complete.'));

		if (this.args.dryRun) {
			log(chalk.cyanBright('Dry run. This was all a simulation.'));
		}
	}
}

/**
 * Keys command.
 */
class Keys {
	constructor(args) {
		this.args = args;
	}

	async run() {
		log(chalk.green('Retrieving keys for all envs.'));

		if (!(await u.isEnvsVault())) {
			throw new Error('Not a Dotenv Vault.');
		}
		await u.keys({ dryRun: this.args.dryRun });

		log(await u.finale('Success', 'Copy keys from list above.'));

		if (this.args.dryRun) {
			log(chalk.cyanBright('Dry run. This was all a simulation.'));
		}
	}
}

/**
 * Encrypt command.
 */
class Encrypt {
	constructor(args) {
		this.args = args;
	}

	async run() {
		log(chalk.green('Encrypting all envs.'));

		if (!(await u.isEnvsVault())) {
			throw new Error('Not a Dotenv Vault.');
		}
		await u.encrypt({ dryRun: this.args.dryRun });

		log(await u.finale('Success', 'Encryption complete.'));

		if (this.args.dryRun) {
			log(chalk.cyanBright('Dry run. This was all a simulation.'));
		}
	}
}

/**
 * Decrypt command.
 */
class Decrypt {
	constructor(args) {
		this.args = args;
	}

	async run() {
		log(chalk.green('Decrypting env(s).'));

		if (!(await u.isEnvsVault())) {
			throw new Error('Not a Dotenv Vault.');
		}
		await u.decrypt({ keys: this.args.keys, dryRun: this.args.dryRun });

		log(await u.finale('Success', 'Decryption complete.'));

		if (this.args.dryRun) {
			log(chalk.cyanBright('Dry run. This was all a simulation.'));
		}
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
	 * Vault utilities.
	 */

	static async isEnvsVault() {
		return fs.existsSync(path.resolve(projDir, './.env.vault'));
	}

	/*
	 * Push utilities.
	 */

	static async push(opts = { dryRun: false }) {
		for (const [envName, envFile] of Object.entries(envFiles)) {
			if (!fs.existsSync(envFile)) {
				log(chalk.gray('Creating file for `' + envName + '` env.'));
				if (!opts.dryRun) {
					await fsp.mkdir(path.dirname(envFile), { recursive: true });
					await fsp.writeFile(envFile, '# ' + envName);
				}
			}
			log(chalk.gray('Running `dotenv-vault push` for `' + envName + '` env.'));
			if (!opts.dryRun) {
				await spawn('npx', ['dotenv-vault', 'push', envName, envFile, '--yes'], noisySpawnCfg);
			}
		}
		if (await u.isGitRepo()) {
			await u.githubPushRepoEnvs(opts);
		}
	}

	/*
	 * Pull utilities.
	 */

	static async pull(opts = { dryRun: false }) {
		for (const [envName, envFile] of Object.entries(envFiles)) {
			log(chalk.gray('Running `dotenv-vault pull` for `' + envName + '` env.'));
			if (!opts.dryRun) {
				await fsp.mkdir(path.dirname(envFile), { recursive: true });
				await spawn('npx', ['dotenv-vault', 'pull', envName, envFile, '--yes'], noisySpawnCfg);
			}
			log(chalk.gray('Deleting previous file for `' + envName + '` env.'));
			if (!opts.dryRun) {
				await fsp.rm(envFile + '.previous', { force: true });
			}
		}
	}

	/*
	 * Keys utilities.
	 */

	static async keys(opts = { dryRun: false }) {
		log(chalk.gray('Running `dotenv-vault keys`.'));
		if (!opts.dryRun) {
			await spawn('npx', ['dotenv-vault', 'keys', '--yes'], noisySpawnCfg);
		}
	}

	static async extractKeys() {
		const keys = {}; // Initialize.

		log(chalk.gray('Extracting `dotenv-vault keys`.'));
		const output = await spawn('npx', ['dotenv-vault', 'keys', '--yes'], quietSpawnCfg);

		let _m = null; // Initialize.
		const regexp = /\bdotenv:\/\/:key_.+?\?environment=([^\s]+)/giu;

		while ((_m = regexp.exec(output)) !== null) {
			keys[_m[1]] = _m[0];
		}
		return keys;
	}

	/*
	 * Encryption utilities.
	 */

	static async encrypt(opts = { dryRun: false }) {
		log(chalk.gray('Running `dotenv-vault build`.'));
		if (!opts.dryRun) {
			await spawn('npx', ['dotenv-vault', 'build', '--yes'], noisySpawnCfg);
		}
	}

	/*
	 * Decryption utilities.
	 */

	static async decrypt(opts = { keys: [], dryRun: false }) {
		for (const key of opts.keys) {
			const envName = key.split('?')[1]?.split('=')[1] || '';
			const envFile = envFiles[envName] || '';

			if (!envName || !envFile) {
				throw new Error('Invalid key: `' + key + '`.');
			}
			log(chalk.gray('Decrypting `' + envName + '` env.'));
			if (!opts.dryRun) {
				const origDotenvKey = process.env.DOTENV_KEY || '';
				process.env.DOTENV_KEY = key; // For `dotEnvVaultCore`.

				// Note: `path` leads to `.env.vault`. See: <https://o5p.me/MqXJaf>.
				const env = dotenvVaultCore.config({ path: path.resolve(projDir, './.env' /* .vault */) });

				await fsp.writeFile(envFile, await u.toString(envName, env));
				process.env.DOTENV_KEY = origDotenvKey;
			}
		}
	}

	static async toString(envName, env) {
		let str = '# ' + envName + '\n';

		for (let [name, value] of Object.entries(env)) {
			value = value.replace(/\r\n?/gu, '\n');
			value = value.replace(/\n/gu, '\\n');
			str += name + '="' + value.replace(/"/gu, '\\"') + '"\n';
		}
		return str;
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

	/*
	 * GitHub utilities.
	 */

	static async githubOrigin() {
		let m = null; // Initialize array of matches.
		const url = String(await spawn('git', ['remote', 'get-url', 'origin'], quietSpawnCfg)).trim();

		if ((m = /^git@github(?:\.com)?:([^/]+)\/([^/]+?)(?:\.git)?$/iu.exec(url))) {
			return { owner: m[1], repo: m[2] };
		} else if ((m = /^https?:\/\/github.com\/([^/]+)\/([^/]+?)(?:\.git)?$/iu.exec(url))) {
			return { owner: m[1], repo: m[2] };
		}
		throw new Error('githubOrigin: Repo does not have a GitHub origin.');
	}

	static async githubRepo() {
		const { owner, repo } = await u.githubOrigin();
		const r1 = await octokit.request('GET /repos/{owner}/{repo}', { owner, repo });
		const r2 = await octokit.request('GET /repos/{owner}/{repo}/actions/secrets/public-key', { owner, repo });

		if (typeof r1 !== 'object' || typeof r1.data !== 'object' || !r1.data.id) {
			throw new Error('githubRepo: Failed to acquire GitHub repository’s data.');
		}
		if (typeof r2 !== 'object' || typeof r2.data !== 'object' || !r2.data.key_id || !r2.data.key) {
			throw new Error('githubRepo: Failed to acquire GitHub repository’s public key.');
		}
		return { ...r1.data, publicKeyId: r2.data.key_id, publicKey: r2.data.key };
	}

	static async githubRepoEnvs() {
		const envs = {}; // Initialize.
		const { owner, repo } = await u.githubOrigin();
		const i6r = octokit.paginate.iterator('GET /repos/{owner}/{repo}/environments{?per_page}', { owner, repo, per_page: 100 });

		if (typeof i6r !== 'object') {
			throw new Error('githubRepoEnvs: Failed to acquire GitHub repository’s environments.');
		}
		for await (const { data } of i6r) {
			if (typeof data !== 'object') {
				throw new Error('githubRepoEnvs: Failed to acquire GitHub repository’s environment data.');
			}
			for (const env of data.environments || []) {
				envs[env.name] = env;
			}
		}
		return envs;
	}

	static async githubRepoEnvSecrets(repoId, envName) {
		const envSecrets = []; // Initialize.
		const i6r = octokit.paginate.iterator('GET /repositories/{repoId}/environments/{envName}/secrets{?per_page}', { repoId, envName, per_page: 100 });

		if (typeof i6r !== 'object') {
			throw new Error('githubRepoEnvSecrets: Failed to acquire GitHub repository’s secrets for an environment.');
		}
		for await (const { data } of i6r) {
			if (typeof data !== 'object') {
				throw new Error('githubRepoEnvSecrets: Failed to acquire GitHub repository’s secret data for an environment.');
			}
			for (const envSecret of data.secrets || []) {
				envSecrets[envSecret.name] = envSecret;
			}
		}
		return envSecrets;
	}

	static async githubRepoEnvBranchPolicies(envName) {
		const envBranchPolicies = {}; // Initialize.
		const { owner, repo } = await u.githubOrigin();
		const i6r = octokit.paginate.iterator('GET /repos/{owner}/{repo}/environments/{envName}/deployment-branch-policies{?per_page}', { owner, repo, envName, per_page: 100 });

		if (typeof i6r !== 'object') {
			throw new Error('githubRepoEnvBranchPolicies: Failed to acquire GitHub repository’s branch policies for an environment.');
		}
		for await (const { data } of i6r) {
			if (typeof data !== 'object') {
				throw new Error('githubRepoEnvBranchPolicies: Failed to acquire GitHub repository’s branch policy data for an environment.');
			}
			for (const envBranchPolicy of data.branch_policies || []) {
				envBranchPolicies[envBranchPolicy.name] = envBranchPolicy;
			}
		}
		return envBranchPolicies;
	}

	static async githubEnsureRepoEnvs(opts = { dryRun: false }) {
		const { owner, repo } = await u.githubOrigin();
		const repoEnvs = await u.githubRepoEnvs();

		for (const [envName] of Object.entries(_.omit(envFiles, ['main']))) {
			if (repoEnvs[envName]) {
				continue; // Do not recreate or modify existing envs.
			}
			log(chalk.gray('Creating `' + envName + '` repo env at GitHub.'));
			if (!opts.dryRun) {
				await octokit.request('PUT /repos/{owner}/{repo}/environments/{envName}', {
					owner,
					repo,
					envName,
					deployment_branch_policy:
						'prod' === envName
							? {
									protected_branches: false,
									custom_branch_policies: true,
							  }
							: null,
				});
			}
			if ('prod' === envName) {
				log(chalk.gray('Creating `main` branch policy for `' + envName + '` repo env at GitHub.'));
				if (!opts.dryRun) {
					if (!(await u.githubRepoEnvBranchPolicies(envName)).main) {
						await octokit.request('POST /repos/{owner}/{repo}/environments/{envName}/deployment-branch-policies', {
							owner,
							repo,
							envName,
							name: 'main',
						});
					}
				}
			}
		}
	}

	static async githubPushRepoEnvs(opts = { dryRun: false }) {
		await u.githubEnsureRepoEnvs(opts);

		const envKeys = await u.extractKeys(); // Extracts secret keys that unlock environments.
		const { id: repoId, publicKeyId: repoPublicKeyId, publicKey: repoPublicKey } = await u.githubRepo();

		for (const [envName] of Object.entries(_.omit(envFiles, ['main']))) {
			const envSecretsToDelete = await u.githubRepoEnvSecrets(repoId, envName);

			for (const [envSecretName, envSecretValue] of Object.entries({
				['USER_DOTENV_KEY_MAIN']: envKeys.main,
				['USER_DOTENV_KEY_' + envName.toUpperCase()]: envKeys[envName],
			})) {
				delete envSecretsToDelete[envSecretName]; // Don't delete.

				const encryptedEnvSecretValue = await sodium.ready.then(() => {
					const sodiumKey = sodium.from_base64(repoPublicKey, sodium.base64_variants.ORIGINAL);
					return sodium.to_base64(sodium.crypto_box_seal(sodium.from_string(envSecretValue), sodiumKey), sodium.base64_variants.ORIGINAL);
				});
				log(chalk.gray('Updating `' + envSecretName + '` secret in the `' + envName + '` repo env at GitHub.'));
				if (!opts.dryRun) {
					await octokit.request('PUT /repositories/{repoId}/environments/{envName}/secrets/{envSecretName}', {
						repoId,
						envName,
						envSecretName,
						key_id: repoPublicKeyId,
						encrypted_value: encryptedEnvSecretValue,
					});
				}
			}
			for (const [envSecretName] of Object.entries(envSecretsToDelete)) {
				log(chalk.gray('Deleting `' + envSecretName + '` secret in the `' + envName + '` repo env at GitHub.'));
				if (!opts.dryRun) {
					await octokit.request('DELETE /repositories/{repoId}/environments/{envName}/secrets/{envSecretName}', { repoId, envName, envSecretName });
				}
			}
		}
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
			coloredBox(chalk.bold.red(text), {
				margin: 0,
				padding: 0.75,
				textAlignment: 'left',

				dimBorder: false,
				borderStyle: 'round',
				borderColor: '#551819',
				backgroundColor: '',

				titleAlignment: 'left',
				title: chalk.bold.redBright('⚑ ' + title),
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
			coloredBox(chalk.bold.hex('#ed5f3b')(text), {
				margin: 0,
				padding: 0.75,
				textAlignment: 'left',

				dimBorder: false,
				borderStyle: 'round',
				borderColor: '#8e3923',
				backgroundColor: '',

				titleAlignment: 'left',
				title: chalk.bold.green('✓ ' + title),
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
			command: 'install',
			desc: 'Installs all envs for dotenv vault.',
			builder: (yargs) => {
				yargs
					.options({
						'new': {
							type: 'boolean',
							requiresArg: false,
							demandOption: false,
							default: false,
							description: 'Perform a new (fresh) install?',
						},
						pull: {
							type: 'boolean',
							requiresArg: false,
							demandOption: false,
							default: false,
							description: // prettier-ignore
								'When not `--new`, pull latest envs from dotenv vault?' +
								' If not set explicitly, only pulls when main env is missing.' +
								' Note: This option has no effect when `--new` is given.',
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
							throw new Error('This *must* be performed interactively.');
						}
						return true;
					});
			},
			handler: async (args) => {
				await new Install(args).run();
			},
		})
		.command({
			command: 'push',
			desc: 'Pushes all envs to dotenv vault.',
			builder: (yargs) => {
				yargs
					.options({
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
							throw new Error('This *must* be performed interactively.');
						}
						return true;
					});
			},
			handler: async (args) => {
				await new Push(args).run();
			},
		})
		.command({
			command: 'pull',
			desc: 'Pulls all envs from dotenv vault.',
			builder: (yargs) => {
				yargs
					.options({
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
							throw new Error('This *must* be performed interactively.');
						}
						return true;
					});
			},
			handler: async (args) => {
				await new Pull(args).run();
			},
		})
		.command({
			command: 'keys',
			desc: 'Retrieves decryption keys for all envs.',
			builder: (yargs) => {
				yargs
					.options({
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
							throw new Error('This *must* be performed interactively.');
						}
						return true;
					});
			},
			handler: async (args) => {
				await new Keys(args).run();
			},
		})
		.command({
			command: 'encrypt',
			desc: 'Encrypts all envs into `.env.vault`.',
			builder: (yargs) => {
				yargs
					.options({
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
							throw new Error('This *must* be performed interactively.');
						}
						return true;
					});
			},
			handler: async (args) => {
				await new Encrypt(args).run();
			},
		})
		.command({
			command: 'decrypt',
			desc: 'Decrypts `.env.vault` env(s) for the given key(s).',
			builder: (yargs) => {
				yargs
					.options({
						keys: {
							type: 'array',
							requiresArg: true,
							demandOption: true,
							default: [],
							description: 'To decrypt `.env.vault` env(s).',
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
						if (await u.isInteractive()) {
							throw new Error('This can *only* be performed noninteractively.');
						}
						return true;
					});
			},
			handler: async (args) => {
				await new Decrypt(args).run();
			},
		})
		.fail(async (message, error /* , yargs */) => {
			if (error?.stack && typeof error.stack === 'string') log(chalk.gray(error.stack));
			log(await u.error('Problem', error ? error.toString() : message || 'Unexpected unknown errror.'));
			process.exit(1);
		})
		.strict()
		.parse();
})();
