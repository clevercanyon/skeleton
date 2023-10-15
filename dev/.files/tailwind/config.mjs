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
@import 'https://fonts.googleapis.com/css2?family=Georama:ital,wght@0,100..900;1,100..900&display=swap';

@tailwind base;
@tailwind components;
@tailwind utilities;
@tailwind variants;
-------------------------------------------------------------------------------------------------------------------- */

import pluginForms from '@tailwindcss/forms';
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
        // We favor Tailwind themes, so we don’t typically use dark mode anyway.
        // By setting this to `class` it can only be enabled using the `dark` class.
        darkMode: 'class', // {@see https://tailwindcss.com/docs/dark-mode}.

        theme: {
            screens: {
                // Less than or equal to.
                'lte-phone': { max: '479px' },
                'lte-tablet': { max: '959px' },
                'lte-notebook': { max: '1279px' },
                'lte-laptop': { max: '1439px' },
                'lte-desktop': { max: '2559px' },

                // Greater than or equal to.
                'gte-phone': { min: '320px' },
                'gte-tablet': { min: '480px' },
                'gte-notebook': { min: '960px' },
                'gte-laptop': { min: '1280px' },
                'gte-desktop': { min: '1440px' },

                // Device-only specific breakpoints.
                'phone': { min: '320px', max: '479px' },
                'tablet': { min: '480px', max: '959px' },
                'notebook': { min: '960px', max: '1279px' },
                'laptop': { min: '1280px', max: '1439px' },
                'desktop': { min: '1440px', max: '2559px' },

                // `raw` to avoid these inadvertently becoming a max-width for containers.
                // Best practice: if something should adapt to widescreen, don’t use a container.
                'lte-widescreen': { raw: '(max-width: none)' },
                'gte-widescreen': { raw: '(min-width: 2560px)' },
                'widescreen': { raw: '(min-width: 2560px)' },
            },
            container: { center: true }, // No need for `mx-auto` on each container.

            extend: {
                typography: {
                    sm: { css: { 'code': { ...pluginTypographyStyles.sm.css[0]['kbd'] } } },
                    base: { css: { 'code': { ...pluginTypographyStyles.base.css[0]['kbd'] } } },
                    lg: { css: { 'code': { ...pluginTypographyStyles.lg.css[0]['kbd'] } } },
                    xl: { css: { 'code': { ...pluginTypographyStyles.xl.css[0]['kbd'] } } },
                    '2xl': { css: { 'code': { ...pluginTypographyStyles['2xl'].css[0]['kbd'] } } },

                    DEFAULT: {
                        css: {
                            'a': {
                                textDecoration: 'none',
                            },
                            'a:hover': {
                                textDecoration: 'underline',
                            },
                            'code::before': null, // Gets rid of '`' backtick.
                            'code::after': null, // Gets rid of '`' backtick.

                            'code': {
                                ...pluginTypographyStyles.base.css[0]['kbd'],
                                borderRadius: '0.188rem', // Equivalent to 3px.
                                boxShadow: '0 0 0 1px rgb(var(--tw-prose-code-shadows) / 10%)',
                            },
                        },
                    },
                },
            },
        },
        plugins: [
            pluginTypography({ className: 'prose' }), // Requires `prose` class.
            pluginForms({ strategy: 'class' }), // Requires form classes; e.g., `form-{class}`.
            pluginThemer(mergeThemesConfig({ themesConfig })), // Merges themes configuration.
        ],
        content: [
            path.resolve(projDir, './src') + '/**/*.' + extensions.asBracedGlob([...extensions.tailwindContent]),

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
    };
};
