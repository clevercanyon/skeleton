/**
 * Exclusions.
 *
 * @note PLEASE DO NOT EDIT THIS FILE!
 * @note This entire file will be updated automatically.
 * @note Instead of editing here, please review <https://github.com/clevercanyon/skeleton>.
 */

import path from 'node:path';
import { $obj, $path, $str } from '../../../../node_modules/@clevercanyon/utilities/dist/index.js';

/**
 * @todo Pull this from `$path` once utilities are up-to-date.
 */
const defaultGitNPMIgnoresByCategory = {
	// Locals

	localIgnores: [
		'._*', //
		'.~*',
		'.#*',
		'*.local',
	],
	// Logs

	logIgnores: [
		'*.log', //
		'*.logs',
	],
	// Backups

	backupIgnores: [
		'*~', //
		'*.bak',
	],
	// Patches

	patchIgnores: [
		'*.rej', //
		'*.orig',
		'*.patch',
		'*.diff',
	],
	// Editors

	editorIgnores: [
		// Vim

		'.*.swp',

		// IntelliJ

		'.idea',

		// Sublime

		'*.sublime-project',
		'*.sublime-workspace',

		// Netbeans

		'*.nbproject',

		// VS Code

		'*.code-search',
		'*.code-workspace',

		// CTAGs

		'*.ctags',
	],
	// Packages

	pkgIgnores: [
		// Yarn

		'.yarn',

		// Vendor

		'vendor',

		// NodeJS

		'node_modules',

		// JSPM

		'jspm_packages',

		// Bower

		'bower_components',
	],
	// Version Control

	vcsIgnores: [
		// Git

		'.git',

		// Subversion

		'.svn',
		'_svn',
		'.svnignore',

		// Concurrent

		'CVS',
		'.cvsignore',

		// Bazaar

		'.bzr',
		'.bzrignore',

		// Mercurial

		'.hg',
		'.hgignore',

		// Source

		'SCCS',

		// Revision

		'RCS',
	],
	// Operating Systems

	osIgnores: [
		// PC Files

		'Thumbs.db',
		'ehthumbs.db',
		'Desktop.ini',

		// PC Directories

		'$RECYCLE.BIN',

		// Mac Files

		'._*',
		'Icon\r',
		'*.icloud',
		'.DS_Store',
		'.disk_label',
		'.LSOverride',
		'.VolumeIcon.icns',
		'.com.apple.timemachine.*',

		// Mac Directories

		'.apdisk',
		'*.icloud',
		'.fseventsd',
		'.AppleDB',
		'.AppleDesktop',
		'.AppleDouble',
		'.Trashes',
		'.TemporaryItems',
		'.Spotlight-V100',
		'.DocumentRevisions-V100',
		'Network Trash Folder',
		'Temporary Items',
	],
	// Dots

	dotIgnores: [
		'.*', //
		// This category covers everything else we have in `./.npmignore`
		// that isn’t already grouped in some other way by our exclusions.

		// Note that `.tsbuildinfo` can also appear as `[name].tsbuildinfo`.
		// So it’s technically a `.` file, or should be, so we treat it as such.
		'*.tsbuildinfo',
	],
	// Types

	dtsIgnores: [
		'*.d.ts', //
		'*.d.tsx',
		'*.d.cts',
		'*.d.ctsx',
		'*.d.mts',
		'*.d.mtsx',
	],
	// Configs

	configIgnores: [
		'tsconfig.*', //
		'wrangler.*',
		'*.config.*',
		'config.gypi',
		'package.json',
	],
	// Locks

	lockIgnores: [
		'yarn.lock', //
		'composer.lock',
		'package-lock.json',
	],
	// Dev

	devIgnores: [
		'dev', //
	],
	// Dist

	distIgnores: [
		'dist', //
	],
	// Sandbox

	sandboxIgnores: [
		'sandbox', //
	],
	// Examples

	exampleIgnores: [
		'example', //
		'examples',
	],
	// Docs

	docIgnores: [
		'doc', //
		'docs',
		'*.doc.*',
		'*.docs.*',
		'readme.*',
		'*.readme.*',
	],
	// Tests

	testIgnores: [
		'test', //
		'tests',
		'*.test.*',
		'*.tests.*',
		'*.test-d.*',
		'*.tests-d.*',
	],
	// Specs

	specIgnores: [
		'spec', //
		'specs',
		'*.spec.*',
		'*.specs.*',
		'*.spec-d.*',
		'*.specs-d.*',
	],
	// Benchmarks

	benchIgnores: [
		'bench', //
		'benchmark',
		'benchmarks',
		'*.bench.*',
		'*.benchmark.*',
		'*.benchmarks.*',
	],
};

/**
 * Converts an array of exclusions into regular expression strings.
 *
 * @param   globs Array of exclusion globs.
 *
 * @returns       Exclusions as regular expression strings.
 *
 * @todo Utilize `@clevercanyon/utilities/path.globToRegExpString()`.
 */
const asRegExpStrings = (globs) =>
	[...new Set(globs)].map(
		(glob) =>
			'^' +
			$str
				.escRegExp(glob)
				.replace(/\\\*\\\*/gu, '[\\s\\S]*')
				.replace(/\\\*/gu, '[^\\/]*') +
			'$',
	);

/**
 * Converts an array of exclusions into regular expressions.
 *
 * @param   globs Array of exclusion globs.
 *
 * @returns       Exclusions as regular expressions.
 */
const asRegExps = (globs) => asRegExpStrings(globs).map((rxs) => new RegExp(rxs, 'ui'));

/**
 * Converts an array of exclusions into relative globs.
 *
 * @param   from  From path.
 * @param   globs Array of exclusion globs.
 *
 * @returns       Exclusions as relative globs.
 */
const asRelativeGlobs = (from, globs) => {
	return [...new Set(globs)].map((glob) => {
		return /^\*\*/u.test(glob) ? glob : path.relative(from, glob);
	});
};

/**
 * Converts an array of exclusions into negated globs.
 *
 * @param   globs Array of exclusion globs.
 *
 * @returns       Exclusions as negated globs.
 */
const asNegatedGlobs = (globs) => [...new Set(globs)].map((glob) => '!' + glob);

/**
 * Defines exclusions globs.
 *
 * - Don’t declare any negations here. Instead, use {@see asNegatedGlobs()}.
 * - Don’t use `{}` brace expansions here. Not compatible with TypeScript config.
 */
export default {
	/**
	 * Default Git/NPM ignores, by category. Categories added to the default export here. Provided by
	 * `@clevercanyon/utilities`. Includes everything we have in our default `./.gitignore`, `./.npmignore`.
	 */
	...$obj.map(defaultGitNPMIgnoresByCategory, (category) => {
		return category.map((glob) => '**/' + glob + '/**');
	}),

	/**
	 * We intentionally use our 'default' NPM ignores when pruning; i.e., as opposed to using the current and
	 * potentially customized `./.npmignore` file in the current project directory. The reason is because we intend to
	 * enforce our standards. For further details {@see https://o5p.me/MuskgW}.
	 */
	defaultNPMIgnores: $path.defaultNPMIgnores.map((glob) => {
		const isNegated = /^!/u.test(glob);
		glob = isNegated ? glob.replace(/^!/u, '') : glob;
		return (isNegated ? '!' : '') + '**/' + glob + '/**';
	}),

	/**
	 * Specifically for use in our projects.
	 */
	adhocXIgnores: ['**/x-*/**'], // For special use cases.

	/**
	 * Utilities.
	 */
	asRegExps,
	asRegExpStrings,
	asRelativeGlobs,
	asNegatedGlobs,
};
