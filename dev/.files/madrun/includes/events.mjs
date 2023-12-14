#!/usr/bin/env node
/**
 * Madrun config file.
 *
 * Madrun is not aware of this config file's location.
 *
 * @note PLEASE DO NOT EDIT THIS FILE!
 * @note This entire file will be updated automatically.
 * @note Instead of editing here, please review <https://github.com/clevercanyon/skeleton>.
 */

import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { $chalk, $fs } from '../../../../node_modules/@clevercanyon/utilities.node/dist/index.js';
import { $app, $brand, $fn, $is, $json, $obp, $url } from '../../../../node_modules/@clevercanyon/utilities/dist/index.js';
import u from '../../bin/includes/utilities.mjs';

const __dirname = $fs.imuDirname(import.meta.url);
const projDir = path.resolve(__dirname, '../../../..');

/**
 * Defines event handlers.
 */
export default {
    /**
     * `$ madrun new` events.
     */
    'on::madrun:default:new': {
        cmds: [
            /**
             * Installs new project.
             */
            ['npx', '@clevercanyon/madrun', 'install', 'project'],

            /**
             * Configures new project.
             */
            async ({ args }) => {
                /**
                 * Propagates env vars.
                 */
                await u.propagateUserEnvVars();

                /**
                 * Deletes Dotenv Vault associated with template.
                 */
                u.log($chalk.green('Removing `./env.{me,vault}` files.'));
                await fsp.rm(path.resolve(projDir, './.env.me'), { force: true });
                await fsp.rm(path.resolve(projDir, './.env.vault'), { force: true });

                /**
                 * Initializes a few variables.
                 */
                u.log($chalk.green('Configuring project variables.'));

                const _parentDirBasename = path.basename(path.dirname(projDir));
                const _dirBasename = path.basename(projDir);

                const _maybeParentDirBrand = $fn.try(() => $brand.get('@' + _parentDirBasename + '/' + _dirBasename))();
                const _parentDirOwner = $is.brand(_maybeParentDirBrand) ? _maybeParentDirBrand.org.slug : _parentDirBasename;

                const pkgName = args.pkgName || '@' + _parentDirOwner + '/' + _dirBasename;
                const pkgSlug = $app.pkgSlug(pkgName); // Slug from `@org/[slug]` in a scoped package, or `slug` from an unscoped package.

                const repoOwner = (/^@/u.test(pkgName) && /[^@/]\/[^@/]/u.test(pkgName) ? pkgName.replace(/^@/u, '').split('/')[0] : '') || _parentDirOwner;
                const repoName = (/^@/u.test(pkgName) && /[^@/]\/[^@/]/u.test(pkgName) ? pkgName.replace(/^@/u, '').split('/')[1] : '') || _dirBasename;

                const envsDir = path.resolve(projDir, './dev/.envs');
                const readmeFile = path.resolve(projDir, './README.md');

                u.log($chalk.gray($json.stringify({ pkgName, pkgSlug, repoOwner, repoName }, { pretty: true })));

                /**
                 * Updates `./package.json` file.
                 */
                u.log($chalk.green('Updating `./package.json` properties.'));
                await u.updatePkg({
                    name: pkgName, // e.g., `@org/[slug]` forms a package name.
                    repository: 'https://github.com/' + $url.encode(repoOwner) + '/' + $url.encode(repoName),
                    homepage: 'https://github.com/' + $url.encode(repoOwner) + '/' + $url.encode(repoName) + '#readme',
                    bugs: 'https://github.com/' + $url.encode(repoOwner) + '/' + $url.encode(repoName) + '/issues',

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

                /**
                 * Acquires updated `./package.json` file.
                 */
                const pkg = await u.pkg(); // Log it for review.
                u.log($chalk.gray($json.stringify(pkg, { pretty: true })));

                /**
                 * Gets Wrangler settings now that we have a valid `./package.json` file.
                 */
                const wranglerSettings = (await import('../../wrangler/settings.mjs')).default;

                /**
                 * Updates `./dev/.envs`, if applicable.
                 */
                if (fs.existsSync(envsDir)) {
                    u.log($chalk.green('Updating `./dev/.envs`.'));
                    const envFiles = await u.envFiles();

                    await fsp
                        .readFile(envFiles.main)
                        .then((buffer) => buffer.toString())
                        .then(async (contents) => {
                            if ('cfw' === $obp.get(pkg, 'config.c10n.&.build.targetEnv')) {
                                contents = contents.replace(/^(BASE_PATH)\s*=\s*[^\r\n]*$/gmu, "$1='/" + wranglerSettings.defaultWorkerShortName + "'");
                            } else if ('cfp' === $obp.get(pkg, 'config.c10n.&.build.targetEnv')) {
                                contents = contents.replace(/^(BASE_PATH)\s*=\s*[^\r\n]*$/gmu, "$1='' # No base path.");
                            }
                            await fsp.writeFile(envFiles.main, contents);
                        })
                        .catch((error) => {
                            if ('ENOENT' !== error.code) throw error;
                        });

                    await fsp
                        .readFile(envFiles.stage)
                        .then((buffer) => buffer.toString())
                        .then(async (contents) => {
                            if ('cfw' === $obp.get(pkg, 'config.c10n.&.build.targetEnv')) {
                                contents = contents.replace(/^(BASE_PATH)\s*=\s*[^\r\n]*$/gmu, "$1='/" + wranglerSettings.defaultWorkerStageShortName + "'");
                                contents = contents.replace(/^(APP_BASE_URL)\s*=\s*[^\r\n]*$/gmu, "$1='https://" + wranglerSettings.defaultWorkersDomain + "${BASE_PATH}/'");
                            } else if ('cfp' === $obp.get(pkg, 'config.c10n.&.build.targetEnv')) {
                                contents = contents.replace(
                                    /^(APP_BASE_URL)\s*=\s*[^\r\n]*$/gmu,
                                    "$1='https://" +
                                        wranglerSettings.defaultPagesProjectStageBranchName +
                                        '.' +
                                        wranglerSettings.defaultPagesProjectName +
                                        '.' +
                                        wranglerSettings.defaultPagesDevZoneName +
                                        "${BASE_PATH}/'",
                                );
                            }
                            await fsp.writeFile(envFiles.stage, contents);
                        })
                        .catch((error) => {
                            if ('ENOENT' !== error.code) throw error;
                        });

                    await fsp
                        .readFile(envFiles.prod)
                        .then((buffer) => buffer.toString())
                        .then(async (contents) => {
                            if ('cfw' === $obp.get(pkg, 'config.c10n.&.build.targetEnv')) {
                                contents = contents.replace(/^(APP_BASE_URL)\s*=\s*[^\r\n]*$/gmu, "$1='https://" + wranglerSettings.defaultWorkersDomain + "${BASE_PATH}/'");
                            } else if ('cfp' === $obp.get(pkg, 'config.c10n.&.build.targetEnv')) {
                                contents = contents.replace(
                                    /^(APP_BASE_URL)\s*=\s*[^\r\n]*$/gmu,
                                    "$1='https://" + wranglerSettings.defaultPagesProjectShortName + '.' + wranglerSettings.defaultPagesZoneName + "${BASE_PATH}/'",
                                );
                            }
                            await fsp.writeFile(envFiles.prod, contents);
                        })
                        .catch((error) => {
                            if ('ENOENT' !== error.code) throw error;
                        });
                }

                /**
                 * Updates `./README.md` file, if applicable.
                 */
                if (fs.existsSync(readmeFile)) {
                    u.log($chalk.green('Updating `./README.md`.'));

                    await fsp
                        .readFile(readmeFile)
                        .then((buffer) => buffer.toString())
                        .then(async (contents) => {
                            contents = contents.replace(/^(#\s+)(@[^/?#\s]+\/[^/?#\s]+)/gmu, '$1' + pkgName);
                            await fsp.writeFile(readmeFile, contents);
                        })
                        .catch((error) => {
                            if ('ENOENT' !== error.code) throw error;
                        });
                }

                /**
                 * Initializes this as a new git repository.
                 */
                u.log($chalk.green('Initializing git repository.'));
                await u.spawn('git', ['init']);

                /**
                 * Updates dotfiles after the above changes.
                 */
                u.log($chalk.green('Updating project dotfiles.'));
                await u.updateDotfiles(/* Recompiles statics. */);

                /**
                 * Updates Vite build after the above changes.
                 */
                u.log($chalk.green('Updating project build directory.'));
                if (await u.isViteBuild()) await u.viteBuild();

                /**
                 * Saves changes made here as first initial commit.
                 */
                u.log($chalk.green('Adding first git commit with project files.'));
                await u.gitAddCommit('Initializing project directory. [n]');

                /**
                 * Attempts to create a remote repository origin at GitHub; if at all possible.
                 *
                 * The `--add-readme` argument to `gh repo create` is important because it forces repo creation to also
                 * create the default branch. Without creating a readme, the repo will exist, but it will have no branch
                 * yet, which is confusing and problematic; i.e., the rest of our automation routines expect a default
                 * `main` branch to exist, such that we can configure branch protection, etc.
                 */
                if ('clevercanyon' === repoOwner) {
                    if (process.env.GH_TOKEN && 'owner' === (await u.gistGetC10NUser()).github?.role) {
                        u.log($chalk.green('Creating remote project repo at GitHub [' + (args.public ? 'public' : 'private') + '].'));
                        await u.spawn('gh', ['repo', 'create', repoOwner + '/' + repoName, '--source', projDir, args.public ? '--public' : '--private', '--add-readme']);
                    } else {
                        u.log($chalk.green('Configuring a remote repo origin.'));
                        const origin = 'https://github.com/' + $url.encode(repoOwner) + '/' + $url.encode(repoName) + '.git';
                        await u.spawn('git', ['remote', 'add', 'origin', origin]);
                    }
                } else if (process.env.USER_GITHUB_USERNAME === repoOwner) {
                    if (process.env.GH_TOKEN) {
                        u.log($chalk.green('Creating remote project repo at GitHub [' + (args.public ? 'public' : 'private') + '].'));
                        await u.spawn('gh', ['repo', 'create', repoOwner + '/' + repoName, '--source', projDir, args.public ? '--public' : '--private', '--add-readme']);
                    } else {
                        u.log($chalk.green('Configuring a remote repo origin.'));
                        const origin = 'https://github.com/' + $url.encode(repoOwner) + '/' + $url.encode(repoName) + '.git';
                        await u.spawn('git', ['remote', 'add', 'origin', origin]);
                    }
                }

                /**
                 * Signals completion with success.
                 */
                u.log(await u.finaleBox('Success', 'New project ready.'));
            },
        ],
    },
};
