/**
 * Tailwind themes config file.
 *
 * Tailwind is not aware of this config file's location. This configuration file serves as a base for theme
 * configurations passed into the `tailwindcss-themer` plugin, which implements themes for Tailwind CSS.
 *
 * @note PLEASE DO NOT EDIT THIS FILE!
 * @note This entire file will be updated automatically.
 * @note Instead of editing here, please review <https://github.com/clevercanyon/skeleton>.
 */
/*
-----------------------------------------------------------------------------------------------------------------------
Example `index.scss` starter file contents:
-----------------------------------------------------------------------------------------------------------------------
@use '../dev/.files/tailwind/layers';
-------------------------------------------------------------------------------------------------------------------- */

import { $color, $is, $obj } from '../../../node_modules/@clevercanyon/utilities/dist/index.js';

/**
 * Merges Tailwind themes configuration.
 *
 * Jiti, which is used by Tailwind to load ESM config files, doesn’t support top-level await. Thus, we cannot use async
 * functionality here. Consider `make-synchronous` (already in dev-deps) if necessary. {@see https://o5p.me/1odhxy}.
 */
export default /* not async compatible */ ({ themesConfig } = {}) => {
    /**
     * Gets themes.
     */
    let themes; // Initialize.

    if ($is.function(themesConfig)) {
        themes = themesConfig();
    }
    themes = Object(themes || {}); // Ensures object type.
    themes.defaultTheme = Object(themes.defaultTheme || {});

    themes.themes = $is.array(themes.themes) ? themes.themes : [];
    themes.themes.map((theme) => Object(theme || {}));

    /**
     * Sets color defaults, for each theme, using basic colors.
     */
    [themes.defaultTheme, ...themes.themes].forEach((theme) => {
        /**
         * Ensures objects.
         */
        theme.extend = Object(theme.extend || {});
        theme.extend.colors = Object(theme.extend.colors || {});

        /**
         * Defines basic colors.
         *
         * - Basic palette: {@see https://coolors.co/09090b-f0f0f0-80aff9-ffffff}.
         *
         * From these basic colors we derive additional colors for commonly-used sections automatically, such as those
         * prefixed as `color-prose-*`, `color-header-*`, `color-sidebar-*`, `color-footer-*`. If you'd like to override
         * any basic color derivations, explicitly define the colors you wish to override.
         *
         * 💡 Tip: Fast track. Just change `color-link` to match your brand colors. The other colors use common defaults
         * that typically work well for most brands. Tune the rest in later.
         */
        const defaultBasicColors = {
            'color': '#09090b', // Background color.
            'color-fg': '#f0f0f0', // Foreground color.
            'color-link': '#80aff9', // Link/anchor color.
            'color-heading': '#ffffff', // Heading color.
        };
        const basicColors = $obj.defaults({}, $obj.pick(theme.extend.colors, Object.keys(defaultBasicColors)), defaultBasicColors);
        const basicBGIsDark = $color.isDark(basicColors['color']); // Detects basic background color being dark.

        /**
         * Defines basic prose colors.
         *
         * These color derivations are based on the configured basic colors. The goal is to make prose customizable,
         * either during or after an initial implementation. To make this work, we point Tailwind’s built-in prose color
         * variables at these prose-specific color classes; {@see baseConfigThemes()}.
         */
        const defaultBasicProseColors = {
            'color-prose-body': basicColors['color-fg'],
            'color-prose-links': basicColors['color-link'],

            'color-prose-headings': basicColors['color-heading'],
            'color-prose-lead': $color[basicBGIsDark ? 'lighten' : 'darken'](basicColors['color-fg'], 0.1),
            'color-prose-bold': $color[basicBGIsDark ? 'lighten' : 'darken'](basicColors['color-fg'], 0.1),

            'color-prose-counters': $color[basicBGIsDark ? 'darken' : 'lighten'](basicColors['color-fg'], 0.35),
            'color-prose-bullets': $color[basicBGIsDark ? 'darken' : 'lighten'](basicColors['color-fg'], 0.35),

            'color-prose-quotes': $color[basicBGIsDark ? 'darken' : 'lighten'](basicColors['color-fg'], 0.25),
            'color-prose-quote-borders': $color[basicBGIsDark ? 'darken' : 'lighten'](basicColors['color-fg'], 0.85),

            'color-prose-kbd': $color[basicBGIsDark ? 'lighten' : 'darken'](basicColors['color-fg'], 0.1),
            // This is incorporated into an `rgb(x x x / x)` final color.
            'color-prose-kbd-shadows': $color.toRGBListNoAlpha(basicColors['color-fg']),

            'color-prose-code': $color[basicBGIsDark ? 'lighten' : 'darken'](basicColors['color-fg'], 0.1),
            // This is incorporated into an `rgb(x x x / x)` final color.
            'color-prose-code-shadows': $color.toRGBListNoAlpha(basicColors['color-fg']),

            'color-prose-pre': $color[basicBGIsDark ? 'lighten' : 'darken'](basicColors['color'], 0.05),
            'color-prose-pre-code': $color[basicBGIsDark ? 'lighten' : 'darken'](basicColors['color-fg'], 0.25),

            'color-prose-th-borders': $color[basicBGIsDark ? 'darken' : 'lighten'](basicColors['color-fg'], 0.75),
            'color-prose-td-borders': $color[basicBGIsDark ? 'darken' : 'lighten'](basicColors['color-fg'], 0.85),

            'color-prose-hr': $color[basicBGIsDark ? 'darken' : 'lighten'](basicColors['color-fg'], 0.85),
            'color-prose-captions': $color[basicBGIsDark ? 'darken' : 'lighten'](basicColors['color-fg'], 0.25),
        };

        /**
         * Defines basic section colors.
         *
         * These color derivations are based on the configured basic colors. The goal is to make these sections
         * customizable, either during or after an initial implementation. Therefore, section-specific color classes
         * should always be used when building these out. If additional basic colors are needed, please add new colors
         * to accomodate vs. using any other basic color classes that are not section-specific.
         *
         * Also, we do not recommend using prose in these sections. The best practice is to apply color classes instead
         * of relying on prose in any of these sections. Why? Prose is configured using basic colors that are not
         * section-specific. Therefore, using prose would be the same as using other basic color classes.
         *
         * It’s perfectly ok to use brand colors in these sections. Just don’t use 'basic' color classes that are not
         * section-specific. We want the ability to change the basic appearance of these sections later.
         */
        const defaultBasicSectionColors = {
            'color-header': $color[basicBGIsDark ? 'darken' : 'lighten'](basicColors['color'], 0.015),
            'color-header-fg': $color[basicBGIsDark ? 'darken' : 'lighten'](basicColors['color-fg'], 0.015),
            'color-header-link': $color[basicBGIsDark ? 'darken' : 'lighten'](basicColors['color-link'], 0.015),
            'color-header-heading': $color[basicBGIsDark ? 'darken' : 'lighten'](basicColors['color-heading'], 0.015),

            'color-sidebar': $color[basicBGIsDark ? 'darken' : 'lighten'](basicColors['color'], 0.015),
            'color-sidebar-fg': $color[basicBGIsDark ? 'darken' : 'lighten'](basicColors['color-fg'], 0.015),
            'color-sidebar-link': $color[basicBGIsDark ? 'darken' : 'lighten'](basicColors['color-link'], 0.015),
            'color-sidebar-heading': $color[basicBGIsDark ? 'darken' : 'lighten'](basicColors['color-heading'], 0.015),

            'color-footer': $color[basicBGIsDark ? 'darken' : 'lighten'](basicColors['color'], 0.015),
            'color-footer-fg': $color[basicBGIsDark ? 'darken' : 'lighten'](basicColors['color-fg'], 0.015),
            'color-footer-link': $color[basicBGIsDark ? 'darken' : 'lighten'](basicColors['color-link'], 0.015),
            'color-footer-heading': $color[basicBGIsDark ? 'darken' : 'lighten'](basicColors['color-heading'], 0.015),
        };

        /**
         * Defines brand colors.
         *
         * - Abstract palette: {@see https://coolors.co/595959-2e489e-3e4660-615c49-745a2f-0f58b8-80aff9-ffe0b8}.
         * - Semantic palette: {@see https://coolors.co/1c5f35-8a2828-865027-2e489e-e4e4e7-3f3f46-18181b-fef9c3}.
         *
         * These colors should all consider the basic background `color`, because all of these colors should work well
         * for objects that lay on top of the background color. In some cases, you may need to stray from exact colors
         * used in a brand’s logo, as these are not for the brand’s logo, they are for the site. That said, `color-true`
         * is an exception. It should always be a true exact-match to a brand’s primary logo color.
         *
         * From these brand colors we automatically work out an appropriate readable foreground text color; i.e., black
         * or white, based on the color’s luminance. Or, if you prefer, you can choose to define any of the `*-fg`
         * suffixed variants explicitly, effectively overriding luminance-based defaults.
         *
         * The easiest way to define brand colors is to test them being used to create a prominent component, such as a
         * button; e.g., `<Button color="primary|secondary|accent|dazzle|flare|success|info|...">`.
         *
         * 💡 Tip: Fast track. Just change `color-true` & `color-primary` to match your brand colors. The other colors
         * use common defaults that typically work well for most brands. Tune the rest in later.
         */
        const defaultBrandColors = {
            // Abstract colors.
            'color-true': '#595959', // True exact-match to a brand’s primary logo color.
            'color-primary': '#2e489e', // Primary component color. Typically a shade of `color-true`.
            'color-secondary': '#3e4660', // Secondary component color. Typically less saturated than primary.
            'color-tertiary': '#615c49', // Tertiary component color. Typically less saturated than primary.
            'color-accent': '#745a2f', // An accented component color. Typically accentuated conservatively.
            'color-feature': '#0f58b8', // An accented component color. Typically more accentuated; i.e., less subtle.
            'color-dazzle': '#80aff9', // An accented component color. Typically much more accentuated; i.e., not subtle.
            'color-amaze': '#ffe0b8', // An accented component color. Typically much more accentuated; i.e., not subtle.

            // Semantic colors.
            'color-success': '#1c5f35', // Typically a shade of green for various components.
            'color-danger': '#8a2828', // Typically a shade of red for various components.
            'color-warning': '#865027', // Typically a shade of orange for various components.
            'color-info': '#2e489e', // Typically a shade of blue for various components.
            'color-light': '#e4e4e7', // Typically a light shade of gray for various components.
            'color-neutral': '#3f3f46', // Typically between light & dark for various components.
            'color-dark': '#18181b', // Typically a dark shade of gray for various components.
            'color-hilite': '#fef9c3', // Typically a shade of yellow for various components.
        };
        for (const [name, value] of Object.entries(defaultBrandColors)) {
            defaultBrandColors[name + '-fg'] = $color.getReadable(value);
        }

        /**
         * Composition.
         */
        theme.extend.colors = {
            ...defaultBasicColors,
            ...defaultBasicProseColors,
            ...defaultBasicSectionColors,
            ...defaultBrandColors,

            ...themes.defaultTheme.extend.colors,
            ...theme.extend.colors,
        };
    });

    /**
     * Composition.
     */
    return $obj.mergeDeep({}, baseConfigThemes(), themes);
};

/**
 * Defines Tailwind themes configuration.
 *
 * Jiti, which is used by Tailwind to load ESM config files, doesn’t support top-level await. Thus, we cannot use async
 * functionality here. Consider `make-synchronous` (already in dev-deps) if necessary. {@see https://o5p.me/1odhxy}.
 */
const baseConfigThemes = /* not async compatible */ () => {
    /**
     * Configures default theme.
     */
    const defaultTheme = {
        extend: {
            /**
             * Defines font families.
             *
             * If font families are customized in ways that introduce new Google fonts, then those new Google fonts must
             * be declared as an SCSS map in order to configure our Tailwind layers. The variable is `$google-fonts`.
             * Add the variale to your `./index.scss` file before `@use '../dev/.files/tailwind/layers';`.
             *
             *     $google-fonts: ( 'Georama': 'ital,wght@0,100..900;1,100..900' );
             */
            fontFamily: {
                sans: [
                    'Georama', //
                    'ui-sans-serif',
                    'sans-serif',
                ],
                serif: [
                    'Palatino', //
                    '"Palatino Linotype"',
                    'ui-serif',
                    'serif',
                ],
                mono: [
                    '"Operator Mono"', //
                    'ui-monospace',
                    'monospace',
                ],
            },

            /**
             * Points prose at themed color variables.
             *
             * These colors are based on the configured basic colors. The goal is to make prose customizable, either
             * during or after an initial implementation. To make this work, we point Tailwind’s built-in prose color
             * variables at each of our prose-specific color class variables. See default export in this file.
             */
            typography: {
                DEFAULT: {
                    css: {
                        '--tw-prose-body': 'rgb(var(--colors-color-prose-body))',
                        '--tw-prose-links': 'rgb(var(--colors-color-prose-links))',

                        '--tw-prose-headings': 'rgb(var(--colors-color-prose-headings))',
                        '--tw-prose-lead': 'rgb(var(--colors-color-prose-lead))',
                        '--tw-prose-bold': 'rgb(var(--colors-color-prose-bold))',

                        '--tw-prose-counters': 'rgb(var(--colors-color-prose-counters))',
                        '--tw-prose-bullets': 'rgb(var(--colors-color-prose-bullets))',

                        '--tw-prose-quotes': 'rgb(var(--colors-color-prose-quotes))',
                        '--tw-prose-quote-borders': 'rgb(var(--colors-color-prose-quote-borders))',

                        '--tw-prose-kbd': 'rgb(var(--colors-color-prose-kbd))',
                        '--tw-prose-kbd-shadows': 'var(--colors-color-prose-kbd-shadows)',

                        '--tw-prose-code': 'rgb(var(--colors-color-prose-code))',
                        '--tw-prose-code-shadows': 'var(--colors-color-prose-code-shadows)',

                        '--tw-prose-pre-bg': 'rgb(var(--colors-color-prose-pre))',
                        '--tw-prose-pre-code': 'rgb(var(--colors-color-prose-pre-code))',

                        '--tw-prose-th-borders': 'rgb(var(--colors-color-prose-th-borders))',
                        '--tw-prose-td-borders': 'rgb(var(--colors-color-prose-td-borders))',

                        '--tw-prose-hr': 'rgb(var(--colors-color-prose-hr))',
                        '--tw-prose-captions': 'rgb(var(--colors-color-prose-captions))',

                        // Not using inverted colors; i.e., we prefer themes.
                        // The use of `null` effectively deletes these unused keys.

                        '--tw-prose-invert-body': null,
                        '--tw-prose-invert-links': null,

                        '--tw-prose-invert-headings': null,
                        '--tw-prose-invert-lead': null,
                        '--tw-prose-invert-bold': null,

                        '--tw-prose-invert-counters': null,
                        '--tw-prose-invert-bullets': null,

                        '--tw-prose-invert-quotes': null,
                        '--tw-prose-invert-quote-borders': null,

                        '--tw-prose-invert-kbd': null,
                        '--tw-prose-invert-kbd-shadows': null,

                        '--tw-prose-invert-code': null,
                        '--tw-prose-invert-code-shadows': null,

                        '--tw-prose-invert-pre-bg': null,
                        '--tw-prose-invert-pre-code': null,

                        '--tw-prose-invert-th-borders': null,
                        '--tw-prose-invert-td-borders': null,

                        '--tw-prose-invert-hr': null,
                        '--tw-prose-invert-captions': null,
                    },
                },
            },
        },
    };

    /**
     * Configures other named themes.
     *
     * Named themes extend the default theme, so anything configured here only needs to override defaults. Then, to
     * enable a named theme, simply add `<html class="{named-theme}">` to your HTML markup.
     *
     * The best practice is to end each theme’s name with a `-theme` suffix. If a named theme class is not present in
     * the HTML markup, then the default theme will be applied automatically.
     *
     * Don’t add named themes unnecessarily. A default theme will typically do fine. The more themes you add, the larger
     * your bundle size becomes. Also, don’t name a theme `dark`; {@see https://o5p.me/jLROv0}.
     *
     * Powered by {@see https://www.npmjs.com/package/tailwindcss-themer}.
     */
    const themes = []; // None required at this time.

    /**
     * Composition.
     */
    return { defaultTheme, themes };
};
