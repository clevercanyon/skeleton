/**
 * Extensions.
 *
 * @note PLEASE DO NOT EDIT THIS FILE!
 * @note This entire file will be updated automatically.
 * @note Instead of editing here, please review <https://github.com/clevercanyon/skeleton>.
 */

import { $obj, $path } from '../../../../node_modules/@clevercanyon/utilities/dist/index.js';

/**
 * Adds leading dot to extensions.
 *
 * @param   exts Array of extensions.
 *
 * @returns      Array of extensions (with dot).
 */
const dot = (exts) => noDot(exts).map((ext) => '.' + ext);

/**
 * Strips leading dot from extensions.
 *
 * @param   exts Array of extensions.
 *
 * @returns      Array of extensions (not dot).
 */
const noDot = (exts) => [...new Set(exts)].map((ext) => ext.replace(/^\./u, ''));

/**
 * Converts an array of extensions into a braced glob.
 *
 * @param   exts Array of extensions.
 *
 * @returns      Extensions as a braced glob.
 *
 * @note Don’t use `{}` braces in TypeScript config files; i.e., incompatible.
 */
const asBracedGlob = (exts) => {
    exts = [...new Set(exts)]; // Unique.
    return (exts.length > 1 ? '{' : '') + noDot(exts).join(',') + (exts.length > 1 ? '}' : '');
};

/**
 * Converts an array of extensions into no-brace globstars.
 *
 * @param   exts Array of extensions.
 *
 * @returns      Extensions as no-brace globstars.
 */
const asNoBraceGlobstars = (exts) => {
    return noDot(exts).map((ext) => '**/*.' + ext);
};

/**
 * Converts an array of extensions into a regular expression fragment.
 *
 * @param   exts Array of extensions.
 *
 * @returns      Extensions as a regular expression fragment.
 */
const asRegExpFrag = (exts) => {
    exts = [...new Set(exts)]; // Unique.
    return (exts.length > 1 ? '(?:' : '') + noDot(exts).join('|') + (exts.length > 1 ? ')' : '');
};

/**
 * Defines extensions.
 */
const extensions = {
    /**
     * Utilities.
     */
    dot,
    noDot,
    asBracedGlob,
    asNoBraceGlobstars,
    asRegExpFrag,

    /**
     * By canonical.
     */
    byCanonical: $obj.map($obj.cloneDeep($path.extsByCanonical()), (exts) => dot(exts)),

    /**
     * By VS Code lang (camelCase, includes `codeTextual`).
     */
    byVSCodeLang: $obj.map($obj.cloneDeep($path.extsByVSCodeLang({ camelCase: true, enableCodeTextual: true })), (exts) => dot(exts)),

    /**
     * By dev group.
     */
    byDevGroup: $obj.map($obj.cloneDeep($path.jsTSExtsByDevGroup()), (exts) => dot(exts)),
};

/**
 * Content (tailwind).
 */
extensions.tailwindContent = [
    ...new Set([
        ...extensions.byVSCodeLang.mdx,
        ...extensions.byVSCodeLang.markdown,
        ...extensions.byVSCodeLang.html,

        ...extensions.byVSCodeLang.php,
        ...extensions.byVSCodeLang.asp,
        ...extensions.byVSCodeLang.ruby,
        ...extensions.byVSCodeLang.python,
        ...extensions.byVSCodeLang.perl,
        ...extensions.byVSCodeLang.shellscript,

        ...extensions.byDevGroup.allJavaScript,
        ...extensions.byDevGroup.allTypeScript,

        ...extensions.byVSCodeLang.xml, // e.g., SVGs.
    ]),
];
extensions.tailwindPrettierContent = [...extensions.tailwindContent];

/**
 * Content (comment anchors).
 */
extensions.commentAnchorsContent = [...extensions.tailwindContent];

/**
 * Extensions to try on import w/o extension.
 */
extensions.onImportWithNoExtensionTry = [...extensions.byDevGroup.allTypeScript, ...extensions.byDevGroup.allJavaScript];

/**
 * Default export.
 */
export default extensions;
