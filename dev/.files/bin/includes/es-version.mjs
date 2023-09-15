/**
 * ES version.
 *
 * @note PLEASE DO NOT EDIT THIS FILE!
 * @note This entire file will be updated automatically.
 * @note Instead of editing here, please review <https://github.com/clevercanyon/skeleton>.
 */

import globals from 'globals';

/**
 * Defines ES version.
 */
export default {
	year: 2022,
	lcnYear: 'es2022',
	ucnYear: 'ES2022',
	globals: {
		...globals.es2021, // Defined by globals package.
		...globals.es2022, // Not currently defined by globals package.
	},
};