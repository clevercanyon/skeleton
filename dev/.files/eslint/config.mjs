/**
 * ESLint config file.
 *
 * ESLint is not aware of this config file's location.
 *
 * This config file can be tested using:
 *
 *     $ ESLINT_USE_FLAT_CONFIG=true npx eslint --config ./eslint.config.mjs --print-config [file]
 *
 * @note PLEASE DO NOT EDIT THIS FILE!
 * @note This entire file will be updated automatically.
 * @note Instead of editing here, please review <https://github.com/clevercanyon/skeleton>.
 *
 * @see https://eslint.org/docs/latest/user-guide/command-line-interface
 * @see https://eslint.org/docs/latest/use/configure/configuration-files-new
 */

import eslintJS from '@eslint/js';
import pluginTypeScript from '@typescript-eslint/eslint-plugin';
import parserTypeScript from '@typescript-eslint/parser';
import configPrettier from 'eslint-config-prettier';
import * as parserMDX from 'eslint-mdx';
import pluginJSXA11y from 'eslint-plugin-jsx-a11y';
import * as pluginMDX from 'eslint-plugin-mdx';
import pluginPrettier from 'eslint-plugin-prettier';
import * as parserESPree from 'espree';
import globals from 'globals';
import path from 'node:path';
import { $fs } from '../../../node_modules/@clevercanyon/utilities.node/dist/index.js';
import { $obp } from '../../../node_modules/@clevercanyon/utilities/dist/index.js';
import esVersion from '../bin/includes/es-version.mjs';
import exclusions from '../bin/includes/exclusions.mjs';
import extensions from '../bin/includes/extensions.mjs';
import u from '../bin/includes/utilities.mjs';

const __dirname = $fs.imuDirname(import.meta.url);
const projDir = path.resolve(__dirname, '../../..');

const pkg = await u.pkg(); // From utilities.
const targetEnv = $obp.get(pkg, 'config.c10n.&.build.targetEnv', 'any');
const ssrTargetEnv = $obp.get(pkg, 'config.c10n.&.ssrBuild.targetEnv', '');

/**
 * Defines ESLint configuration.
 */
export default async () => {
    /**
     * Base configs.
     */
    const baseConfigs = [
        {
            // In a config all by itself for these to be treated as global ignores; {@see https://o5p.me/RqSMYb}.
            // Important: Our own config files expect this to be at index position `0`.

            ignores: [
                ...new Set([
                    ...exclusions.logIgnores, //
                    ...exclusions.backupIgnores,
                    ...exclusions.patchIgnores,
                    ...exclusions.pkgIgnores,
                    ...exclusions.vcsIgnores,
                    ...exclusions.osIgnores,
                    ...exclusions.lockIgnores,
                    ...exclusions.distIgnores,
                ]),
            ],
        },
        {
            // In a config without a `files` filter for these to treated as global settings; {@see https://o5p.me/JiooH5}.
            // Important: Our own config files expect this to be at index position `1`.

            languageOptions: {
                ecmaVersion: esVersion.year,
                sourceType: pkg.type || 'script',

                parser: parserESPree,
                parserOptions: {
                    ecmaFeatures: {
                        jsx: false,
                        impliedStrict: true,
                    },
                },
                globals: {
                    // ES version globals (builtins).
                    // Provided by current ES version.

                    ...esVersion.globals,

                    // Declares globals based on target environment(s).
                    // For docs on our target environments; {@see https://o5p.me/nCnEkQ}.

                    ...(targetEnv // Globals for target environment.
                        ? {
                              ...(['node', 'any'].includes(targetEnv) ? globals.nodeBuiltin : {}),
                              ...(['cfw', 'any'].includes(targetEnv) ? globals.serviceworker : {}),
                              ...(['cfp', 'web', 'any'].includes(targetEnv) ? globals.browser : {}),
                              ...(['webw', 'any'].includes(targetEnv) ? globals.worker : {}),
                          }
                        : {}),
                    ...(ssrTargetEnv // Globals for SSR target environment.
                        ? {
                              ...(['node', 'any'].includes(ssrTargetEnv) ? globals.nodeBuiltin : {}),
                              ...(['cfw', 'any'].includes(ssrTargetEnv) ? globals.serviceworker : {}),
                              ...(['cfp', 'web', 'any'].includes(ssrTargetEnv) ? globals.browser : {}),
                              ...(['webw', 'any'].includes(ssrTargetEnv) ? globals.worker : {}),
                          }
                        : {}),
                },
            },
        },
    ];

    /**
     * Composition.
     */
    return {
        config: [
            ...baseConfigs,

            // Source configurations.
            {
                files: [
                    '**/*.' +
                        extensions.asBracedGlob([
                            ...extensions.byDevGroup.sJavaScript,
                            ...extensions.byDevGroup.sJavaScriptReact,
                            ...extensions.byDevGroup.sTypeScript,
                            ...extensions.byDevGroup.sTypeScriptReact,
                        ]),
                ],
                languageOptions: { sourceType: pkg.type || 'script' },
            },
            {
                files: [
                    '**/*.' +
                        extensions.asBracedGlob([
                            ...extensions.byDevGroup.mJavaScript,
                            ...extensions.byDevGroup.mJavaScriptReact,
                            ...extensions.byDevGroup.mTypeScript,
                            ...extensions.byDevGroup.mTypeScriptReact,
                        ]),
                ],
                languageOptions: { sourceType: 'module' },
            },
            {
                files: [
                    '**/*.' +
                        extensions.asBracedGlob([
                            ...extensions.byDevGroup.cJavaScript,
                            ...extensions.byDevGroup.cJavaScriptReact,
                            ...extensions.byDevGroup.cTypeScript,
                            ...extensions.byDevGroup.cTypeScriptReact,
                        ]),
                ],
                languageOptions: { sourceType: 'commonjs' },
            },
            {
                files: ['**/*.' + extensions.asBracedGlob([...extensions.byVSCodeLang.markdown, ...extensions.byVSCodeLang.mdx])],
                languageOptions: { sourceType: 'module' }, // MDX only supports modules.
            },

            // Adds Node globals for `dev/.files`, as these always run in Node.
            {
                files: [
                    '*.' + extensions.asBracedGlob([...extensions.byDevGroup.allJavaScript, ...extensions.byDevGroup.allTypeScript]), //
                    'dev/.files/**/*.' + extensions.asBracedGlob([...extensions.byDevGroup.allJavaScript, ...extensions.byDevGroup.allTypeScript]),
                ],
                languageOptions: { globals: { ...globals.nodeBuiltin } },
            },
            {
                files: [
                    '*.' +
                        extensions.asBracedGlob([
                            ...extensions.byDevGroup.cJavaScript,
                            ...extensions.byDevGroup.cJavaScriptReact,
                            ...extensions.byDevGroup.cTypeScript,
                            ...extensions.byDevGroup.cTypeScriptReact,
                        ]), //
                    'dev/.files/**/*.' +
                        extensions.asBracedGlob([
                            ...extensions.byDevGroup.cJavaScript,
                            ...extensions.byDevGroup.cJavaScriptReact,
                            ...extensions.byDevGroup.cTypeScript,
                            ...extensions.byDevGroup.cTypeScriptReact,
                        ]),
                ], // Includes CJS globals like `__dirname`.
                languageOptions: { globals: { ...globals.node } },
            },

            // Baseline JS/TS/JSX/TSX recommended rule configurations.
            {
                // Rules not applied to sandbox|examples.
                files: ['**/*.' + extensions.asBracedGlob([...extensions.byDevGroup.allJavaScript, ...extensions.byDevGroup.allTypeScript])],
                ignores: [...exclusions.sandboxIgnores, ...exclusions.exampleIgnores],
                rules: { ...eslintJS.configs.recommended.rules },
            },

            // JSX/TSX accessbility plugin configurations.
            {
                files: ['**/*.' + extensions.asBracedGlob([...extensions.byDevGroup.allJavaScriptReact, ...extensions.byDevGroup.allTypeScriptReact])],
                plugins: { 'jsx-a11y': pluginJSXA11y },

                languageOptions: {
                    parserOptions: {
                        ecmaFeatures: { jsx: true },
                    },
                },
            },
            {
                // Rules not applied to sandbox|examples.
                files: ['**/*.' + extensions.asBracedGlob([...extensions.byDevGroup.allJavaScriptReact, ...extensions.byDevGroup.allTypeScriptReact])],
                ignores: [...exclusions.sandboxIgnores, ...exclusions.exampleIgnores],
                rules: { ...pluginJSXA11y.configs.recommended.rules },
            },

            // TS/TSX configurations for TypeScript projects.
            {
                // Config not applied to MD/MDX fenced code-blocks.
                // MD/MDX fenced code-blocks are handled separately, below.
                files: ['**/*.' + extensions.asBracedGlob([...extensions.byDevGroup.allTypeScript])],
                ignores: [
                    '**/*.' +
                        extensions.asBracedGlob([...extensions.byVSCodeLang.markdown, ...extensions.byVSCodeLang.mdx]) +
                        '/*.' +
                        extensions.asBracedGlob([...extensions.byDevGroup.allTypeScript]),
                ],
                plugins: { '@typescript-eslint': pluginTypeScript },

                languageOptions: {
                    parser: parserTypeScript,
                    // {@see https://o5p.me/lcIzIg}.
                    parserOptions: {
                        requireConfigFile: true,
                        ecmaFeatures: { globalReturn: false },
                        tsconfigRootDir: path.resolve(projDir),
                        project: ['./tsconfig.json'],
                    },
                },
            },
            {
                // Specifically for MD/MDX fenced code-blocks.
                // Config not applied to any other TypeScript files.
                files: [
                    '**/*.' +
                        extensions.asBracedGlob([...extensions.byVSCodeLang.markdown, ...extensions.byVSCodeLang.mdx]) +
                        '/*.' +
                        extensions.asBracedGlob([...extensions.byDevGroup.allTypeScript]),
                ],
                plugins: { '@typescript-eslint': pluginTypeScript },

                languageOptions: {
                    parser: parserTypeScript,
                    // {@see https://o5p.me/lcIzIg}.
                    parserOptions: {
                        requireConfigFile: false,
                        ecmaFeatures: { globalReturn: false },
                    },
                },
            },
            {
                // Rules not applied to sandbox|examples.
                // Rules not applied to MD/MDX fenced code-blocks.
                files: ['**/*.' + extensions.asBracedGlob([...extensions.byDevGroup.allTypeScript])],
                ignores: [
                    ...exclusions.sandboxIgnores,
                    ...exclusions.exampleIgnores,
                    '**/*.' +
                        extensions.asBracedGlob([...extensions.byVSCodeLang.markdown, ...extensions.byVSCodeLang.mdx]) +
                        '/*.' +
                        extensions.asBracedGlob([...extensions.byDevGroup.allTypeScript]),
                ],
                rules: {
                    ...pluginTypeScript.configs.recommended.rules,
                    ...pluginTypeScript.configs['recommended-requiring-type-checking'].rules,
                },
            },

            // MD/MDX configurations.
            {
                // Config not applied to MD/MDX fenced code-blocks.
                // i.e., This is the processor for those fenced code-blocks.
                files: ['**/*.' + extensions.asBracedGlob([...extensions.byVSCodeLang.markdown, ...extensions.byVSCodeLang.mdx])],
                plugins: { mdx: pluginMDX },

                languageOptions: {
                    parser: parserMDX,
                    parserOptions: {
                        ignoreRemarkConfig: false,
                        extensions: [...extensions.byVSCodeLang.mdx],
                        markdownExtensions: [...extensions.byVSCodeLang.markdown],
                    },
                },
                processor: pluginMDX.createRemarkProcessor({
                    lintCodeBlocks: false,
                    languageMapper: {
                        // Anything not listed explicitly here simply falls through
                        // and the language given is used verbatim; e.g., `php`, `mdx`.
                        javascript: 'js',
                        javascriptreact: 'jsx',

                        typescript: 'ts',
                        typescriptreact: 'tsx',

                        markdown: 'md',
                        shellscript: 'bash',
                    },
                }),
            },
            {
                // Rules not applied to sandbox|examples.
                // Rules not applied to MD/MDX fenced code-blocks.
                files: ['**/*.' + extensions.asBracedGlob([...extensions.byVSCodeLang.markdown, ...extensions.byVSCodeLang.mdx])],
                ignores: [...exclusions.sandboxIgnores, ...exclusions.exampleIgnores],
                rules: { ...pluginMDX.flat.rules },
            },
            {
                // MD/MDX fenced code-block rules.
                // Rules not applied to sandbox|examples.
                files: ['**/*.' + extensions.asBracedGlob([...extensions.byVSCodeLang.markdown, ...extensions.byVSCodeLang.mdx]) + '/*'],
                ignores: [...exclusions.sandboxIgnores, ...exclusions.exampleIgnores],
                rules: { ...pluginMDX.flatCodeBlocks.rules },
            },

            // JS/TS/JSX/TSX/MD/MDX prettier configurations.
            // Several rules get disabled to avoid conflicts w/ Prettier.
            {
                // Applies to all ESLint-able file extensions.
                // Such that formatting can occur even if no ESLint rules apply.
                // Note that we do *not* exclude MDX fenced code-blocks or sandbox|examples.
                files: [
                    '**/*.' +
                        extensions.asBracedGlob([
                            ...extensions.byDevGroup.allJavaScript,
                            ...extensions.byDevGroup.allTypeScript,
                            ...extensions.byVSCodeLang.markdown,
                            ...extensions.byVSCodeLang.mdx,
                        ]),
                ],
                plugins: { prettier: pluginPrettier },

                rules: {
                    ...pluginPrettier.configs.recommended.rules,
                    ...configPrettier.rules, // Prettier rules.
                },
            },

            // JS/TS/JSX/TSX rule override configurations.
            // These are our own overrides against all of the above.
            {
                // Rules not applied to sandbox|examples.
                files: ['**/*.' + extensions.asBracedGlob([...extensions.byDevGroup.allJavaScript, ...extensions.byDevGroup.allTypeScript])],
                ignores: [...exclusions.sandboxIgnores, ...exclusions.exampleIgnores],
                rules: {
                    'no-empty': ['warn', { allowEmptyCatch: true }],
                    'no-unused-vars': [
                        'warn',
                        {
                            vars: 'all',
                            args: 'after-used',
                            caughtErrors: 'none',
                            ignoreRestSiblings: false,
                            argsIgnorePattern: '^unusedꓺ',
                            varsIgnorePattern: '^unusedꓺ',
                            caughtErrorsIgnorePattern: '^unusedꓺ',
                            destructuredArrayIgnorePattern: '^unusedꓺ',
                        },
                    ],
                },
            },

            // TS/TSX rule override configurations.
            // These are our own overrides against all of the above.
            {
                // Rules not applied to sandbox|examples.
                files: ['**/*.' + extensions.asBracedGlob([...extensions.byDevGroup.allTypeScript])],
                ignores: [...exclusions.sandboxIgnores, ...exclusions.exampleIgnores],
                rules: {
                    'no-redeclare': 'off', // Disable in favor of TypeScript rule below.
                    'no-unused-vars': 'off', // Disable in favor of TypeScript rule below.
                    'no-undef': 'off', // Already baked into TypeScript; {@see https://o5p.me/k9TDGC}.

                    '@typescript-eslint/no-redeclare': ['warn'],
                    '@typescript-eslint/require-await': ['off'],
                    '@typescript-eslint/no-empty-interface': ['off'],
                    '@typescript-eslint/no-inferrable-types': ['off'],
                    '@typescript-eslint/ban-ts-comment': [
                        'warn',
                        {
                            'ts-check': 'allow-with-description',
                            'ts-nocheck': 'allow-with-description',
                            'ts-expect-error': 'allow-with-description',
                            'ts-ignore': 'allow-with-description',
                        },
                    ],
                    '@typescript-eslint/triple-slash-reference': [
                        'warn',
                        {
                            'path': 'never',
                            'types': 'always',
                            'lib': 'always',
                        },
                    ],
                    '@typescript-eslint/no-unused-vars': [
                        'warn',
                        {
                            vars: 'all',
                            args: 'after-used',
                            caughtErrors: 'none',
                            ignoreRestSiblings: false,
                            argsIgnorePattern: '^unusedꓺ',
                            varsIgnorePattern: '^unusedꓺ',
                            caughtErrorsIgnorePattern: '^unusedꓺ',
                            destructuredArrayIgnorePattern: '^unusedꓺ',
                        },
                    ],
                },
            },
        ],
    };
};
