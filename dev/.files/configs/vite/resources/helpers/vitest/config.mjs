/**
 * Vitest configuration.
 *
 * Vite is not aware of this config file's location.
 *
 * @note PLEASE DO NOT EDIT THIS FILE!
 * @note This entire file will be updated automatically.
 * @note Instead of editing here, please review <https://github.com/clevercanyon/skeleton>.
 *
 * @see https://vitest.dev/config/
 */

import { buildPagesASSETSBinding, defineWorkersProject } from '@cloudflare/vitest-pool-workers/config';
import path from 'node:path';
import { $obj } from '../../../../../../../node_modules/@clevercanyon/utilities/dist/index.js';
import u from '../../../../../resources/utilities.mjs';
import getWranglerSettings from '../../../../wrangler/resources/settings.mjs';

/**
 * Configures Vitest.
 *
 * @param   props Props from vite config file driver.
 *
 * @returns       Vitest configuration.
 */
export default async ({ mode, appType, targetEnv, vitestSandboxEnable, vitestExamplesEnable, rollupConfig, depsConfig }) => {
    const vitestExcludes = [
        ...new Set([
            ...u.exclusions.localIgnores,
            ...u.exclusions.logIgnores,
            ...u.exclusions.backupIgnores,
            ...u.exclusions.patchIgnores,
            ...u.exclusions.editorIgnores,
            ...u.exclusions.pkgIgnores,
            ...u.exclusions.vcsIgnores,
            ...u.exclusions.osIgnores,
            ...u.exclusions.dotIgnores,
            ...u.exclusions.dtsIgnores,
            ...u.exclusions.configIgnores,
            ...u.exclusions.lockIgnores,
            ...u.exclusions.devIgnores,
            ...u.exclusions.distIgnores,
            ...u.exclusions.docIgnores,
            ...(vitestSandboxEnable ? [] : [...u.exclusions.sandboxIgnores]),
            ...(vitestExamplesEnable ? [] : [...u.exclusions.exampleIgnores]),
            ...u.exclusions.adhocExIgnores, // Deliberate ad-hoc exclusions.
        ]),
    ];
    const allEnvSuffixes = ['cfp', 'web', 'cfw', 'webw', 'node', 'any'],
        allReservedSlugs = ['test', 'tests', 'test-d', 'tests-d', 'spec', 'specs', 'spec-d', 'specs-d', 'bench', 'benchmark', 'benchmarks'],
        vitestEnvSpecificPaths = [
            '**/' +
                (allReservedSlugs.length ? u.extensions.asBracedGlob(allReservedSlugs) : '') +
                '/**/*.' +
                (allEnvSuffixes.length ? u.extensions.asBracedGlob(allEnvSuffixes) + '.' : '') +
                u.extensions.asBracedGlob([...u.extensions.byDevGroup.allJavaScript, ...u.extensions.byDevGroup.allTypeScript]),

            '**/*.' +
                (allEnvSuffixes.length ? u.extensions.asBracedGlob(allEnvSuffixes) + '.' : '') +
                (allReservedSlugs.length ? u.extensions.asBracedGlob(allReservedSlugs) + '.' : '') +
                u.extensions.asBracedGlob([...u.extensions.byDevGroup.allJavaScript, ...u.extensions.byDevGroup.allTypeScript]),
        ];
    let jsdomProjectConfig, nodeProjectConfig, workerProjectConfig; // Initialize.

    const envIncludesExcludes = (envSuffixes) => {
        return {
            include:
                vitestSandboxEnable || vitestExamplesEnable
                    ? [
                          ...(vitestSandboxEnable
                              ? [
                                    '**/sandbox/**/{test,tests,spec,specs}/**/*.' +
                                        (envSuffixes.length ? u.extensions.asBracedGlob(envSuffixes) + '.' : '') +
                                        u.extensions.asBracedGlob([...u.extensions.byDevGroup.allJavaScript, ...u.extensions.byDevGroup.allTypeScript]),

                                    '**/sandbox/**/*.' +
                                        (envSuffixes.length ? u.extensions.asBracedGlob(envSuffixes) + '.' : '') +
                                        '{test,tests,spec,specs}.' +
                                        u.extensions.asBracedGlob([...u.extensions.byDevGroup.allJavaScript, ...u.extensions.byDevGroup.allTypeScript]),
                                ]
                              : []),
                          ...(vitestExamplesEnable
                              ? [
                                    '**/{example,examples}/**/{test,tests,spec,specs}/**/*.' +
                                        (envSuffixes.length ? u.extensions.asBracedGlob(envSuffixes) + '.' : '') +
                                        u.extensions.asBracedGlob([...u.extensions.byDevGroup.allJavaScript, ...u.extensions.byDevGroup.allTypeScript]),

                                    '**/{example,examples}/**/*.' +
                                        (envSuffixes.length ? u.extensions.asBracedGlob(envSuffixes) + '.' : '') +
                                        '{test,tests,spec,specs}.' +
                                        u.extensions.asBracedGlob([...u.extensions.byDevGroup.allJavaScript, ...u.extensions.byDevGroup.allTypeScript]),
                                ]
                              : []),
                      ]
                    : [
                          '**/{test,tests,spec,specs}/**/*.' +
                              (envSuffixes.length ? u.extensions.asBracedGlob(envSuffixes) + '.' : '') +
                              u.extensions.asBracedGlob([...u.extensions.byDevGroup.allJavaScript, ...u.extensions.byDevGroup.allTypeScript]),

                          '**/*.' +
                              (envSuffixes.length ? u.extensions.asBracedGlob(envSuffixes) + '.' : '') +
                              '{test,tests,spec,specs}.' +
                              u.extensions.asBracedGlob([...u.extensions.byDevGroup.allJavaScript, ...u.extensions.byDevGroup.allTypeScript]),
                      ],
            exclude: [...new Set([...vitestExcludes, ...(!envSuffixes.length ? vitestEnvSpecificPaths : [])])],

            typecheck: {
                include:
                    vitestSandboxEnable || vitestExamplesEnable
                        ? [
                              ...(vitestSandboxEnable
                                  ? [
                                        '**/sandbox/**/{test,tests,spec,specs}-d/**/*.' +
                                            (envSuffixes.length ? u.extensions.asBracedGlob(envSuffixes) + '.' : '') +
                                            u.extensions.asBracedGlob([...u.extensions.byDevGroup.allTypeScript]),

                                        '**/sandbox/**/*.' +
                                            (envSuffixes.length ? u.extensions.asBracedGlob(envSuffixes) + '.' : '') +
                                            '{test,tests,spec,specs}-d.' +
                                            u.extensions.asBracedGlob([...u.extensions.byDevGroup.allTypeScript]),
                                    ]
                                  : []),
                              ...(vitestExamplesEnable
                                  ? [
                                        '**/{example,examples}/**/{test,tests,spec,specs}-d/**/*.' +
                                            (envSuffixes.length ? u.extensions.asBracedGlob(envSuffixes) + '.' : '') +
                                            u.extensions.asBracedGlob([...u.extensions.byDevGroup.allTypeScript]),

                                        '**/{example,examples}/**/*.' +
                                            (envSuffixes.length ? u.extensions.asBracedGlob(envSuffixes) + '.' : '') +
                                            '{test,tests,spec,specs}-d.' +
                                            u.extensions.asBracedGlob([...u.extensions.byDevGroup.allTypeScript]),
                                    ]
                                  : []),
                          ]
                        : [
                              '**/{test,tests,spec,specs}-d/**/*.' +
                                  (envSuffixes.length ? u.extensions.asBracedGlob(envSuffixes) + '.' : '') +
                                  u.extensions.asBracedGlob([...u.extensions.byDevGroup.allTypeScript]),

                              '**/*.' +
                                  (envSuffixes.length ? u.extensions.asBracedGlob(envSuffixes) + '.' : '') +
                                  '{test,tests,spec,specs}-d.' +
                                  u.extensions.asBracedGlob([...u.extensions.byDevGroup.allTypeScript]),
                          ],
                exclude: [...new Set([...vitestExcludes, ...(!envSuffixes.length ? vitestEnvSpecificPaths : [])])],
            },
            benchmark: {
                include:
                    vitestSandboxEnable || vitestExamplesEnable
                        ? [
                              ...(vitestSandboxEnable
                                  ? [
                                        '**/sandbox/**/{bench,benchmark,benchmarks}/**/*.' +
                                            (envSuffixes.length ? u.extensions.asBracedGlob(envSuffixes) + '.' : '') +
                                            u.extensions.asBracedGlob([...u.extensions.byDevGroup.allJavaScript, ...u.extensions.byDevGroup.allTypeScript]),

                                        '**/sandbox/**/*.' +
                                            (envSuffixes.length ? u.extensions.asBracedGlob(envSuffixes) + '.' : '') +
                                            '{bench,benchmark,benchmarks}.' +
                                            u.extensions.asBracedGlob([...u.extensions.byDevGroup.allJavaScript, ...u.extensions.byDevGroup.allTypeScript]),
                                    ]
                                  : []),
                              ...(vitestExamplesEnable
                                  ? [
                                        '**/{example,examples}/**/{bench,benchmark,benchmarks}/**/*.' +
                                            (envSuffixes.length ? u.extensions.asBracedGlob(envSuffixes) + '.' : '') +
                                            u.extensions.asBracedGlob([...u.extensions.byDevGroup.allJavaScript, ...u.extensions.byDevGroup.allTypeScript]),

                                        '**/{example,examples}/**/*.' +
                                            (envSuffixes.length ? u.extensions.asBracedGlob(envSuffixes) + '.' : '') +
                                            '{bench,benchmark,benchmarks}.' +
                                            u.extensions.asBracedGlob([...u.extensions.byDevGroup.allJavaScript, ...u.extensions.byDevGroup.allTypeScript]),
                                    ]
                                  : []),
                          ]
                        : [
                              '**/{bench,benchmark,benchmarks}/**/*.' +
                                  (envSuffixes.length ? u.extensions.asBracedGlob(envSuffixes) + '.' : '') +
                                  u.extensions.asBracedGlob([...u.extensions.byDevGroup.allJavaScript, ...u.extensions.byDevGroup.allTypeScript]),

                              '**/*.' +
                                  (envSuffixes.length ? u.extensions.asBracedGlob(envSuffixes) + '.' : '') +
                                  '{bench,benchmark,benchmarks}.' +
                                  u.extensions.asBracedGlob([...u.extensions.byDevGroup.allJavaScript, ...u.extensions.byDevGroup.allTypeScript]),
                          ],
                exclude: [...new Set([...vitestExcludes, ...(!envSuffixes.length ? vitestEnvSpecificPaths : [])])],
            },
            css: { include: /.+/u, exclude: [] }, // CSS includes/excludes; i.e., when following style imports.
        };
    };
    const wranglerSettings = await getWranglerSettings();

    return {
        vitestConfig: {
            mode, // Same mode as Vite.
            root: u.srcDir, // Vitest root dir.

            restoreMocks: true, // Remove all mocks before a test begins.
            unstubEnvs: true, // Remove all env stubs before a test begins.
            unstubGlobals: true, // Remove all global stubs before a test begins.

            passWithNoTests: true, // Pass if there are no tests to run.
            allowOnly: true, // Allows `describe.only`, `test.only`, `bench.only`.

            watch: false, // Disable watching by default; instead use `--watch`.
            forceRerunTriggers: [], // Disable; we’ll perform our own full re-runs when necessary.
            // One of the reasons for disabling this is because it doesn’t support negated `!` patterns.

            reporters: ['verbose', 'hanging-process'], // Verbose reporting.
            // {@see https://o5p.me/p0f9j5} for further details.

            // Unprefixed vars that we want added to `import.meta.env`.
            // Vars with app-environment prefixes are already included by default.
            // This is mainly for worker tests, because `process.env` is available otherwise;
            // whereas with worker tests, the pool of workers does not inherit `process.env`.
            env: $obj.pick(process.env, ['CI', 'TEST', 'VITEST']),

            outputFile: {
                json: path.resolve(u.logsDir, './tests/vitest.json'),
                junit: path.resolve(u.logsDir, './tests/vitest.junit'),
                html: path.resolve(u.logsDir, './tests/vitest/index.html'),
            },
            benchmark: {
                outputFile: {
                    json: path.resolve(u.logsDir, './benchmarks/vitest.json'),
                    junit: path.resolve(u.logsDir, './benchmarks/vitest.junit'),
                    html: path.resolve(u.logsDir, './benchmarks/vitest.html'),
                },
            },
            coverage: {
                all: true, // All of the below.
                extension: [...u.extensions.byDevGroup.allJavaScript, ...u.extensions.byDevGroup.allTypeScript],

                include: ['**/*.' + u.extensions.asBracedGlob([...u.extensions.byDevGroup.allJavaScript, ...u.extensions.byDevGroup.allTypeScript])],
                exclude: [
                    ...new Set([
                        ...vitestExcludes,
                        ...u.exclusions.sandboxIgnores,
                        ...u.exclusions.exampleIgnores,
                        ...u.exclusions.testIgnores,
                        ...u.exclusions.specIgnores,
                        ...u.exclusions.benchIgnores,
                    ]),
                ],
                reporter: ['text', 'html', 'clover', 'json'],
                reportsDirectory: path.resolve(u.logsDir, './coverage/vitest'),
            },
            server: {
                deps: {
                    inline: [], // {@see https://o5p.me/DHrjU4} for details.
                    external: [...new Set([...u.exclusions.pkgIgnores].concat(rollupConfig.external))],
                },
            },
            poolOptions: {
                workers: {
                    singleWorker: true,
                    wrangler: {
                        configPath: path.resolve(u.projDir, './wrangler.toml'), // {@see https://o5p.me/vUsocE}.
                        // For pages projects, an explicit `dev` environment is not supported by `$ madrun wrangler pages deploy`.
                        // The only valid environment keys are `production` and `preview`. So instead of `dev`, top-level keys are `dev` keys.
                        // Remember, miniflare writes to local storage anyway, so having a separate `dev` environment is not 100% necessary.
                        // What is necessary is that miniflare knows the names of the bindings we need, so it can populate those for tests.
                        ...(['spa', 'mpa'].includes(appType) && ['cfp'].includes(targetEnv) ? {} : { environment: 'dev' }),
                    },
                    // Miniflare config takes precedence over wrangler config.
                    miniflare: {
                        ...(['cfp', 'any'].includes(targetEnv) // For example, utilities or another library potentially targeting `cfp`.
                            ? // Explicitly defining an assets binding for `createPagesEventContext()` in `@clevercanyon/utilities.cfp/test`.
                              {
                                  serviceBindings: {
                                      ASSETS:
                                          // eslint-disable-next-line no-constant-condition, no-constant-binary-expression -- @review Can we start using `buildPagesASSETSBinding()`?
                                          'use:buildPagesASSETSBinding()' === true // Buggy; {@see https://github.com/cloudflare/workers-sdk/issues/6582}.
                                              ? await buildPagesASSETSBinding(wranglerSettings.defaultPagesAssetsDir)
                                              : async () => new Response(null, { status: 404 }),
                                  },
                              }
                            : {}),
                    },
                },
            },
            deps: {
                optimizer: {
                    web: depsConfig, // @{see https://o5p.me/c7L3KS}.
                    ssr: depsConfig, // @{see https://o5p.me/c7L3KS}.
                },
            },
            workspace: [
                $obj.mergeDeep(
                    (jsdomProjectConfig = {
                        extends: true,
                        test: {
                            mode, // Same mode.
                            environment: 'jsdom',
                        },
                    }),
                    {
                        test: {
                            name: '[cfp,web]',
                            ...envIncludesExcludes(['cfp', 'web']),
                        },
                    },
                ),
                $obj.mergeDeep(
                    (workerProjectConfig = $obj.patchDeep(defineWorkersProject({}), {
                        extends: true,
                        test: {
                            mode, // Same mode.
                            environment: 'node', // + workerd; {@see https://o5p.me/QUeRzq}.
                            deps: {
                                optimizer: {
                                    ssr: $obj.mergeDeep(depsConfig, {
                                        $concat: {
                                            include: [
                                                '@clevercanyon/utilities', //
                                                '@clevercanyon/utilities/**',

                                                '@clevercanyon/utilities.web',
                                                '@clevercanyon/utilities.web/**',

                                                '@clevercanyon/utilities.cfw',
                                                '@clevercanyon/utilities.cfw/**',

                                                '@clevercanyon/utilities.cfp',
                                                '@clevercanyon/utilities.cfp/**',
                                            ].filter((name) => name !== u.pkgName && !name.startsWith(u.pkgName + '/')),
                                        },
                                    }),
                                },
                            },
                        },
                    })),
                    {
                        test: {
                            name: '[cfw,webw]',
                            ...envIncludesExcludes(['cfw', 'webw']),
                        },
                    },
                ),
                $obj.mergeDeep(
                    (nodeProjectConfig = {
                        extends: true,
                        test: {
                            mode, // Same mode.
                            environment: 'node',
                        },
                    }),
                    {
                        test: {
                            name: '[node,any]',
                            ...envIncludesExcludes(['node', 'any']),
                        },
                    },
                ),
                $obj.mergeDeep(
                    ['cfp', 'web'].includes(targetEnv) ? jsdomProjectConfig :
                    ['cfw', 'webw'].includes(targetEnv) ? workerProjectConfig :
                    ['node', 'any'].includes(targetEnv) ? nodeProjectConfig :
                        nodeProjectConfig, // Default is node.
                    {
                        test: {
                            name: '[targetEnv:' + targetEnv + ']',
                            ...envIncludesExcludes([]),
                        },
                    },
                ), // prettier-ignore
            ],
        },
    };
};
