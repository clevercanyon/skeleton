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

import events from './includes/events.mjs';

/**
 * Defines madrun configuration.
 */
export default async (/* {cmd, args, ctx} */) => {
	/**
	 * Composition.
	 */
	return {
		'envs': './dev/.files/bin/envs.mjs {{@}}',
		'install': './dev/.files/bin/install.mjs {{@}}',
		'update': './dev/.files/bin/update.mjs {{@}}',

		'dev': async ({ args }) => 'npx vite dev' + (args.mode ? '' : ' --mode=dev') + ' {{@}}',
		'preview': async ({ args }) => 'npx vite preview' + (args.mode ? '' : ' --mode=dev') + ' {{@}}',
		'build': async ({ args }) => 'npx vite build' + (args.mode ? '' : ' --mode=prod') + ' {{@}}',

		'tests': async ({ args }) => 'npx vitest' + (args.mode ? '' : ' --mode=dev') + ' {{@}}',
		'tests:ui': async ({ args }) => 'npx vitest --watch --ui' + (args.mode ? '' : ' --mode=dev') + ' {{@}}',
		'tests:sandbox': async ({ args }) => 'VITEST_SANDBOX_ENABLE=true npx vitest' + (args.mode ? '' : ' --mode=dev') + ' {{@}}',
		'tests:examples': async ({ args }) => 'VITEST_EXAMPLES_ENABLE=true npx vitest' + (args.mode ? '' : ' --mode=dev') + ' {{@}}',
		'tests:sandbox:examples': async ({ args }) => 'VITEST_SANDBOX_ENABLE=true VITEST_EXAMPLES_ENABLE=true npx vitest' + (args.mode ? '' : ' --mode=dev') + ' {{@}}',

		'jest': 'npx jest {{@}}', // Runs project Jest tests.
		'vitest': async ({ args }) => 'npx vitest' + (args.mode ? '' : ' --mode=dev') + ' {{@}}',
		'wrangler': 'CLOUDFLARE_API_TOKEN="${USER_CLOUDFLARE_TOKEN:-}" npx wrangler {{@}}',

		...events, // e.g., `on::madrun:default:new`.
	};
};
