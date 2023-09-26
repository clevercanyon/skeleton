/**
 * MDX config file.
 *
 * MDX is not aware of this config file's location.
 *
 * @note PLEASE DO NOT EDIT THIS FILE!
 * @note This entire file will be updated automatically.
 * @note Instead of editing here, please review <https://github.com/clevercanyon/skeleton>.
 *
 * @see https://mdxjs.com/packages/mdx/#api
 */

import extensions from '../bin/includes/extensions.mjs';

/**
 * Defines MDX configuration.
 */
export default async () => {
    /**
     * Composition.
     */
    return {
        jsxImportSource: 'preact',

        mdExtensions: [...extensions.vsc.markdown],
        mdxExtensions: [...extensions.vsc.mdx],

        remarkPlugins: [
            (await import('remark-frontmatter')).default, // YAML properties.
            (await import('remark-gfm')).default, // GitHub-flavored markdown syntax.
            (await import('remark-smartypants')).default, // (em dash) `--` to `—`, quotes, etc.
            [(await import('remark-oembed')).default, { syncWidget: true, jsx: true }], // oEmbeds for markdown.
            (await import('remark-mermaidjs')).default, // Charting and diagramming; {@see https://o5p.me/5z7Yrt}.
            (await import('remark-directive')).default, // Custom directives; {@see https://o5p.me/0fakce}.
        ],
        rehypePlugins: [(await import('@microflash/rehype-starry-night')).default], // Syntax highlighting.
    };
};
