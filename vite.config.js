/**
 * Vite config file.
 *
 * @since 1.0.0
 *
 * @note Vite is aware of this config file's location.
 *
 * @note CUSTOM EDITS ONLY PLEASE!
 * In the future this file will be updated automatically.
 * Only `<custom:start>...</custom:end>` will be preserved below.
 */
/* eslint-env es2021, node */

import mc         from '@clevercanyon/js-object-mc';
import baseConfig from './dev/.files/vite/config.js';

/**
 * Customizations
 * <custom:start> */

export default async ( viteData ) => {
	return mc.merge( {}, await baseConfig( viteData ), {} );
};

/** </custom:end> */
