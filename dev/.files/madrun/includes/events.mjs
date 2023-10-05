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

import fsp from 'node:fs/promises';
import path from 'node:path';
import { $fs } from '../../../../node_modules/@clevercanyon/utilities.node/dist/index.js';
import { $app, $brand, $fn, $is, $url } from '../../../../node_modules/@clevercanyon/utilities/dist/index.js';
import u from '../../bin/includes/utilities.mjs';

const __dirname = $fs.imuDirname(import.meta.url);
const projDir = path.resolve(__dirname, '../../../..');
const hop = $brand.get('@clevercanyon/hop.gdn');

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
                await fsp.rm(path.resolve(projDir, './.env.me'), { force: true });
                await fsp.rm(path.resolve(projDir, './.env.vault'), { force: true });

                /**
                 * Initializes a few variables.
                 */
                const _parentDirBasename = path.basename(path.dirname(projDir));
                const _dirBasename = path.basename(projDir);

                const _maybeParentDirBrand = $fn.try(() => $brand.get('@' + _parentDirBasename + '/' + _dirBasename))();
                const _parentDirOwner = $is.brand(_maybeParentDirBrand) ? _maybeParentDirBrand.org.slug : _parentDirBasename;

                const pkgName = args.pkgName || '@' + _parentDirOwner + '/' + _dirBasename;
                const pkgSlug = $app.pkgSlug(pkgName); // Slug from `@org/[slug]` in a scoped package, or `slug` from an unscoped package.

                const repoOwner = (/^@/u.test(pkgName) && /[^@/]\/[^@/]/u.test(pkgName) ? pkgName.replace(/^@/u, '').split('/')[0] : '') || _parentDirOwner;
                const repoName = (/^@/u.test(pkgName) && /[^@/]\/[^@/]/u.test(pkgName) ? pkgName.replace(/^@/u, '').split('/')[1] : '') || _dirBasename;

                const envProdFile = path.resolve(projDir, './dev/.envs/.env.prod');
                const readmeFile = path.resolve(projDir, './README.md');

                /**
                 * Updates `./package.json` file.
                 */
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
                 * Updates `./dev/.envs/.env.prod` file, if exists.
                 */
                await fsp
                    .readFile(envProdFile)
                    .then(async (envProd) => {
                        envProd = envProd.toString();
                        envProd = envProd.replace(/^(APP_BASE_URL)\s*=\s*[^\r\n]*$/gmu, "$1='https://" + pkgSlug + '.' + hop.hostname + "'");
                        await fsp.writeFile(envProdFile, envProd);
                    })
                    .catch((error) => {
                        if ('ENOENT' !== error.code) throw error;
                    });

                /**
                 * Updates `./README.md` file in new project directory.
                 */
                await fsp
                    .readFile(readmeFile)
                    .then(async (readme) => {
                        readme = readme.toString();
                        readme = readme.replace(/^(#\s+)(@[^/?#\s]+\/[^/?#\s]+)/gmu, '$1' + pkgName);
                        await fsp.writeFile(readmeFile, readme);
                    })
                    .catch((error) => {
                        if ('ENOENT' !== error.code) throw error;
                    });

                /**
                 * Initializes this as a new git repository.
                 */
                await u.spawn('git', ['init']);

                /**
                 * Updates Vite build after the above changes.
                 */
                if (await u.isViteBuild()) await u.viteBuild();

                /**
                 * Saves changes made here as first initial commit.
                 */
                await u.gitAddCommit('Initializing project directory. [n]');

                /**
                 * Attempts to create a remote repository origin at GitHub; if at all possible.
                 */
                if ('clevercanyon' === repoOwner) {
                    if (process.env.GH_TOKEN && 'owner' === (await u.gistGetC10NUser()).github?.role) {
                        await u.spawn('gh', ['repo', 'create', repoOwner + '/' + repoName, '--source', projDir, args.public ? '--public' : '--private']);
                    } else {
                        const origin = 'https://github.com/' + $url.encode(repoOwner) + '/' + $url.encode(repoName) + '.git';
                        await u.spawn('git', ['remote', 'add', 'origin', origin]);
                    }
                } else if (process.env.USER_GITHUB_USERNAME === repoOwner) {
                    if (process.env.GH_TOKEN) {
                        await u.spawn('gh', ['repo', 'create', repoOwner + '/' + repoName, '--source', projDir, args.public ? '--public' : '--private']);
                    } else {
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
