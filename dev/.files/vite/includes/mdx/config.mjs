/**
 * MDX config file.
 *
 * MDX is not aware of this config file's location.
 *
 * @note PLEASE DO NOT EDIT THIS FILE!
 * @note This entire file will be updated automatically.
 * @note Instead of editing here, please review <https://github.com/clevercanyon/skeleton>.
 *
 * @see https://www.npmjs.com/package/@mdx-js/rollup
 */

import exclusions from '../../../bin/includes/exclusions.mjs';
import extensions from '../../../bin/includes/extensions.mjs';

/**
 * Configures MDX for Vite.
 *
 * @param   props Props from vite config file driver.
 *
 * @returns       MDX configuration.
 */
export default async (/* {} */) => {
	return (await import('@mdx-js/rollup')).default({
		jsxImportSource: 'preact',

		mdExtensions: [...extensions.md],
		mdxExtensions: [...extensions.mdx],

		exclude: [
			...exclusions.vcsFilesDirs, //
			...exclusions.packageDirs,
			...exclusions.distDirs,
			...exclusions.devDirs,
			...exclusions.docDirs,
			...exclusions.dotFilesDirs,
			...exclusions.dotConfigFilesDirs,
		],
		include: [
			'**/*.' +
				extensions.asGlob([
					...extensions.md, // Single default export only.
					...extensions.mdx, // Default + potentially other exports.
				]),
		],
		remarkPlugins: [
			(await import('remark-gfm')).default, //
			(await import('remark-directive')).default,
			(await import('remark-frontmatter')).default,
			[(await import('remark-oembed')).default, { syncWidget: true, jsx: true }],
		],
	});
};
