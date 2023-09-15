/**
 * Remark config file.
 *
 * Remark is not aware of this config file's location.
 *
 * @note PLEASE DO NOT EDIT THIS FILE!
 * @note This entire file will be updated automatically.
 * @note Instead of editing here, please review <https://github.com/clevercanyon/skeleton>.
 *
 * @see https://github.com/remarkjs/remark/tree/main/packages/remark-cli#example-config-files-json-yaml-js
 */

import pluginDirective from 'remark-directive';
import pluginFrontmatter from 'remark-frontmatter';
import pluginGFM from 'remark-gfm';
import remarkLint from 'remark-lint';
import pluginOembed from 'remark-oembed';
import presetLintRecommended from 'remark-preset-lint-recommended';
import presetPrettier from 'remark-preset-prettier';

/**
 * Defines Remark configuration.
 */
export default async () => {
	/**
	 * Composition.
	 */
	return {
		// {@see https://o5p.me/F9ILYY}.
		settings: {
			bullet: '-',
			bulletOrdered: '.',
			bulletOther: '*',
			closeAtx: false,
			emphasis: '_',
			fence: '`',
			fences: true,
			incrementListMarker: true,
			listItemIndent: 'mixed',
			quote: '"',
			resourceLink: false,
			rule: '-',
			ruleRepetition: 3,
			ruleSpaces: true,
			setext: false,
			strong: '*',
			tightDefinitions: false,
		},
		plugins: [
			remarkLint, //
			presetLintRecommended,
			presetPrettier,

			pluginGFM,
			pluginDirective,
			pluginFrontmatter,
			[pluginOembed, { syncWidget: true }],

			// Disable this rule, as GFM explicitly allows this.
			// Also, because the oEmbed plugin explicitly allows this.
			['remark-lint-no-literal-urls', false],
		],
	};
};
