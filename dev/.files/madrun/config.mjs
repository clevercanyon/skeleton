#!/usr/bin/env node
/**
 * Mad Run CLI config.
 *
 * @note PLEASE DO NOT EDIT THIS FILE!
 * @note This entire file will be updated automatically.
 * @note Instead of editing here, please review <https://github.com/clevercanyon/skeleton>.
 */
/* eslint-env es2021, node */

import fs from 'node:fs';
import fsp from 'node:fs/promises';
import { dirname } from 'desm';
import path from 'node:path';

const __dirname = dirname(import.meta.url);
const projDir = path.resolve(__dirname, '../../..');

export default {
	'envs': './dev/.files/bin/envs.mjs {{@}}',
	'envs:push': './dev/.files/bin/envs.mjs push {{@}}',
	'envs:pull': './dev/.files/bin/envs.mjs pull {{@}}',
	'envs:keys': './dev/.files/bin/envs.mjs keys {{@}}',
	'envs:encrypt': './dev/.files/bin/envs.mjs encrypt {{@}}',
	'envs:decrypt': './dev/.files/bin/envs.mjs decrypt {{@}}',
	'envs:install': './dev/.files/bin/envs.mjs install {{@}}',

	'dev': async (args) => 'npx vite dev' + (args.mode ? '' : ' --mode=dev') + ' {{@}}',
	'preview': async (args) => 'npx vite preview' + (args.mode ? '' : ' --mode=dev') + ' {{@}}',
	'build': async (args) => 'npx vite build' + (args.mode ? '' : ' --mode=prod') + ' {{@}}',

	'install': async () => {
		if (fs.existsSync(path.resolve(projDir, './node_modules'))) {
			return './dev/.files/bin/install.mjs {{@}}';
		}
		return ['npm ci', './dev/.files/bin/install.mjs {{@}}'];
	},
	'install:project': async () => {
		if (fs.existsSync(path.resolve(projDir, './node_modules'))) {
			return './dev/.files/bin/install.mjs project {{@}}';
		}
		return ['npm ci', './dev/.files/bin/install.mjs project {{@}}'];
	},
	'update': './dev/.files/bin/update.mjs {{@}}',
	'update:dotfiles': './dev/.files/bin/update.mjs dotfiles {{@}}',
	'update:project': async (args) => {
		if (args.h || args.v || args.help || args.version) {
			return './dev/.files/bin/update.mjs project {{@}}';
		}
		return ['./dev/.files/bin/update.mjs dotfiles {{--dryRun}}', './dev/.files/bin/update.mjs project {{@}}'];
	},
	'update:projects': './dev/.files/bin/update.mjs projects {{@}}',

	'wrangler': async () => 'CLOUDFLARE_API_TOKEN="${USER_CLOUDFLARE_TOKEN}" npx wrangler {{@}}',

	'on::madrun:default:new': () => [
		'npx @clevercanyon/madrun install:project',
		async () => {
			let u = './dev/.files/bin/includes/utilities.mjs';
			u = (await import(path.resolve(__dirname, u))).default;

			await fsp.rm(path.resolve(projDir, './.env.me'), { force: true });
			await fsp.rm(path.resolve(projDir, './.env.vault'), { force: true });

			const projSlug = path.basename(projDir);
			await u.updatePkg({
				name: '@clevercanyon/' + projSlug,
				repository: 'https://github.com/clevercanyon/' + projSlug,
				homepage: 'https://github.com/clevercanyon/' + projSlug + '#readme',
				bugs: 'https://github.com/clevercanyon/' + projSlug + '/issues',

				$unset: /* Reset to defaults. */ [
					'private', //
					'publishConfig.access',

					'version',
					'license',
					'description',
					'funding',
					'keywords',

					'author',
					'contributors',

					'config.c10n.&.github.teams',
					'config.c10n.&.github.labels',
					'config.c10n.&.github.configVersion',
					'config.c10n.&.github.envsVersion',

					'config.c10n.&.npmjs.teams',
					'config.c10n.&.npmjs.configVersions',
				],
			});
		},
	],
};
