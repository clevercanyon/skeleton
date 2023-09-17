#!/usr/bin/env node
/**
 * Madrun config file.
 *
 * Madrun is not aware of this config file's location.
 *
 * @note PLEASE DO NOT EDIT THIS FILE!
 * @note This entire file will be updated automatically.
 * @note Instead of editing here, please review <https://github.com/clevercanyon/skeleton>.
 *
 * @see https://github.com/clevercanyon/madrun
 */

import path from 'node:path';
import url from 'node:url';
import events from './includes/events.mjs';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const nodeFile = path.resolve(__dirname, './includes/node.cjs');

/**
 * Defines madrun configuration.
 */
export default async ({ /* cmd, args, */ ctx }) => {
	/**
	 * Node options.
	 */
	const n = 'NODE_OPTIONS=' + // See: <https://o5p.me/Z4rfwi>.
		[
			`--require=${nodeFile}`,
			//
		].join(' ') + ' '; // prettier-ignore

	/**
	 * Composition.
	 */
	return {
		'envs': n + './dev/.files/bin/envs.mjs {{@}}',
		'install': n + './dev/.files/bin/install.mjs {{@}}',
		'update': n + './dev/.files/bin/update.mjs {{@}}',

		'dev': async ({ args }) => n + 'npx vite dev' + (args.mode ? '' : ' --mode=dev') + ' {{@}}',
		'preview': async ({ args }) => n + 'npx vite preview' + (args.mode ? '' : ' --mode=dev') + ' {{@}}',
		'build': async ({ args }) => n + 'npx vite build' + (args.mode ? '' : ' --mode=prod') + ' {{@}}',

		'tests': async ({ args }) => n + 'npx vitest' + (args.mode ? '' : ' --mode=dev') + ' {{@}}',
		'tests:bench': async ({ args }) => n + 'npx vitest bench' + (args.mode ? '' : ' --mode=dev') + ' {{@}}',
		'tests:sandbox': async ({ args }) => n + 'VITEST_SANDBOX_ENABLE=true npx vitest' + (args.mode ? '' : ' --mode=dev') + ' {{@}}',
		'tests:examples': async ({ args }) => n + 'VITEST_EXAMPLES_ENABLE=true npx vitest' + (args.mode ? '' : ' --mode=dev') + ' {{@}}',

		'jest': n + 'npx jest {{@}}', // Runs project Jest tests.
		'vitest': async ({ args }) => n + 'npx vitest' + (args.mode ? '' : ' --mode=dev') + ' {{@}}',
		'wrangler': n + 'CLOUDFLARE_API_TOKEN="${USER_CLOUDFLARE_TOKEN:-}" npx wrangler {{@}}',

		...events, // e.g., `on::madrun:default:new`.
	};
};
