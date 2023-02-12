#!/usr/bin/env node
/**
 * Env CLI.
 *
 * @note PLEASE DO NOT EDIT THIS FILE!
 * @note This entire file will be updated automatically.
 * @note Instead of editing here, please review <https://github.com/clevercanyon/skeleton>.
 */
/* eslint-env es2021, node */

import fs from 'node:fs';
import path from 'node:path';
import { dirname } from 'desm';
import fsp from 'node:fs/promises';

import chalk from 'chalk';
import u from './includes/utilities.mjs';
import { $yargs } from '../../../node_modules/@clevercanyon/utilities.node/dist/index.js';

const __dirname = dirname(import.meta.url);
const projDir = path.resolve(__dirname, '../../..');

/**
 * Install command.
 */
class Install {
	/**
	 * Constructor.
	 */
	constructor(args) {
		this.args = args;
	}

	/**
	 * Runs CMD.
	 */
	async run() {
		if (this.args['new']) {
			await this.installNew();
		} else {
			await this.install();
		}
		if (this.args.dryRun) {
			u.log(chalk.cyanBright('Dry run. This was all a simulation.'));
		}
	}

	/**
	 * Runs new install.
	 */
	async installNew() {
		/**
		 * Displays preamble.
		 */

		u.log(chalk.green('Installing all new Dotenv Vault envs.'));

		/**
		 * Deletes old files so a new install can begin.
		 */

		u.log(chalk.gray('Deleting any existing `.env.me`, `.env.vault` files.'));
		if (!this.args.dryRun) {
			await fsp.rm(path.resolve(projDir, './.env.me'), { force: true });
			await fsp.rm(path.resolve(projDir, './.env.vault'), { force: true });
		}

		/**
		 * Logs the current user into Dotenv Vault.
		 */

		u.log(chalk.gray('Creating all new Dotenv Vault envs, which requires login.'));
		if (!this.args.dryRun) {
			await u.spawn('npx', ['dotenv-vault', 'new', '--yes']);
			await u.spawn('npx', ['dotenv-vault', 'login', '--yes']);
			await u.spawn('npx', ['dotenv-vault', 'open', '--yes']);
		}

		/**
		 * Pushes all envs to Dotenv Vault.
		 */

		u.log(chalk.gray('Pushing all envs to Dotenv Vault.'));
		await u.envsPush({ dryRun: this.args.dryRun });

		/**
		 * Encrypts all Dotenv Vault envs.
		 */

		u.log(chalk.gray('Building; i.e., encrypting, all Dotenv Vault envs.'));
		await u.envsEncrypt({ dryRun: this.args.dryRun });

		/**
		 * Signals completion with success.
		 */

		u.log(await u.finaleBox('Success', 'Installation of new Dotenv Vault envs complete.'));
	}

	/**
	 * Runs install.
	 */
	async install() {
		/**
		 * Displays preamble.
		 */

		u.log(chalk.green('Installing all Dotenv Vault envs.'));

		/**
		 * Checks if project is an envs vault.
		 */

		if (!(await u.isEnvsVault())) {
			throw new Error('There are no Dotenv Vault envs to install.');
		}

		/**
		 * Ensures current user is logged into Dotenv Vault.
		 */

		if (!fs.existsSync(path.resolve(projDir, './.env.me'))) {
			u.log(chalk.gray('Installing all Dotenv Vault envs, which requires login.'));
			if (!this.args.dryRun) {
				await u.spawn('npx', ['dotenv-vault', 'login', '--yes']);

				if (this.args.open) {
					await u.spawn('npx', ['dotenv-vault', 'open', '--yes']);
				}
			}
		}

		/**
		 * Pulls all envs from Dotenv Vault.
		 */

		if (this.args.pull || !fs.existsSync((await u.envFiles()).main)) {
			u.log(chalk.gray('Pulling all envs from Dotenv Vault.'));
			await u.envsPull({ dryRun: this.args.dryRun });
		}

		/**
		 * Signals completion with success.
		 */

		u.log(await u.finaleBox('Success', 'Installation of Dotenv Vault envs complete.'));
	}
}

/**
 * Push command.
 */
class Push {
	/**
	 * Constructor.
	 */
	constructor(args) {
		this.args = args;
	}

	/**
	 * Runs CMD.
	 */
	async run() {
		await this.push();

		if (this.args.dryRun) {
			u.log(chalk.cyanBright('Dry run. This was all a simulation.'));
		}
	}

	/**
	 * Runs push.
	 */
	async push() {
		/**
		 * Displays preamble.
		 */

		u.log(chalk.green('Pushing all envs to Dotenv Vault.'));

		/**
		 * Checks if project has a Dotenv Vault.
		 */

		if (!(await u.isEnvsVault())) {
			throw new Error('There are no Dotenv Vault envs to push.');
		}

		/**
		 * Pushes all envs to Dotenv Vault.
		 */

		await u.envsPush({ dryRun: this.args.dryRun });

		/**
		 * Signals completion with success.
		 */

		u.log(await u.finaleBox('Success', 'Dotenv Vault pushing complete.'));
	}
}

/**
 * Pull command.
 */
class Pull {
	/**
	 * Constructor.
	 */
	constructor(args) {
		this.args = args;
	}

	/**
	 * Runs CMD.
	 */
	async run() {
		await this.pull();

		if (this.args.dryRun) {
			u.log(chalk.cyanBright('Dry run. This was all a simulation.'));
		}
	}

	/**
	 * Runs pull.
	 */
	async pull() {
		/**
		 * Displays preamble.
		 */

		u.log(chalk.green('Pulling all envs from Dotenv Vault.'));

		/**
		 * Checks if project has a Dotenv Vault.
		 */

		if (!(await u.isEnvsVault())) {
			throw new Error('There are no Dotenv Vault envs to pull.');
		}

		/**
		 * Pulls all envs from Dotenv Vault.
		 */

		await u.envsPull({ dryRun: this.args.dryRun });

		/**
		 * Signals completion with success.
		 */

		u.log(await u.finaleBox('Success', 'Dotenv Vault pulling complete.'));
	}
}

/**
 * Compile command.
 */
class Compile {
	/**
	 * Constructor.
	 */
	constructor(args) {
		this.args = args;
	}

	/**
	 * Runs CMD.
	 */
	async run() {
		await this.compile();

		if (this.args.dryRun) {
			u.log(chalk.cyanBright('Dry run. This was all a simulation.'));
		}
	}

	/**
	 * Runs compile.
	 */
	async compile() {
		/**
		 * Displays preamble.
		 */

		u.log(chalk.green('Compiling all Dotenv Vault envs.'));

		/**
		 * Checks if project has a Dotenv Vault.
		 */

		if (!(await u.isEnvsVault())) {
			throw new Error('There are no Dotenv Vault envs to compile.');
		}

		/**
		 * Compiles all Dotenv Vault envs.
		 */

		await u.envsCompile({ dryRun: this.args.dryRun });

		/**
		 * Signals completion with success.
		 */

		u.log(await u.finaleBox('Success', 'Dotenv Vault compilation complete.'));
	}
}

/**
 * Keys command.
 */
class Keys {
	/**
	 * Constructor.
	 */
	constructor(args) {
		this.args = args;
	}

	/**
	 * Runs CMD.
	 */
	async run() {
		await this.keys();

		if (this.args.dryRun) {
			u.log(chalk.cyanBright('Dry run. This was all a simulation.'));
		}
	}

	/**
	 * Runs keys.
	 */
	async keys() {
		/**
		 * Displays preamble.
		 */

		u.log(chalk.green('Retrieving Dotenv Vault keys for all envs.'));

		/**
		 * Checks if project has a Dotenv Vault.
		 */

		if (!(await u.isEnvsVault())) {
			throw new Error('There are no Dotenv Vault keys to retrieve.');
		}

		/**
		 * Outputs all Dotenv Vault keys.
		 */

		await u.envsKeys({ dryRun: this.args.dryRun });

		/**
		 * Signals completion with success.
		 */

		u.log(await u.finaleBox('Success', 'Copy Dotenv Vault env keys from list above.'));
	}
}

/**
 * Encrypt command.
 */
class Encrypt {
	/**
	 * Constructor.
	 */
	constructor(args) {
		this.args = args;
	}

	/**
	 * Runs CMD.
	 */
	async run() {
		await this.encrypt();

		if (this.args.dryRun) {
			u.log(chalk.cyanBright('Dry run. This was all a simulation.'));
		}
	}

	/**
	 * Runs encrypt.
	 */
	async encrypt() {
		/**
		 * Displays preamble.
		 */

		u.log(chalk.green('Building; i.e., encrypting all Dotenv Vault envs.'));

		/**
		 * Checks if project has a Dotenv Vault.
		 */

		if (!(await u.isEnvsVault())) {
			throw new Error('There are no Dotenv Vault envs to encrypt.');
		}

		/**
		 * Encrypts all Dotenv Vault envs.
		 */

		await u.envsEncrypt({ dryRun: this.args.dryRun });

		/**
		 * Signals completion with success.
		 */

		u.log(await u.finaleBox('Success', 'Dotenv Vault encryption complete.'));
	}
}

/**
 * Decrypt command.
 */
class Decrypt {
	/**
	 * Constructor.
	 */
	constructor(args) {
		this.args = args;
	}

	/**
	 * Runs CMD.
	 */
	async run() {
		await this.decrypt();

		if (this.args.dryRun) {
			u.log(chalk.cyanBright('Dry run. This was all a simulation.'));
		}
	}

	/**
	 * Runs decrypt.
	 */
	async decrypt() {
		/**
		 * Displays preamble.
		 */

		u.log(chalk.green('Decrypting Dotenv Vault env(s).'));

		/**
		 * Checks if project has a Dotenv Vault.
		 */

		if (!(await u.isEnvsVault())) {
			throw new Error('There are no Dotenv Vault envs to decrypt.');
		}

		/**
		 * Decrypts all Dotenv Vault envs; i.e., extracts env files.
		 */

		await u.envsDecrypt({ keys: this.args.keys, dryRun: this.args.dryRun });

		/**
		 * Signals completion with success.
		 */

		u.log(await u.finaleBox('Success', 'Dotenv Vault decryption complete.'));
	}
}

/**
 * Yargs ⛵🏴‍☠.
 */
void (async () => {
	await u.propagateUserEnvVars();
	await (
		await $yargs.cli({
			scriptName: 'madrun envs',
			version: (await u.pkg()).version,
		})
	)
		.command({
			command: 'install',
			describe: 'Installs all envs for Dotenv Vault.',
			builder: (yargs) => {
				return yargs
					.options({
						'new': {
							type: 'boolean',
							requiresArg: false,
							demandOption: false,
							default: false,
							description: 'Perform a new (fresh) install?',
						},
						open: {
							type: 'boolean',
							requiresArg: false,
							demandOption: false,
							default: false,
							description: // prettier-ignore
								'When not `--new`, open the Dotenv Vault in a browser tab upon logging in?' +
								' If not set explicitly, only opens Dotenv Vault for login, not for editing.' +
								' Note: This option has no effect when `--new` is given.',
						},
						pull: {
							type: 'boolean',
							requiresArg: false,
							demandOption: false,
							default: false,
							description: // prettier-ignore
								'When not `--new`, pull latest envs from Dotenv Vault?' +
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
			describe: 'Pushes all envs to Dotenv Vault.',
			builder: (yargs) => {
				return yargs
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
			describe: 'Pulls all envs from Dotenv Vault.',
			builder: (yargs) => {
				return yargs
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
			command: 'compile',
			describe: 'Compiles all envs into `./dev/.envs/comp/.env.[env].json` JSON files.',
			builder: (yargs) => {
				return yargs
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
				await new Compile(args).run();
			},
		})
		.command({
			command: 'keys',
			describe: 'Retrieves Dotenv Vault decryption keys for all envs.',
			builder: (yargs) => {
				return yargs
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
			describe: 'Encrypts all envs into `.env.vault`; powered by Dotenv Vault.',
			builder: (yargs) => {
				return yargs
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
			describe: 'Decrypts `.env.vault` env(s) for the given key(s); powered by Dotenv Vault.',
			builder: (yargs) => {
				return yargs
					.options({
						keys: {
							type: 'array',
							requiresArg: true,
							demandOption: true,
							default: [],
							description: 'To decrypt `.env.vault` env(s).',
							alias: ['keys[]', 'keys[', 'key', 'key[]', 'key['],
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
		.parse();
})();
