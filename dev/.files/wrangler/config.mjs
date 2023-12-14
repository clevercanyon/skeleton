#!/usr/bin/env node
/**
 * Wrangler config file.
 *
 * Wrangler is not aware of this config file's location.
 *
 * The underlying `../../../wrangler.toml` file can be recompiled using:
 *
 *     $ madrun update wrangler
 *     or: $ madrun update dotfiles
 *
 * The underlying `../../../wrangler.toml` file can be partially tested using:
 *
 *     $ madrun wrangler types ... outputs: `./worker-configuration.d.ts`.
 *
 * @note PLEASE DO NOT EDIT THIS FILE!
 * @note This entire file will be updated automatically.
 * @note Instead of editing here, please review <https://github.com/clevercanyon/skeleton>.
 *
 * @see https://developers.cloudflare.com/workers/wrangler/configuration/
 */

import path from 'node:path';
import { $fs } from '../../../node_modules/@clevercanyon/utilities.node/dist/index.js';
import { $obp, $path } from '../../../node_modules/@clevercanyon/utilities/dist/index.js';
import extensions from '../bin/includes/extensions.mjs';
import u from '../bin/includes/utilities.mjs';
import wranglerSettings from './settings.mjs';

const __dirname = $fs.imuDirname(import.meta.url);
const projDir = path.resolve(__dirname, '../../..');

const pkg = await u.pkg(); // `./package.json`.
const appType = $obp.get(pkg, 'config.c10n.&.build.appType');

/**
 * Defines Wrangler configuration.
 */
export default async () => {
    /**
     * Base config.
     */
    const baseConfig = {
        // Platform settings.

        send_metrics: false, // Don't share usage.

        // Cannot be added once we opt into standard pricing.
        // This field should be configured from CF dashboard.
        // usage_model: 'bundled', // 10M/mo free + $0.50/M.

        // Compatibility settings.

        compatibility_date: wranglerSettings.compatibilityDate,
        compatibility_flags: wranglerSettings.compatibilityFlags,

        // Worker account ID.

        account_id: wranglerSettings.defaultAccountId,

        // The rest of these settings are applied conditionally.

        ...(['spa', 'mpa'].includes(appType)
            ? {
                  // N/A to Cloudflare Pages.
                  // Cloudflare Pages does not use.
              }
            : {
                  // Off by default.

                  workers_dev: false,

                  // Worker name.

                  name: wranglerSettings.defaultWorkerName,

                  // App main entry configuration.

                  main: './' + path.relative(projDir, './dist/index.js'),

                  // Bundling configuration; {@see <https://o5p.me/JRHxfC>}.

                  rules: [
                      {
                          type: 'ESModule',
                          globs: extensions.asNoBraceGlobstars([
                              ...extensions.byDevGroup.sJavaScript, //
                              ...extensions.byDevGroup.sJavaScriptReact,

                              ...extensions.byDevGroup.mJavaScript,
                              ...extensions.byDevGroup.mJavaScriptReact,
                          ]),
                          fallthrough: false,
                      },
                      {
                          type: 'CommonJS',
                          globs: extensions.asNoBraceGlobstars([
                              ...extensions.byDevGroup.cJavaScript, //
                              ...extensions.byDevGroup.cJavaScriptReact,
                          ]),
                          fallthrough: false,
                      },
                      {
                          type: 'Text',
                          globs: extensions.asNoBraceGlobstars(
                              [...extensions.byVSCodeLang.codeTextual].filter(
                                  (ext) =>
                                      ![
                                          ...extensions.byDevGroup.sJavaScript, //
                                          ...extensions.byDevGroup.sJavaScriptReact,

                                          ...extensions.byDevGroup.mJavaScript,
                                          ...extensions.byDevGroup.mJavaScriptReact,

                                          ...extensions.byDevGroup.cJavaScript,
                                          ...extensions.byDevGroup.cJavaScriptReact,

                                          ...extensions.byCanonical.wasm,
                                          ...extensions.byDevGroup.allTypeScript,
                                          // Omit TypeScript also, because it causes Wrangler to choke. Apparently, Wrangler’s build system incorporates TypeScript middleware files.
                                          // Therefore, we omit all TypeScript such that Wrangler’s build system can add TS files without them inadvertently being classified as text by our rules.
                                          // We don’t expect TypeScript to be present in our `./dist` anyway, so this is harmless, and probably a good idea in general to omit TypeScript here.
                                      ].includes(ext),
                              ),
                          ),
                          fallthrough: false,
                      },
                      {
                          type: 'Data',
                          globs: extensions.asNoBraceGlobstars(
                              [...extensions.byVSCodeLang.codeTextBinary].filter(
                                  (ext) =>
                                      ![
                                          ...extensions.byDevGroup.sJavaScript, //
                                          ...extensions.byDevGroup.sJavaScriptReact,

                                          ...extensions.byDevGroup.mJavaScript,
                                          ...extensions.byDevGroup.mJavaScriptReact,

                                          ...extensions.byDevGroup.cJavaScript,
                                          ...extensions.byDevGroup.cJavaScriptReact,

                                          ...extensions.byCanonical.wasm,
                                          ...extensions.byDevGroup.allTypeScript,
                                      ].includes(ext),
                              ),
                          ),
                          fallthrough: false,
                      },
                      { type: 'CompiledWasm', globs: extensions.asNoBraceGlobstars([...extensions.byCanonical.wasm]), fallthrough: false },
                  ],
                  // Custom build configuration.

                  build: {
                      cwd: './' + path.relative(projDir, './'),
                      watch_dir: './' + path.relative(projDir, './src'),
                      command: 'npx @clevercanyon/madrun build --mode=prod',
                  },
                  // Worker sites; i.e., bucket configuration.

                  site: {
                      bucket: './' + path.relative(projDir, './dist/assets'),
                      exclude: [
                          ...$path.defaultNPMIgnores(),
                          '/a16s', // A16s (top-level only).
                      ],
                  },
                  // Worker route configuration.

                  route: {
                      zone_name: wranglerSettings.defaultWorkerZoneName,
                      pattern: wranglerSettings.defaultWorkersDomain + '/' + wranglerSettings.defaultWorkerShortName + '/*',
                  },

                  // `$ madrun wrangler dev` settings.
                  dev: {
                      local_protocol: wranglerSettings.defaultLocalProtocol,
                      ip: wranglerSettings.defaultLocalIP, // e.g., `0.0.0.0`.
                      port: Number(wranglerSettings.defaultLocalPort),
                  },

                  // Environments used by this worker.
                  env: {
                      // `$ madrun wrangler dev` environment, for local testing.
                      dev: {
                          route: {
                              zone_name: wranglerSettings.defaultLocalHostname,
                              pattern: wranglerSettings.defaultLocalHostname + '/' + wranglerSettings.defaultWorkerShortName + '/*',
                          },
                          vars: wranglerSettings.miniflareEnvVarAsObject,
                          build: {
                              cwd: './' + path.relative(projDir, './'),
                              watch_dir: './' + path.relative(projDir, './src'),
                              command: 'VITE_WRANGLER_MODE=dev npx @clevercanyon/madrun build --mode=dev',
                          },
                      },
                      // `$ madrun wrangler deploy --env=stage` using `workers.dev`.
                      stage: {
                          workers_dev: true, // Auto-generates the necessary route.
                          build: {
                              cwd: './' + path.relative(projDir, './'),
                              watch_dir: './' + path.relative(projDir, './src'),
                              command: 'npx @clevercanyon/madrun build --mode=stage',
                          },
                      },
                  },
              }),
    };

    /**
     * Composition.
     */
    return {
        ...baseConfig,
    };
};
