#!/usr/bin/env node
/**
 * Dotfiles updater.
 *
 * @since 1.0.0
 *
 * @note PLEASE DO NOT EDIT THIS FILE!
 * This file will be updated automatically.
 * - Instead of editing here, please review <https://github.com/clevercanyon/skeleton>.
 */
/* eslint-env es2021, node */

import desm from 'desm';
import path from 'path';
import fs   from 'fs-extra';
import mc   from '@clevercanyon/js-object-mc';

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
	[
		'./dev/.files',
	].forEach( ( relPath ) => {
		await fs.remove( path.resolve( projDir, relPath ) );
		await fs.ensureDir( path.resolve( projDir, relPath ) );
		await fs.copy( path.resolve( tmpDir, relPath ), path.resolve( projDir, relPath ) );
	} );
	await fs.chmod( path.resolve( projDir, './dev/.files/bin/config.js' ), 0o700 );
	await fs.chmod( path.resolve( projDir, './dev/.files/bin/update.js' ), 0o700 );

	/**
	 * Updates semi-immutable dotfiles.
	 */
	[
		'./.browserslistrc',
		'./.eslintrc.js',
		'./.gitattributes',
		'./.gitignore',
		'./.npmignore',
		'./.npmrc',
		'./.prettierrc.js',
		'./.shellcheckrc',
		'./.stylelintrc.js',
	].forEach( ( relPath ) => {
		if ( isLocked( relPath ) ) {
			return; // Locked 🔒.
		}
		await fs.copy( path.resolve( tmpDir, relPath ), path.resolve( projDir, relPath ) );
	} );

	/**
	 * Adds up-to-date copies of missing mutable files.
	 */
	[
		'./LICENSE.txt',
		'./README.md',
	].forEach( ( relPath ) => {
		if ( isLocked( relPath ) ) {
			return; // Locked 🔒.
		}
		if ( ! await fs.exists( path.resolve( projDir, relPath ) ) ) {
			await fs.copy( path.resolve( tmpDir, relPath ), path.resolve( projDir, relPath ) );
		}
	} );

	/**
	 * Adds and/or updates mutable JSON files.
	 */
	[
		'./package.json',
		'./tsconfig.json',
	].forEach( ( relPath ) => {
		if ( isLocked( relPath ) ) {
			return; // Locked 🔒.
		}
		if ( ! await fs.exists( path.resolve( projDir, relPath ) ) ) {
			await fs.copy( path.resolve( tmpDir, relPath ), path.resolve( projDir, relPath ) );
		}
		const json = await fs.readJson( path.resolve( projDir, relPath ) );
		mc.patch( json, await fs.readJson( path.resolve( tmpDir, './dev/.files/data', relPath, './updates.json' ) ) );
		await fs.writeFile( path.resolve( projDir, relPath ), JSON.stringify( json, null, 4 ) );
	} );
};
