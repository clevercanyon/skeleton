#!/usr/bin/env node
/**
 * Jest config.
 *
 * @note PLEASE DO NOT EDIT THIS FILE!
 * @note This entire file will be updated automatically.
 * @note Instead of editing here, please review <https://github.com/clevercanyon/skeleton>.
 */
/* eslint-env es2021, node */

import path from 'node:path';
import { dirname } from 'desm';

const __dirname = dirname(import.meta.url);
const projDir = path.resolve(__dirname, '../../..');

/**
 * Defines Jest configuration.
 */
export default async (/* {} */) => {
	return {
		roots: [
			path.resolve(projDir, './src'), //
			path.resolve(projDir, './tests'),
		],
	};
};