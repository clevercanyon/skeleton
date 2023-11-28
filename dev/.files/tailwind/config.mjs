/**
 * Tailwind CSS config file.
 *
 * Tailwind is not aware of this config file's location.
 *
 * @note PLEASE DO NOT EDIT THIS FILE!
 * @note This entire file will be updated automatically.
 * @note Instead of editing here, please review <https://github.com/clevercanyon/skeleton>.
 *
 * @micromatch Tailwind uses micromatch with default options; i.e., `{ dot: false }`.
 *
 * @see https://tailwindcss.com/docs/configuration
 */
/*
-----------------------------------------------------------------------------------------------------------------------
Example `index.scss` starter file contents:
-----------------------------------------------------------------------------------------------------------------------
@use '../dev/.files/tailwind/layers';
-------------------------------------------------------------------------------------------------------------------- */

import pluginTypography from '@tailwindcss/typography';
import pluginTypographyStyles from '@tailwindcss/typography/src/styles.js';
import fs from 'node:fs';
import path from 'node:path';
import pluginThemer from 'tailwindcss-themer';
import exclusions from '../bin/includes/exclusions.mjs';
import extensions from '../bin/includes/extensions.mjs';
import mergeThemesConfig from './themes.mjs';

// `__dirname` already exists when loaded by Tailwind via Jiti / commonjs.
// eslint-disable-next-line no-undef -- `__dirname` is not actually missing.
const projDir = path.resolve(__dirname, '../../..');

/**
 * Defines Tailwind configuration.
 *
 * Jiti, which is used by Tailwind to load ESM config files, doesn’t support top-level await. Thus, we cannot use async
 * functionality here. Consider `make-synchronous` (already in dev-deps) if necessary. {@see https://o5p.me/1odhxy}.
 */
export default /* not async compatible */ ({ themesConfig } = {}) => {
    /**
     * Composition.
     */
    return {
        // We favor Tailwind themes, so we don’t typically use dark mode.
        // By setting this to `class` it can only be enabled using the `dark` class.
        darkMode: 'class', // {@see https://tailwindcss.com/docs/dark-mode}.
        // Use of Tailwind’s baked-in `dark` mode is not supported by our implementation.
        // Instead, configure a `defaultTheme` as dark, or add a `dark-theme` to `themes: []`.

        theme: {
            screens: {
                // Less than or equal to, in descending specificity order.
                // The order matters, because it affects specificity.
                'lte-widescreen': { raw: '(max-width: none)' },
                'lte-desktop': { raw: '(max-width: 2559px)' },
                'lte-laptop': { raw: '(max-width: 1439px)' },
                'lte-notebook': { raw: '(max-width: 1279px)' },
                'lte-tablet': { raw: '(max-width: 959px)' },
                'lte-phone': { raw: '(max-width: 479px)' },

                // Greater than or equal to, in ascending specificity order.
                // The order matters, because it affects specificity.
                'gte-phone': { raw: '(min-width: 320px)' },
                'gte-tablet': { raw: '(min-width: 480px)' },
                'gte-notebook': { raw: '(min-width: 960px)' },
                'gte-laptop': { raw: '(min-width: 1280px)' },
                'gte-desktop': { raw: '(min-width: 1440px)' },
                'gte-widescreen': { raw: '(min-width: 2560px)' },

                // Device-specific min/max breakpoints, in any order.
                // Order doesn’t really matter due to min/max specificity.
                'phone': { raw: '(min-width: 320px) and (max-width: 479px)' },
                'tablet': { raw: '(min-width: 480px) and (max-width: 959px)' },
                'notebook': { min: '960px', max: '1279px' }, // Container max-width: 960px.
                'laptop': { min: '1280px', max: '1439px' }, // Container max-width: 1280px.
                'desktop': { min: '1440px', max: '2559px' }, // Container max-width: 1440px.
                'widescreen': { raw: '(min-width: 2560px)' },

                // Note: We use `raw` to avoid smaller breakpoints becoming a max-width for containers.
                // We also use `raw` to avoid widescreen inadvertently becoming a max-width for containers.
                // If something should adapt to widescreen, the best practice is to simply not use a container.
            },
            container: { center: true }, // No need for `mx-auto` on each container.

            extend: {
                // We have to declare screen sizes explicitly for `min/max` widths.
                // The reason is because our `screens` configuration uses complex values.
                // For further details, {@see https://o5p.me/oLXcju}.
                minWidth: {
                    'phone': '320px',
                    'tablet': '480px',
                    'notebook': '960px',
                    'laptop': '1280px',
                    'desktop': '1440px',
                    'widescreen': 'none',

                    '1/4': '25%',
                    '1/2': '50%',
                    '3/4': '75%',
                    '1/3': '33.333%',
                    '2/3': '66.667%',
                },
                maxWidth: {
                    'phone': '320px',
                    'tablet': '480px',
                    'notebook': '960px',
                    'laptop': '1280px',
                    'desktop': '1440px',
                    'widescreen': 'none',

                    '1/4': '25%',
                    '1/2': '50%',
                    '3/4': '75%',
                    '1/3': '33.333%',
                    '2/3': '66.667%',
                },
                // Prose styles.
                typography: {
                    DEFAULT: {
                        css: {
                            maxWidth: null, // Ditching.

                            // Link styles.
                            'a': null, // Redefined as `a, .link`.
                            'a code': null, // Redefined as `a code, .link code`.
                            'a strong': null, // Redefined as `a strong, .link strong`.

                            'a, .link': {
                                ...pluginTypographyStyles.DEFAULT.css[0]['a'],
                                textDecoration: 'none',
                                cursor: 'pointer',
                            },
                            'a:hover, .link:hover': {
                                textDecoration: 'underline',
                            },
                            'a code, .link code': {
                                ...pluginTypographyStyles.DEFAULT.css[0]['a code'],
                            },
                            'a strong, .link strong': {
                                ...pluginTypographyStyles.DEFAULT.css[0]['a strong'],
                            },

                            // Auto-linked headings with `~`-prefixed IDs.
                            '[id^=\\~]': {
                                position: 'relative',
                            },
                            '[id^=\\~] > x-hash:first-child': {
                                opacity: '0',
                                left: '-1em',
                                width: '1em',
                                textAlign: 'left',
                                position: 'absolute',
                            },
                            '[id^=\\~]:hover > x-hash:first-child': {
                                opacity: '1',
                            },

                            // Horizontal line styles.
                            'hr': {
                                marginTop: '1.5em',
                                marginBottom: '1.5em',
                            },

                            // Pre styles.
                            'pre': {
                                border: '1px solid rgb(var(--colors-color-prose-pre-borders))',
                                boxShadow: 'inset 0 0 2px 2px rgb(var(--colors-color-prose-pre-shadows))',
                            },

                            // Code styles.
                            'code::before': null,
                            'code::after': null,
                            'code:not(:where(pre code))': {
                                // fontSize: em(14, 16),
                                // borderRadius: rem(5),
                                // paddingTop: em(3, 16),
                                // paddingRight: em(6, 16),
                                // paddingBottom: em(3, 16),
                                // paddingLeft: em(6, 16),
                                // All included in base `<kbd>` styles.
                                ...pluginTypographyStyles.base.css[0]['kbd'],
                                borderRadius: '0.188rem', // Equivalent to 3px.
                                boxShadow: '0 0 0 2px rgb(var(--tw-prose-code-shadows) / 12%)',
                            },

                            // Key styles.
                            'kbd': {
                                boxShadow:
                                    '0 1px 0 2px rgb(var(--tw-prose-kbd-shadows) / 20%),' + //
                                    ' 0 1px 10px 0 rgb(var(--tw-prose-kbd-shadows) / 20%)',
                            },

                            // Mark styles.
                            'mark': {
                                // fontSize: em(14, 16),
                                // borderRadius: rem(5),
                                // paddingTop: em(3, 16),
                                // paddingRight: em(6, 16),
                                // paddingBottom: em(3, 16),
                                // paddingLeft: em(6, 16),
                                // All included in base `<kbd>` styles.
                                ...pluginTypographyStyles.base.css[0]['kbd'],
                            },
                            'mark, mark *': {
                                fontSize: '.944444em',
                                color: 'rgb(var(--colors-color-hilite-fg))',
                                backgroundColor: 'rgb(var(--colors-color-hilite))',
                            }, // Supports nested `<a>`, `<code>`, `<kdb>`, `*`.
                            'mark *': { border: '0', padding: '0', boxShadow: 'none' },
                            'mark a, mark .link': { opacity: '.75', textDecoration: 'underline' },
                            'mark a:hover, mark .link:hover': { opacity: '1' }, // Opaque on hover.

                            // Task lists produced by remark GFM plugin.
                            '.contains-task-list, .task-list-item': {
                                paddingLeft: '.375em',
                                listStyleType: 'none',
                            },
                            '.contains-task-list .contains-task-list': {
                                margin: '0',
                                paddingLeft: '1.5em',
                            },
                            '.task-list-item::marker': {
                                content: "''",
                            },
                            '.task-list-item > input[type=checkbox]': {
                                appearance: 'none',
                                position: 'relative',
                                display: 'inline-block',

                                width: '1em',
                                height: '1em',
                                margin: '0 .5em 0 0',
                                verticalAlign: 'middle',

                                background: 'rgb(var(--colors-color-neutral))',
                                border: '1px solid rgb(var(--colors-color-neutral-fg), .25)',
                                borderRadius: '.15em',
                            },
                            '.task-list-item > input[type=checkbox]:checked::before': {
                                content: "'\\2713'",

                                fontSize: '1em',
                                lineHeight: '1em',
                                color: 'rgb(var(--colors-color-neutral-fg))',

                                top: '-.05em',
                                left: '.1em',
                                position: 'absolute',
                            },

                            // Footnotes produced by remark GFM plugin.
                            '.footnotes': {
                                borderTop: '1px solid rgb(var(--colors-color-prose-hr))',
                                marginTop: '4em',
                                fontSize: '0.875rem',
                                lineHeight: '1.25rem',
                            },
                            '.footnotes > h2': {
                                marginTop: '1em',
                            },
                        },
                    },
                },
                keyframes: {
                    'fade-in': {
                        from: { opacity: 0 },
                        to: { opacity: 1 },
                    },
                    'fade-out': {
                        from: { opacity: 1 },
                        to: { opacity: 0 },
                    },
                },
                animation: {
                    'fade-in': 'fade-in 150ms linear',
                    'fade-out': 'fade-out 150ms linear',
                },
            },
        },
        plugins: [
            pluginTypography({ className: 'p' }), // In our implementation, `p` = `prose`, `_` = `not-prose` = `not-basic`.
            // The `_` = `not-prose` logic is handled by our PostCSS configuration, which includes a custom plugin.

            // This plugin is what powers all of our theme configurations; {@see https://www.npmjs.com/package/tailwindcss-themer}.
            pluginThemer(mergeThemesConfig({ themesConfig })), // Our own theme system is also called upon here to configure Tailwind themes.
        ],
        content: [
            path.resolve(projDir, './{src,dist}') + '/**/*.' + extensions.asBracedGlob([...extensions.tailwindContent]),

            // If this package is using `@clevercanyon/utilities` we can also scan preact files.
            ...(fs.existsSync(path.resolve(projDir, './node_modules/@clevercanyon/utilities/dist/preact'))
                ? [path.resolve(projDir, './node_modules/@clevercanyon/utilities/dist/preact') + '/**/*.' + extensions.asBracedGlob([...extensions.tailwindContent])]
                : []),

            // Exclusions using negated glob patterns, which should simply be a reflection of `./.npmignore`.
            // However, that’s tricky because Tailwind doesn't provide an explicit negation setting, so we have to use `!`.
            // It’s also tricky because we *do* need to find content inside `node_modules/@clevercanyon/utilities/dist/preact`.
            // Therefore, instead of using `./.npmignore`, we come as close as we can, with just a few exceptions.

            ...exclusions.asNegatedGlobs(
                [
                    ...new Set([
                        ...exclusions.localIgnores,
                        ...exclusions.logIgnores,
                        ...exclusions.backupIgnores,
                        ...exclusions.patchIgnores,
                        ...exclusions.editorIgnores,
                        ...exclusions.toolingIgnores,

                        ...exclusions.pkgIgnores //
                            .filter((ignore) => ignore !== '**/node_modules/**'),
                        '**/src/**/node_modules/**', // More specific.

                        ...exclusions.vcsIgnores,
                        ...exclusions.osIgnores,
                        ...exclusions.dotIgnores,
                        ...exclusions.dtsIgnores,
                        ...exclusions.configIgnores,
                        ...exclusions.lockIgnores,
                        ...exclusions.devIgnores,

                        ...exclusions.distIgnores //
                            .filter((ignore) => ignore !== '**/dist/**'),
                        '**/src/**/dist/**', // More specific.

                        ...exclusions.sandboxIgnores,
                        ...exclusions.exampleIgnores,
                        ...exclusions.docIgnores,
                        ...exclusions.testIgnores,
                        ...exclusions.specIgnores,
                        ...exclusions.benchIgnores,
                    ]),
                ],
                { dropExistingNegations: true },
            ),
        ],
        blocklist: ['!p'], // This `!important` `p` = `prose` gets picked up from `./dist` somewhere.
    };
};
