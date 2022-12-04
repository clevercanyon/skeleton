/* eslint-env es2021, node */

import mc         from '@clevercanyon/js-object-mc';
import viteConfig from './dev/.files/vite/config.js';

export default async ( viteData ) => {
	return mc.merge( {}, await viteConfig( viteData ), {
		appType : 'spa', // <https://vitejs.dev/config/shared-options.html#apptype>
		base    : '/',   // Analagous to `<base href="">`.
		build   : {
			lib : {
				name : '',
			},
		},
	} );
};
