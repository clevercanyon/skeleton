#!/usr/bin/env node
/**
 * VS Code config file.
 *
 * VS Code is not aware of this config file's location.
 *
 * The underlying `../../../.vscode/settings.json` file can be recompiled using:
 *
 *     $ madrun update vscode
 *     or: $ madrun update dotfiles
 *
 * @note PLEASE DO NOT EDIT THIS FILE!
 * @note This entire file will be updated automatically.
 * @note Instead of editing here, please review <https://github.com/clevercanyon/skeleton>.
 *
 * @see https://code.visualstudio.com/docs/getstarted/settings
 */

import path from 'node:path';
import { $fs, $prettier } from '../../../node_modules/@clevercanyon/utilities.node/dist/index.js';
import { $path } from '../../../node_modules/@clevercanyon/utilities/dist/index.js';
import exclusions from '../bin/includes/exclusions.mjs';
import extensions from '../bin/includes/extensions.mjs';
import u from '../bin/includes/utilities.mjs';

const __dirname = $fs.imuDirname(import.meta.url);
const projDir = path.resolve(__dirname, '../../..');
const pkgFile = path.resolve(projDir, './package.json');
const prettierConfig = { ...(await $prettier.resolveConfig(pkgFile)), parser: 'json' };

/**
 * Defines VS Code configuration.
 */
export default async () => {
    /**
     * File associations.
     */
    let fileAssociations = {}; // Initialize.
    const extsByVSCodeLang = $path.extsByVSCodeLang();

    for (const [vsCodeLang, exts] of Object.entries(extsByVSCodeLang)) {
        fileAssociations['**/*.' + extensions.asBracedGlob(exts)] = vsCodeLang;
    }
    const fileAssociationsOverrideExt = (ext) => {
        let currentExts = ''; // Initialize.
        for (const [, exts] of Object.entries(extsByVSCodeLang))
            if (exts.includes(ext)) { currentExts = exts.join(','); break; } // prettier-ignore
        return '{' + ext + ',' + '×'.repeat(Math.max(1, currentExts.length - ext.length)) + '}';
    };
    fileAssociations = {
        ...fileAssociations,

        // Overrides; for special cases.
        // Note: order of precedence is tricky.
        // For details, see: <https://o5p.me/AcvdMc>.
        // Basically, the longest matching pattern wins.

        ['**/.env.*']: 'properties', // Suffix, not extension.
        ['**/CODEOWNERS']: 'ignore', // File has no extension.

        ['**/tsconfig.' + fileAssociationsOverrideExt('json')]: 'jsonc', // JSON w/comments.
        ['**/.vscode/*.' + fileAssociationsOverrideExt('json')]: 'jsonc', // JSON w/comments.

        ['**/src/cargo/_headers']: 'plaintext', // File has no extension.
        ['**/src/cargo/_redirects']: 'plaintext', // File has no extension.
        ['**/src/cargo/_routes.' + fileAssociationsOverrideExt('json')]: 'jsonc', // JSON w/comments.
    };

    /**
     * Base config.
     */
    const baseConfig = {
        /**
         * Editor options.
         */

        'editor.autoIndent': 'full',
        'editor.detectIndentation': false,
        'editor.tabSize': prettierConfig.tabWidth,
        'editor.insertSpaces': !prettierConfig.useTabs,

        'editor.wordWrap': 'off',
        'editor.wrappingIndent': 'indent',
        'editor.wordWrapColumn': prettierConfig.printWidth,

        /**
         * File and search options.
         */

        'files.eol': '\n',
        'files.encoding': 'utf8',

        'files.trimFinalNewlines': true,
        'files.insertFinalNewline': true,
        'files.trimTrailingWhitespace': true,

        'files.associations': fileAssociations,
        'files.exclude': {
            ...exclusions.asBoolProps(
                [...exclusions.localIgnores] //
                    .filter((ignore) => !['**/.#*/**'].includes(ignore)),
                { tailGreedy: false },
            ),
            ...exclusions.asBoolProps(
                [...exclusions.editorIgnores] //
                    .filter((ignore) => !['**/*.code-*/**'].includes(ignore)),
                { tailGreedy: false },
            ),
            ...exclusions.asBoolProps([...exclusions.toolingIgnores], { tailGreedy: false }),
            ...exclusions.asBoolProps([...exclusions.vcsIgnores], { tailGreedy: false }),
            ...exclusions.asBoolProps([...exclusions.osIgnores], { tailGreedy: false }),
        },
        'explorer.excludeGitIgnore': false, // No, only `files.exclude`.

        'search.useIgnoreFiles': true,
        'search.useGlobalIgnoreFiles': false,
        'search.useParentIgnoreFiles': false,
        'search.exclude': {
            // Inherits everything in `files.exclude`.
            // Plus everything in `../../../.gitignore`.
            // ... plus these additional search ignores.

            ...((await u.isPkgRepo('clevercanyon/skeleton'))
                ? {} // Only search these in `clevercanyon/skeleton`.
                : {
                      '/dev/.files': true,
                      ...exclusions.asBoolProps(
                          exclusions.asRootedRelativeGlobs(
                              projDir,
                              [
                                  ...exclusions.dotIgnores, //
                                  ...exclusions.configIgnores,
                              ],
                              { forceRelative: true },
                          ),
                          { tailGreedy: false },
                      ),
                      '/LICENSE.txt': true,
                  }),
            ...exclusions.asBoolProps([...exclusions.lockIgnores], { tailGreedy: false }),
        },

        /**
         * Comment anchor options.
         */
        'commentAnchors.tags.anchors': {
            '@todo': {
                'scope': 'workspace',
                'iconColor': '#fff0b5',
                'highlightColor': '#fff0b5',
                'styleMode': 'tag',
            },
            '@review': {
                'scope': 'workspace',
                'iconColor': '#8a826d',
                'highlightColor': '#8a826d',
                'styleMode': 'tag',
            },
            '@someday': {
                'scope': 'workspace',
                'iconColor': '#ead1dc',
                'highlightColor': '#ead1dc',
                'styleMode': 'tag',
            },
        },
        'commentAnchors.tags.matchCase': true,
        'commentAnchors.tags.separators': [' ', ': '],

        'commentAnchors.workspace.excludeFiles': exclusions.asBracedGlob(
            [
                ...exclusions.logIgnores, //
                ...exclusions.backupIgnores,
                ...exclusions.patchIgnores,
                ...exclusions.editorIgnores,
                ...exclusions.toolingIgnores,
                ...exclusions.pkgIgnores,
                ...exclusions.vcsIgnores,
                ...exclusions.osIgnores,
                ...exclusions.lockIgnores,
                ...exclusions.distIgnores,
            ],
            { dropExistingNegations: true },
        ),
        'commentAnchors.workspace.matchFiles': $path.dotGlobstarHead + '*.' + extensions.asBracedGlob([...extensions.commentAnchorsContent]),

        /**
         * ESLint options.
         */

        'eslint.enable': true,
        'eslint.format.enable': true,
        'eslint.lintTask.enable': false,

        'eslint.run': 'onType',
        'eslint.runtime': 'node',

        'eslint.codeActionsOnSave.mode': 'all',
        'eslint.experimental.useFlatConfig': true,

        'eslint.validate': [
            'mdx', //
            'markdown',
            'javascript',
            'javascriptreact',
            'typescript',
            'typescriptreact',
        ],
        'eslint.options': {
            'overrideConfigFile': 'eslint.config.mjs',
        },
        'javascript.validate.enable': true,
        'typescript.validate.enable': true,

        /**
         * Stylelint options.
         */

        'css.validate': true,
        'scss.validate': true,
        'less.validate': true,
        'stylelint.validate': [
            'scss', //
            'css',
        ],

        /**
         * Markdown options.
         */

        'markdown.styles': [],
        'markdown.preview.fontSize': 16,
        'markdown.preview.lineHeight': 1.5,
        'markdown.preview.typographer': true,
        'markdown.preview.fontFamily': 'Georama, ui-sans-serif, sans-serif',

        /**
         * Prettier options.
         */

        // By default, prettier ignores everything in `.gitignore` also,
        // which we don’t want, so explicitly listed here; {@see https://o5p.me/nfS7UF}.
        'prettier.ignorePath': '.prettierignore',

        /**
         * TOML formatting options.
         */
        'evenBetterToml.formatter.indentString': ' '.repeat(prettierConfig.tabWidth),

        /**
         * PHP options.
         */

        '[php]': {
            'editor.codeActionsOnSave': {
                'source.fixAll': true,
            },
            'editor.defaultFormatter': 'esbenp.prettier-vscode',
        },

        /**
         * Ruby options.
         */

        '[ruby]': {
            'editor.codeActionsOnSave': {
                'source.fixAll': true,
            },
            'editor.defaultFormatter': 'esbenp.prettier-vscode',
        },

        /**
         * SQL options.
         */

        '[sql]': {
            'editor.codeActionsOnSave': {
                'source.fixAll': true,
            },
            'editor.defaultFormatter': 'esbenp.prettier-vscode',
        },

        /**
         * INI options.
         */

        '[ini]': {
            'editor.codeActionsOnSave': {
                'source.fixAll': true,
            },
            'editor.defaultFormatter': 'esbenp.prettier-vscode',
        },

        /**
         * Properties options.
         */

        '[properties]': {
            'editor.codeActionsOnSave': {
                'source.fixAll': true,
            },
            'editor.defaultFormatter': 'esbenp.prettier-vscode',
        },

        /**
         * XML/HTML options.
         */

        '[xml]': {
            'editor.codeActionsOnSave': {
                'source.fixAll': true,
            },
            'editor.defaultFormatter': 'esbenp.prettier-vscode',
        },
        '[html]': {
            'editor.codeActionsOnSave': {
                'source.fixAll': true,
            },
            'editor.defaultFormatter': 'esbenp.prettier-vscode',
        },

        /**
         * Markdown options.
         */

        '[mdx]': {
            'editor.wordWrap': 'on',
            'editor.codeActionsOnSave': {
                'source.fixAll': true,
            },
            'editor.defaultFormatter': 'dbaeumer.vscode-eslint',
        },
        '[markdown]': {
            'editor.wordWrap': 'on',
            'editor.codeActionsOnSave': {
                'source.fixAll': true,
            },
            'editor.defaultFormatter': 'dbaeumer.vscode-eslint',
        },

        /**
         * CSS/SCSS/LESS options.
         */

        '[css]': {
            'editor.codeActionsOnSave': {
                'source.fixAll': true,
            },
            'editor.defaultFormatter': 'esbenp.prettier-vscode',
        },
        '[scss]': {
            'editor.codeActionsOnSave': {
                'source.fixAll': true,
            },
            'editor.defaultFormatter': 'esbenp.prettier-vscode',
        },
        '[less]': {
            'editor.codeActionsOnSave': {
                'source.fixAll': true,
            },
            'editor.defaultFormatter': 'esbenp.prettier-vscode',
        },

        /**
         * JS/TS/React options.
         */

        '[javascript]': {
            'editor.codeActionsOnSave': {
                'source.fixAll': true,
            },
            'editor.defaultFormatter': 'dbaeumer.vscode-eslint',
        },
        '[javascriptreact]': {
            'editor.codeActionsOnSave': {
                'source.fixAll': true,
            },
            'editor.defaultFormatter': 'dbaeumer.vscode-eslint',
        },
        '[typescript]': {
            'editor.codeActionsOnSave': {
                'source.fixAll': true,
            },
            'editor.defaultFormatter': 'dbaeumer.vscode-eslint',
        },
        '[typescriptreact]': {
            'editor.codeActionsOnSave': {
                'source.fixAll': true,
            },
            'editor.defaultFormatter': 'dbaeumer.vscode-eslint',
        },

        /**
         * JSON options.
         */

        '[json]': {
            'editor.codeActionsOnSave': {
                'source.fixAll': true,
            },
            'editor.defaultFormatter': 'esbenp.prettier-vscode',
        },
        '[jsonc]': {
            'editor.codeActionsOnSave': {
                'source.fixAll': true,
            },
            'editor.defaultFormatter': 'esbenp.prettier-vscode',
        },

        /**
         * TOML options.
         */

        '[toml]': {
            'editor.codeActionsOnSave': {
                'source.fixAll': true,
            },
            'editor.defaultFormatter': 'tamasfe.even-better-toml',
        },

        /**
         * YAML options.
         */

        '[yaml]': {
            'editor.codeActionsOnSave': {
                'source.fixAll': true,
            },
            'editor.defaultFormatter': 'esbenp.prettier-vscode',
        },

        /**
         * Shell options.
         */

        '[shellscript]': {
            'editor.codeActionsOnSave': {
                'source.fixAll': true,
            },
            'editor.defaultFormatter': 'esbenp.prettier-vscode',
        },

        /**
         * Docker options.
         */

        '[dockerfile]': {
            'editor.codeActionsOnSave': {
                'source.fixAll': true,
            },
            'editor.defaultFormatter': 'esbenp.prettier-vscode',
        },
    };

    /**
     * Composition.
     */
    return {
        ...baseConfig,
    };
};
