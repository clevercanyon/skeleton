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
         * - Basic palette: {@see https://coolors.co/09090b-fafafa-ed5f3b-ffffff}.
         *
         * From these basic colors, we automatically derive additional colors for commonly-used sections, such as those
         * prefixed as `color-prose-*`, `color-header-*`, `color-sidebar-*`, `color-footer-*`. If you'd like to override
         * any basic color derivations, explicitly define the colors you wish to override.
         */
        const defaultBasicColors = {
            'color-bg': '#09090b',
            'color-text': '#fafafa',
            'color-link': '#ed5f3b',
            'color-heading': '#ffffff',
        };
        const basicColors = $obj.defaults({}, $obj.pick(theme.extend.colors, Object.keys(defaultBasicColors)), defaultBasicColors);
        const basicBGDark = '#ffffff' === $color.getReadable(basicColors['color-bg']); // Detects basic background color being dark.

        /**
         * Defines basic prose colors.
         *
         * These color derivations are based on the configured basic colors. The goal is to make prose slightly
         * different in some cases, and customizable, either during or after an initial implementation. We also point
         * Tailwind’s built-in prose color vars at these prose-specific color classes; {@see baseConfigThemes()}.
         */
        const defaultBasicProseColors = {
            'color-prose-body': basicColors['color-text'],
            'color-prose-links': basicColors['color-link'],

            'color-prose-headings': basicColors['color-heading'],
            'color-prose-lead': $color[basicBGDark ? 'lighten' : 'darken'](basicColors['color-text'], 0.1),
            'color-prose-bold': $color[basicBGDark ? 'lighten' : 'darken'](basicColors['color-text'], 0.1),

            'color-prose-counters': $color[basicBGDark ? 'darken' : 'lighten'](basicColors['color-text'], 0.35),
            'color-prose-bullets': $color[basicBGDark ? 'darken' : 'lighten'](basicColors['color-text'], 0.35),

            'color-prose-quotes': $color[basicBGDark ? 'darken' : 'lighten'](basicColors['color-text'], 0.25),
            'color-prose-quote-borders': $color[basicBGDark ? 'darken' : 'lighten'](basicColors['color-text'], 0.85),

            'color-prose-kbd': $color[basicBGDark ? 'lighten' : 'darken'](basicColors['color-text'], 0.1),
            // This is incorporated into an `rgb(x x x / x)` final color.
            'color-prose-kbd-shadows': $color.toRGBListNoAlpha(basicColors['color-text']),

            'color-prose-code': $color[basicBGDark ? 'lighten' : 'darken'](basicColors['color-text'], 0.1),
            // This is incorporated into an `rgb(x x x / x)` final color.
            'color-prose-code-shadows': $color.toRGBListNoAlpha(basicColors['color-text']),

            'color-prose-pre-bg': $color[basicBGDark ? 'lighten' : 'darken'](basicColors['color-bg'], 0.05),
            'color-prose-pre-code': $color[basicBGDark ? 'lighten' : 'darken'](basicColors['color-text'], 0.25),

            'color-prose-th-borders': $color[basicBGDark ? 'darken' : 'lighten'](basicColors['color-text'], 0.75),
            'color-prose-td-borders': $color[basicBGDark ? 'darken' : 'lighten'](basicColors['color-text'], 0.85),

            'color-prose-hr': $color[basicBGDark ? 'darken' : 'lighten'](basicColors['color-text'], 0.85),
            'color-prose-captions': $color[basicBGDark ? 'darken' : 'lighten'](basicColors['color-text'], 0.25),
        };

        /**
         * Defines basic section colors.
         *
         * These color derivations are based on the configured basic colors. The goal is to make these sections slightly
         * different in some cases, and customizable, either during or after an initial implementation. Therefore,
         * section-specific color classes should always be favored over general basic color classes.
         *
         * Using prose in these sections is not supported at this time. The best practice is to apply color classes
         * instead of relying on prose in these sections. That said, if you really must, then as long as you’ve not
         * drastically altered colors for these sections (i.e., they are still very close to configured basic colors),
         * then the appearance of prose should be ok. That’s the case in our default configuration of section colors.
         */
        const defaultBasicSectionColors = {
            'color-header': $color[basicBGDark ? 'darken' : 'lighten'](basicColors['color-bg'], 0.015),
            'color-header-text': $color[basicBGDark ? 'darken' : 'lighten'](basicColors['color-text'], 0.015),
            'color-header-link': $color[basicBGDark ? 'darken' : 'lighten'](basicColors['color-link'], 0.015),
            'color-header-heading': $color[basicBGDark ? 'darken' : 'lighten'](basicColors['color-heading'], 0.015),

            'color-sidebar': $color[basicBGDark ? 'darken' : 'lighten'](basicColors['color-bg'], 0.015),
            'color-sidebar-text': $color[basicBGDark ? 'darken' : 'lighten'](basicColors['color-text'], 0.015),
            'color-sidebar-link': $color[basicBGDark ? 'darken' : 'lighten'](basicColors['color-link'], 0.015),
            'color-sidebar-heading': $color[basicBGDark ? 'darken' : 'lighten'](basicColors['color-heading'], 0.015),

            'color-footer': $color[basicBGDark ? 'darken' : 'lighten'](basicColors['color-bg'], 0.015),
            'color-footer-text': $color[basicBGDark ? 'darken' : 'lighten'](basicColors['color-text'], 0.015),
            'color-footer-link': $color[basicBGDark ? 'darken' : 'lighten'](basicColors['color-link'], 0.015),
            'color-footer-heading': $color[basicBGDark ? 'darken' : 'lighten'](basicColors['color-heading'], 0.015),
        };

        /**
         * Defines brand colors.
         *
         * - Abstract palette: {@see https://coolors.co/ed5f3b-95290e-763828-facdc1-fca94f-eab308}.
         * - Semantic palette: {@see https://coolors.co/166534-991b1b-9b4e12-1e40af-e4e4e7-3f3f46-18181b-fef9c3}.
         *
         * These colors should all consider `color-bg`, because all of these colors should work well for objects that
         * lay on top of the basic background color. In some cases, you may need to stray from exact colors used in a
         * brand’s logo, as these are not for the brand’s logo, they are for the site. Having said that, `color-true` is
         * an exception, as it should always be a true (i.e., exact) primary logo color.
         *
         * Simply define a brand’s colors. From these, we automatically work out an appropriate readable foreground text
         * color (i.e., black or white, based on the color’s luminance) just like coolors.co does. Or, if you prefer,
         * you can choose to define any of the `*-text` suffixed variants explicitly.
         */
        const defaultBrandColors = {
            // Abstract colors.
            'color-true': '#ed5f3b',
            'color-primary': '#95290e',
            'color-secondary': '#763828',
            'color-accent': '#facdc1',
            'color-dazzle': '#fca94f',
            'color-flare': '#eab308',

            // Semantic colors.
            'color-success': '#166534',
            'color-danger': '#991b1b',
            'color-warning': '#9b4e12',
            'color-info': '#1e40af',
            'color-light': '#e4e4e7',
            'color-neutral': '#3f3f46',
            'color-dark': '#18181b',
            'color-hilite': '#fef9c3',
        };
        for (const [name, value] of Object.entries(defaultBrandColors)) {
            defaultBrandColors[name + '-text'] = $color.getReadable(value);
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
            colors: {}, // Populated during merge; see above.

            typography: {
                DEFAULT: {
                    css: {
                        // Points prose at themed color variables.

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

                        '--tw-prose-pre-bg': 'rgb(var(--colors-color-prose-pre-bg))',
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
