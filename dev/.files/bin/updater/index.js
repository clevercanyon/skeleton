/**
 * Dotfiles updater.
 *
 * @note PLEASE DO NOT EDIT THIS FILE!
 * This entire file will be updated automatically.
 * - Instead of editing here, please review <https://github.com/clevercanyon/skeleton>.
 */
/* eslint-env es2021, node */

import mc           from '@clevercanyon/js-object-mc';
import desm         from 'desm';
import fs           from 'fs-extra';
import path         from 'path';
import customRegexp from './data/custom-regexp.js';

export default async ( { projDir } ) => {
	/**
	 * Initializes vars.
	 */
	const __dirname = desm( import.meta.url );
	const tmpDir    = path.resolve( __dirname, '../../../..' );
	const pkg       = await fs.readJson( path.resolve( projDir, './package.json' ) );

	let locks = pkg.config?.c10n?.[ '&' ]?.dotfiles?.lock || [];
	locks     = locks.map( ( relPath => path.resolve( projDir, relPath ) ) );

	/**
	 * Checks dotfile locks.
	 *
	 * @param {string} relPath Relative dotfile path.
	 *
	 * @return {boolean} True if relative path is locked by `package.json`.
	 */
	const isLocked = ( relPath ) => {
		// Compares absolute paths to each other.
		const absPath = path.resolve( projDir, relPath );

		for ( let i = 0; i < locks.length; i++ ) {
			if ( absPath === locks[ i ] ) {
				return true; // Locked 🔒.
			}
		}
		return false;
	};

	/**
	 * Updates immutable directories.
	 */
	for ( const relPath of [
		'./dev/.files',
	] ) {
		await fs.remove( path.resolve( projDir, relPath ) );
		await fs.ensureDir( path.resolve( projDir, relPath ) );
		await fs.copy( path.resolve( tmpDir, relPath ), path.resolve( projDir, relPath ) );
	}
	await fs.chmod( path.resolve( projDir, './dev/.files/bin/update.js' ), 0o700 );

	/**
	 * Updates semi-immutable dotfiles.
	 */
	for ( const relPath of [
		'./.github/FUNDING.yml',
		'./.browserslistrc',
		'./.eslintrc.cjs',
		'./.gitattributes',
		'./.gitignore',
		'./.npmignore',
		'./.npmrc',
		'./.postcssrc.cjs',
		'./.prettierrc.cjs',
		'./.shellcheckrc',
		'./.stylelintrc.cjs',
		'./.tailwindrc.cjs',
		'./tsconfig.json',
		'./vite.config.js',
		'./wrangler.toml',
	] ) {
		if ( isLocked( relPath ) ) {
			return; // Locked 🔒.
		}
		const oldFileContents   = await fs.readFile( path.resolve( projDir, relPath ), 'utf8' );
		const oldFileMatches    = customRegexp.exec( oldFileContents ); // See: `./data/custom-regexp.js`.
		const oldFileCustomCode = oldFileMatches ? oldFileMatches[ 2 ] : ''; // We'll preserve any custom code.

		const newFileContents = ( await fs.readFile( path.resolve( tmpDir, relPath ), 'utf8' ) )
			.replace( customRegexp, ( $_, $1, $2, $3 ) => $1 + oldFileCustomCode + $3 );
		await fs.writeFile( path.resolve( projDir, relPath ), newFileContents );
	}

	/**
	 * Adds up-to-date copies of missing mutable files.
	 */
	for ( const relPath of [
		'./LICENSE.txt',
		'./README.md',
	] ) {
		if ( isLocked( relPath ) ) {
			return; // Locked 🔒.
		}
		if ( ! await fs.exists( path.resolve( projDir, relPath ) ) ) {
			await fs.copy( path.resolve( tmpDir, relPath ), path.resolve( projDir, relPath ) );
		}
	}

	/**
	 * Adds and/or updates updateable JSON files.
	 */
	for ( const relPath of [
		'./package.json',
	] ) {
		if ( isLocked( relPath ) ) {
			return; // Locked 🔒.
		}
		if ( ! await fs.exists( path.resolve( projDir, relPath ) ) ) {
			await fs.copy( path.resolve( tmpDir, relPath ), path.resolve( projDir, relPath ) );
		}
		const json        = await fs.readJson( path.resolve( projDir, relPath ) );
		const updatesFile = path.resolve( tmpDir, './dev/.files/bin/updater/data', relPath, './updates.json' );

		if ( await fs.exists( updatesFile ) ) {
			mc.patch( json, await fs.readJson( updatesFile ) );
			await fs.writeFile( path.resolve( projDir, relPath ), JSON.stringify( json, null, 4 ) );
		}
	}
};
