#!/usr/bin/env node
/**
 * `$ madrun` CLI config.
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
	'on::madrun:default:new': [
		'npx @clevercanyon/madrun install project',
		async (args) => {
			let u = './dev/.files/bin/includes/utilities.mjs';
			u = (await import(path.resolve(projDir, u))).default;

			u.propagateUserEnvVars(); // i.e., `USER_` env vars.

			await fsp.rm(path.resolve(projDir, './.env.me'), { force: true });
			await fsp.rm(path.resolve(projDir, './.env.vault'), { force: true });

			const projSlug = path.basename(projDir);
			const projParentDirBasename = path.basename(path.dirname(projDir));

			await u.updatePkg({
				name: '@clevercanyon/' + projSlug,
				repository: 'https://github.com/clevercanyon/' + projSlug,
				homepage: 'https://github.com/clevercanyon/' + projSlug + '#readme',
				bugs: 'https://github.com/clevercanyon/' + projSlug + '/issues',

				$unset: /* Effectively resets these to default values. */ [
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
				...(args.pkg ? { $set: { private: false } } : {}),
				...(args.pkg && args.public ? { $set: { 'publishConfig.access': 'public' } } : {}),
			});
			const readmeFile = path.resolve(projDir, './README.md');
			let readme = fs.readFileSync(readmeFile).toString(); // Markdown.

			readme = readme.replace(/@clevercanyon\/[^/?#\s]+/gu, '@clevercanyon/' + projSlug);
			await fsp.writeFile(readmeFile, readme);

			await u.spawn('git', ['init']); // Initialize a brand new git repository.

			if ('clevercanyon' === projParentDirBasename) {
				if (process.env.GH_TOKEN && 'owner' === (await u.gistGetC10NUser()).github?.role) {
					await u.spawn('gh', ['repo', 'create', 'clevercanyon/' + projSlug, '--source=.', args.public ? '--public' : '--private']);
				} else {
					await u.spawn('git', ['remote', 'add', 'origin', 'https://github.com/clevercanyon/' + projSlug + '.git']);
				}
			} else if (process.env.USER_GITHUB_USERNAME) {
				if (process.env.GH_TOKEN) {
					await u.spawn('gh', ['repo', 'create', process.env.USER_GITHUB_USERNAME + '/' + projSlug, '--source=.', args.public ? '--public' : '--private']);
					//
				} else {
					await u.spawn('git', ['remote', 'add', 'origin', 'https://github.com/clevercanyon/' + projSlug + '.git']);
				}
			}
		},
	],
};
