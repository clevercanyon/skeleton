#!/usr/bin/env node
/**
 * Jest config.
 *
 * Jest is not aware of this config file's location.
 *
 * @note PLEASE DO NOT EDIT THIS FILE!
 * @note This entire file will be updated automatically.
 * @note Instead of editing here, please review <https://github.com/clevercanyon/skeleton>.
 *
 * @see https://jestjs.io/docs/configuration
 */

import fs from 'node:fs';
import u from '../../resources/utilities.mjs';

/**
 * Defines Jest configuration.
 */
export default async () => {
    /**
     * Composition.
     */
    return {
        roots: [
            ...(fs.existsSync(u.srcDir) ? [u.srcDir] : []), //
            ...(fs.existsSync(u.testsDir) ? [u.testsDir] : []),
            ...(!fs.existsSync(u.srcDir) && !fs.existsSync(u.testsDir) ? [u.projDir] : []),
        ],
        testPathIgnorePatterns: u.omit.asRegExpStrings([
            ...new Set([
                ...u.omit.localIgnores,
                ...u.omit.logIgnores,
                ...u.omit.backupIgnores,
                ...u.omit.patchIgnores,
                ...u.omit.editorIgnores,
                ...u.omit.toolingIgnores,
                ...u.omit.pkgIgnores,
                ...u.omit.vcsIgnores,
                ...u.omit.osIgnores,
                ...u.omit.dotIgnores,
                ...u.omit.dtsIgnores,
                ...u.omit.configIgnores,
                ...u.omit.lockIgnores,
                ...u.omit.devIgnores,
                ...u.omit.distIgnores,
                ...u.omit.sandboxIgnores,
                ...u.omit.exampleIgnores,
                ...u.omit.docIgnores,
                ...u.omit.benchIgnores,
                ...u.omit.adhocExIgnores,
            ]),
        ]),
        // Configured to run JS tests only; not TypeScript tests.
        // To create and run TypeScript tests, use Vitest instead of Jest.
        testMatch: [
            '**/*.{test|tests|spec|specs}.' + u.exts.asBracedGlob([...u.exts.byDevGroup.allJavaScript]), //
            '**/{test,tests,spec,specs}/**/*.' + u.exts.asBracedGlob([...u.exts.byDevGroup.allJavaScript]),
        ],
        moduleNameMapper: await u.aliases.asRegExpStrings(),
        moduleFileExtensions: u.exts.noDot([...u.exts.byDevGroup.allJavaScript]),
        extensionsToTreatAsEsm: [
            ...('module' === u.pkgType
                ? [...u.exts.byDevGroup.sJavaScript, ...u.exts.byDevGroup.sJavaScriptReact, ...u.exts.byDevGroup.mJavaScript, ...u.exts.byDevGroup.mJavaScriptReact]
                : [...u.exts.byDevGroup.mJavaScript, ...u.exts.byDevGroup.mJavaScriptReact]),
        ].filter((ext) => ext !== '.mjs'), // Jest complains that `.mjs` is always treated as ESM, so we exclude it here.
    };
};
