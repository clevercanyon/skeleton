/**
 * Vite config file.
 *
 * Vite is not aware of this config file's location.
 *
 * @note PLEASE DO NOT EDIT THIS FILE!
 * @note This entire file will be updated automatically.
 * @note Instead of editing here, please review <https://github.com/clevercanyon/skeleton>.
 *
 * @see https://vitejs.dev/config/
 */
/* eslint-env es2021, node */

import _ from 'lodash';

import fs from 'node:fs';
import path from 'node:path';
import { dirname } from 'desm';
import fsp from 'node:fs/promises';

import mm from 'micromatch';
import { globby } from 'globby';

import mc from 'merge-change';
import prettier from 'prettier';
import spawn from 'spawn-please';

import { loadEnv } from 'vite';
import pluginBasicSSL from '@vitejs/plugin-basic-ssl';
import { ViteEjsPlugin as pluginEJS } from 'vite-plugin-ejs';
import { ViteMinifyPlugin as pluginMinifyHTML } from 'vite-plugin-minify';
import { default as vitePluginZipPack } from 'vite-plugin-zip-pack';

import importAliases from './includes/aliases.js';

import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

/**
 * Defines Vite configuration.
 *
 * @param   vite Data passed in by Vite.
 *
 * @returns      Vite configuration object properties.
 */
export default async ({ mode, command /*, ssrBuild */ }) => {
	/**
	 * Directory vars.
	 */
	const __dirname = dirname(import.meta.url);
	const projDir = path.resolve(__dirname, '../../..');

	const srcDir = path.resolve(__dirname, '../../../src');
	const envsDir = path.resolve(__dirname, '../../../dev/.envs');
	const cargoDir = path.resolve(__dirname, '../../../src/cargo');

	const distDir = path.resolve(__dirname, '../../../dist');
	const a16sDir = path.resolve(__dirname, '../../../dist/assets/a16s');

	/**
	 * Package-related vars.
	 */
	const pkgFile = path.resolve(projDir, './package.json');
	const pkg = JSON.parse((await fsp.readFile(pkgFile)).toString());
	const pkgPrettierCfg = { ...(await prettier.resolveConfig(pkgFile)), parser: 'json' };

	/**
	 * Mode-related vars.
	 */
	const isDev = 'dev' === mode; // Development mode?
	process.env.NODE_ENV = isDev ? 'development' : 'production'; // <https://o5p.me/DscTVM>.

	/**
	 * Environment-related vars.
	 */
	const appEnvPrefix = 'APP_'; // Part of app.
	const env = loadEnv(mode, envsDir, appEnvPrefix);

	/**
	 * App type, target, path, and related vars.
	 */
	const appType = _.get(pkg, 'config.c10n.&.build.appType') || 'cma';
	const targetEnv = _.get(pkg, 'config.c10n.&.build.targetEnv') || 'any';
	const appBasePath = env.APP_BASE_PATH || ''; // From environment vars.

	const isMPA = 'mpa' === appType;
	const isCMA = 'cma' === appType || !isMPA;

	let cmaName = (pkg.name || '').toLowerCase();
	cmaName = cmaName.replace(/\bclevercanyon\b/gu, 'c10n');
	cmaName = cmaName.replace(/@/gu, '').replace(/\./gu, '-').replace(/\/+/gu, '.');
	cmaName = cmaName.replace(/[^a-z.0-9]([^.])/gu, (m0, m1) => m1.toUpperCase());
	cmaName = cmaName.replace(/^\.|\.$/u, '');

	const mpaIndexes = await globby('**/index.html', { expandDirectories: false, cwd: srcDir, absolute: true });
	const mpaIndexesSubPaths = mpaIndexes.map((absPath) => path.relative(srcDir, absPath));

	const cmaEntries = await globby('*.{tsx,ts,jsx,mjs,js}', { expandDirectories: false, cwd: srcDir, absolute: true });
	const cmaEntriesRelPaths = cmaEntries.map((absPath) => './' + path.relative(srcDir, absPath));
	const cmaEntriesSubpaths = cmaEntries.map((absPath) => path.relative(srcDir, absPath));
	const cmaEntriesSubpathsNoExt = cmaEntriesSubpaths.map((subpath) => subpath.replace(/\.[^.]+$/u, ''));

	const mpaEntryIndexSubpath = mpaIndexesSubPaths.find((subpath) => mm.isMatch(subpath, 'index.html'));
	const cmaEntryIndexSubpath = cmaEntriesSubpaths.find((subpath) => mm.isMatch(subpath, 'index.{tsx,ts,jsx,mjs,js}'));
	const cmaEntryIndexSubpathNoExt = cmaEntryIndexSubpath.replace(/\.[^.]+$/u, '');

	const isWeb = ['web', 'webw'].includes(targetEnv);
	const isSSR = ['cfp', 'cfw', 'node'].includes(targetEnv);
	const isSSRWorker = isSSR && ['cfw'].includes(targetEnv);

	/**
	 * Validates all of the above.
	 */
	if (!['dev', 'ci', 'stage', 'prod'].includes(mode)) {
		throw new Error('Required `mode` is missing or invalid. Expecting `dev|ci|stage|prod`.');
	}
	if ((!isMPA && !isCMA) || !['mpa', 'cma'].includes(appType)) {
		throw new Error('Must have a valid `config.c10n.&.build.appType` in `package.json`.');
	}
	if (!['any', 'cfp', 'cfw', 'node', 'web', 'webw', 'opl'].includes(targetEnv)) {
		throw new Error('Must have a valid `config.c10n.&.build.targetEnv` in `package.json`.');
	}
	if (isMPA && !mpaEntryIndexSubpath) {
		throw new Error('Multipage apps must have an `./index.html` entry point.');
	}
	if (isCMA && !cmaEntryIndexSubpath) {
		throw new Error('Custom apps must have an `./index.{tsx,ts,jsx,mjs,js}` entry point.');
	}

	/**
	 * Prepares `package.json` property updates.
	 */
	const origPkg = { ...pkg };

	pkg.type = 'module'; // ES module.
	pkg.files = ['/dist']; // Dist directory only.
	pkg.exports = {}; // Exports object initialization.
	pkg.sideEffects = ['./src/*.{html,scss,css,tsx,ts,jsx,mjs,js}'];

	if (isCMA && (isSSR || cmaEntries.length > 1)) {
		mc.patch(pkg.exports, {
			'.': {
				import: './dist/' + cmaEntryIndexSubpathNoExt + '.js',
				require: './dist/' + cmaEntryIndexSubpathNoExt + '.cjs',
				types: './dist/types/' + cmaEntryIndexSubpathNoExt + '.d.ts',
			},
		});
		pkg.module = './dist/' + cmaEntryIndexSubpathNoExt + '.js';
		pkg.main = './dist/' + cmaEntryIndexSubpathNoExt + '.cjs';

		pkg.browser = isWeb ? pkg.module : '';
		pkg.unpkg = pkg.module;

		pkg.types = './dist/types/' + cmaEntryIndexSubpathNoExt + '.d.ts';
		pkg.typesVersions = { '>=3.1': { './*': ['./dist/types/*'] } };

		for (const cmaEntrySubPathNoExt of cmaEntriesSubpathsNoExt) {
			if (cmaEntrySubPathNoExt === cmaEntryIndexSubpathNoExt) {
				continue; // Don't remap the entry index.
			}
			mc.patch(pkg.exports, {
				['./' + cmaEntrySubPathNoExt]: {
					import: './dist/' + cmaEntrySubPathNoExt + '.js',
					require: './dist/' + cmaEntrySubPathNoExt + '.cjs',
					types: './dist/types/' + cmaEntrySubPathNoExt + '.d.ts',
				},
			});
		}
	} else if (isCMA) {
		mc.patch(pkg.exports, {
			'.': {
				import: './dist/' + cmaEntryIndexSubpathNoExt + '.js',
				require: './dist/' + cmaEntryIndexSubpathNoExt + '.umd.cjs',
				types: './dist/types/' + cmaEntryIndexSubpathNoExt + '.d.ts',
			},
		});
		pkg.module = './dist/' + cmaEntryIndexSubpathNoExt + '.js';
		pkg.main = './dist/' + cmaEntryIndexSubpathNoExt + '.umd.cjs';

		pkg.browser = isWeb ? pkg.main : '';
		pkg.unpkg = pkg.main;

		pkg.types = './dist/types/' + cmaEntryIndexSubpathNoExt + '.d.ts';
		pkg.typesVersions = { '>=3.1': { './*': ['./dist/types/*'] } };
	} else {
		pkg.type = pkg.module = pkg.main = pkg.browser = pkg.unpkg = pkg.types = '';
		(pkg.files = []), (pkg.exports = []), (pkg.sideEffects = []), (pkg.typesVersions = {});
	}

	/**
	 * Updates `package.json` properties impacting builds.
	 */
	const preBuildPkg = { ...origPkg, type: pkg.type, sideEffects: pkg.sideEffects };
	await fsp.writeFile(pkgFile, prettier.format(JSON.stringify(preBuildPkg, null, 4), pkgPrettierCfg));

	/**
	 * Configures plugins for Vite.
	 *
	 * @see https://github.com/vitejs/vite-plugin-basic-ssl
	 * @see https://github.com/trapcodeio/vite-plugin-ejs
	 * @see https://github.com/zhuweiyou/vite-plugin-minify
	 */
	const pluginBasicSSLConfig = pluginBasicSSL();
	const pluginEJSConfig = pluginEJS(
		{ $build: { require, pkg, mode, env, projDir } },
		{
			ejs: /* <https://o5p.me/wGv5nM> */ {
				strict: true, // JS strict mode.
				async: true, // Support await in EJS files.

				delimiter: '?', // <https://o5p.me/Qwu3af>.
				localsName: '$', // Shorter name for `locals`.
				outputFunctionName: 'echo', // For output in scriptlets.

				root: [srcDir], // For includes with an absolute path.
				views: /* For includes with a relative path — includes utilities. */ [
					//
					path.resolve(srcDir, './resources/ejs-views'), // Our standard location for internal EJS views.
					path.resolve(srcDir, './cargo/assets/ejs-views'), // Our standard location for distributed EJS views.

					// If this package is using `@clevercanyon/utilities` we can also leverage EJS fallback utility views.
					...(fs.existsSync(path.resolve(projDir, './node_modules/@clevercanyon/utilities/dist/assets/ejs-views'))
						? [path.resolve(projDir, './node_modules/@clevercanyon/utilities/dist/assets/ejs-views')]
						: []),
				],
			},
		},
	);
	const pluginMinifyHTMLConfig = isDev ? null : pluginMinifyHTML();

	const pluginC10NPostProcessConfig = ((postProcessed = false) => {
		return {
			name: 'vite-plugin-c10n-post-process',
			enforce: 'post', // After others on this hook.

			async writeBundle(/* rollup hook */) {
				if (postProcessed) return;
				postProcessed = true;

				/**
				 * Copies `./.env.vault` to dist directory.
				 */
				if (fs.existsSync(path.resolve(projDir, './.env.vault'))) {
					await fsp.copyFile(path.resolve(projDir, './.env.vault'), path.resolve(distDir, './.env.vault'));
				}

				/**
				 * Writes prepared `package.json` property updates.
				 */
				await fsp.writeFile(pkgFile, prettier.format(JSON.stringify(pkg, null, 4), pkgPrettierCfg));

				/**
				 * Generates typescript type declaration file(s).
				 */
				if ('build' === command) {
					await spawn('npx', ['tsc', '--emitDeclarationOnly'], { cwd: projDir });
				}
			},
		};
	})();
	const pluginZipPackConfig = vitePluginZipPack({ inDir: distDir, outDir: projDir, outFileName: '.~dist.zip' });

	const plugins = [pluginBasicSSLConfig, pluginEJSConfig, pluginMinifyHTMLConfig, pluginC10NPostProcessConfig, pluginZipPackConfig];
	const importedWorkerPlugins = []; // <https://vitejs.dev/guide/features.html#web-workers>.

	/**
	 * Configures rollup for Vite.
	 *
	 * @see https://vitejs.dev/config/build-options.html#build-rollupoptions
	 * @see https://rollupjs.org/guide/en/#big-list-of-options
	 */
	const rollupConfig = {
		input: isCMA // Absolute paths.
			? cmaEntries
			: mpaIndexes,

		external: [
			'__STATIC_CONTENT_MANIFEST', // CF workers.
			...Object.keys(pkg.peerDependencies || {}),
		],
		output: {
			interop: 'auto', // Matches TypeScript.
			exports: 'named', // Matches TypeScript.
			esModule: true, // Matches TypeScript.

			extend: true, // i.e., Global `||` checks.
			noConflict: true, // Like `jQuery.noConflict()`.
		},
	};
	// <https://vitejs.dev/guide/features.html#web-workers>
	const importedWorkerRollupConfig = { ..._.omit(rollupConfig, ['input']) };

	/**
	 * Base config for Vite.
	 *
	 * @see https://vitejs.dev/config/
	 */
	const baseConfig = {
		c10n: { pkg },
		define: {
			// Static replacements.
			$$__APP_PKG_NAME__$$: pkg.name || '',
			$$__APP_PKG_VERSION__$$: pkg.version || '',
			$$__APP_PKG_REPOSITORY__$$: pkg.repository || '',
			$$__APP_PKG_HOMEPAGE__$$: pkg.homepage || '',
			$$__APP_PKG_BUGS__$$: pkg.bugs || '',
		},
		root: srcDir, // Absolute. Where entry indexes live.
		publicDir: path.relative(srcDir, cargoDir), // Relative to `root` directory.
		base: appBasePath + '/', // Analagous to `<base href="/">` — leading & trailing slash.

		appType: isCMA ? 'custom' : 'mpa', // MPA = multipage app: <https://o5p.me/ZcTkEv>.
		resolve: { alias: importAliases }, // See: `../typescript/config.json` and `./includes/aliases.js`.

		envDir: path.relative(srcDir, envsDir), // Relative to `root` directory.
		envPrefix: appEnvPrefix, // Environment vars w/ this prefix become a part of the app.

		server: { open: true, https: true }, // Vite dev server.
		plugins, // Additional Vite plugins that were configured above.

		esbuild: { jsx: 'automatic' }, // ← Not necessary in Vite 4.0.x.
		// See: <https://o5p.me/240y9w>, where `jsx` will be picked up from `tsconfig.json`.

		worker: /* <https://vitejs.dev/guide/features.html#web-workers> */ {
			format: 'es',
			plugins: importedWorkerPlugins,
			rollupOptions: importedWorkerRollupConfig,
		},
		build: /* <https://vitejs.dev/config/build-options.html> */ {
			target: 'es2021', // Matches `tsconfig.json`.
			emptyOutDir: true, // Must set as `true` explicitly.

			outDir: path.relative(srcDir, distDir), // Relative to `root` directory.
			assetsDir: path.relative(distDir, a16sDir), // Relative to `outDir` directory.
			// Note: `a16s` = numeronym for 'acquired resources'.

			ssr: isSSR, // Server-side rendering?
			...(isSSR ? { ssrManifest: true } : {}),

			sourcemap: isDev, // Enables creation of sourcemaps.
			manifest: true, // Enables creation of manifest for assets.

			...(isCMA // Custom-made apps = library code.
				? {
						lib: {
							name: cmaName,
							entry: cmaEntriesRelPaths,
							// Default formats explicitly. See: <https://o5p.me/v0FR3s>.
							formats: cmaEntries.length > 1 ? ['es', 'cjs'] : ['es', 'umd'],
						},
				  }
				: {}),
			rollupOptions: rollupConfig, // See: <https://o5p.me/5Vupql>.
		},
		...(isSSR // <https://vitejs.dev/config/ssr-options.html>.
			? {
					ssr: {
						noExternal: true, // All server side.
						target: isSSRWorker ? 'webworker' : 'node',
					},
			  }
			: {}),
	};

	/**
	 * Returns base config for Vite.
	 */
	return baseConfig;
};
