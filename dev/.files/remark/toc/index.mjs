/**
 * Remark plugin.
 *
 * @note PLEASE DO NOT EDIT THIS FILE!
 * @note This entire file will be updated automatically.
 * @note Instead of editing here, please review <https://github.com/clevercanyon/skeleton>.
 */

import { valueToEstree } from 'estree-util-value-to-estree';
import { toJsxRuntime } from 'hast-util-to-jsx-runtime';
import { toHast } from 'mdast-util-to-hast';
import { toc as mdastTableOfContents } from 'mdast-util-toc';
import { Fragment, jsx, jsxs } from 'preact/jsx-runtime';
import pluginAnchorsPreactXHash from '../../../rehype/plugins/anchors/preact-x-hash.mjs';

/**
 * Generates a table of contents, when applicable, and exports it.
 */
export default () => {
    return (tree) => {
        const r = mdastTableOfContents(tree, { heading: 'Table of Contents', prefix: '~', tight: true });
        if (r.endIndex === undefined || r.endIndex === -1 || r.index === undefined || r.index === -1 || !r.map) return;

        const hast = toHast(r.map); // HTML abstract syntax tree.
        pluginAnchorsPreactXHash()(hast); // Converts anchors to `<x-hash>` tags.
        const tocAsPreactVNode = toJsxRuntime(hast, { Fragment, jsx, jsxs }); // Preact vNode.

        tree.children.splice(r.index - 1, 1); // Removes `Table of Contents` heading.
        // Exports a `TableOfContents` function component; i.e., using MDX estree nodes.
        tree.children.unshift({
            type: 'mdxjsEsm',
            value: '',
            data: {
                estree: {
                    type: 'Program',
                    sourceType: 'module',
                    body: [
                        {
                            type: 'ExportNamedDeclaration',
                            specifiers: [],
                            declaration: {
                                type: 'VariableDeclaration',
                                kind: 'const',
                                declarations: [
                                    {
                                        type: 'VariableDeclarator',
                                        id: { type: 'Identifier', name: 'TableOfContents' },
                                        init: {
                                            type: 'ArrowFunctionExpression',
                                            id: null,
                                            expression: false,
                                            generator: false,
                                            async: false,
                                            params: [],
                                            body: {
                                                type: 'BlockStatement',
                                                body: [
                                                    {
                                                        type: 'ReturnStatement',
                                                        argument: valueToEstree(tocAsPreactVNode),
                                                    },
                                                ],
                                            },
                                        },
                                    },
                                ],
                            },
                        },
                    ],
                },
            },
        });
    };
};
