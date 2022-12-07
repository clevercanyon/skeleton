#!/usr/bin/env node
/**
 * Dotfiles updater.
 *
 * @note PLEASE DO NOT EDIT THIS FILE!
 * This entire file will be updated automatically.
 * - Instead of editing here, please review <https://github.com/clevercanyon/skeleton>.
 */
/* eslint-env es2021, node */

import { exec as nodeExec } from 'child_process';
import crypto               from 'crypto';
import degit                from 'degit';
import desm                 from 'desm';
import fs                   from 'fs-extra';
import os                   from 'os';
import path                 from 'path';
import util                 from 'util';

const exec = util.promisify( nodeExec );

( async () => {
	/**
	 * Initializes vars.
	 */
	const __dirname = desm( import.meta.url );
	const projDir   = path.resolve( __dirname, '../../..' );

	const tmpDir            = await fs.mkdtemp(
		path.resolve( os.tmpdir(), './' + crypto.randomUUID() ),
	);
	const tmpDirUpdaterFile = path.resolve( tmpDir, './dev/.files/bin/updater/index.js' );

	/**
	 * Downloads latest skeleton.
	 */
	await degit( 'clevercanyon/skeleton' ).clone( tmpDir );

	/**
	 * Runs `npm ci` in latest skeleton directory.
	 */
	await exec( 'npm ci --include=dev', { cwd : tmpDir } );

	/**
	 * Runs updater using files from latest skeleton.
	 */
	await ( await import( tmpDirUpdaterFile ) ).default( { projDir } );

	/**
	 * Removes tmp directory.
	 */
	await fs.remove( tmpDir );
} )();
