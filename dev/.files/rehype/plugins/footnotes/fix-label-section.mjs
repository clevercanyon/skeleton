/**
 * Rehype plugin.
 *
 * @note PLEASE DO NOT EDIT THIS FILE!
 * @note This entire file will be updated automatically.
 * @note Instead of editing here, please review <https://github.com/clevercanyon/skeleton>.
 */

import { visit as unistVisit } from 'unist-util-visit';

/**
 * Modifies `#footnote-label` section at bottom, generated by `remark-gfm` plugin.
 */
export default () => {
    return (tree) => {
        unistVisit(tree, 'element', (node) => {
            if ('h2' === node.tagName && 'footnote-label' === node.properties.id) {
                node.properties.id = '~footnotes'; // Aligned with the rest of our configuration, which always uses a `~` prefix.
                node.properties.class = (node.properties.class || []).concat(node.properties.className || []).filter((c) => !['sr-only'].includes(c));
                delete node.properties.className; // Removes `className` in favor of `class`.
            }
            return node;
        });
    };
};
