/**
 * Wrangler settings file.
 *
 * Wrangler is not aware of this config file's location. We use the exports provided by this file to centralize a few
 * settings associated with Wrangler that are reused across various tools that integrate with Wrangler.
 *
 * @note PLEASE DO NOT EDIT THIS FILE!
 * @note This entire file will be updated automatically.
 * @note Instead of editing here, please review <https://github.com/clevercanyon/skeleton>.
 */

import os from 'node:os';
import path from 'node:path';
import { $fs } from '../../../node_modules/@clevercanyon/utilities.node/dist/index.js';
import { $app, $brand } from '../../../node_modules/@clevercanyon/utilities/dist/index.js';
import u from '../bin/includes/utilities.mjs';

const __dirname = $fs.imuDirname(import.meta.url);
const projDir = path.resolve(__dirname, '../../..');

/**
 * Defines Wrangler settings.
 */
export default async () => {
    const pkg = await u.pkg();
    const pkgSlug = $app.pkgSlug(pkg.name);

    const o5pMe = $brand.get('@jaswrks/o5p.me');
    const o5pOrg = $brand.get('@jaswrks/o5p.org');
    const hop = $brand.get('@clevercanyon/hop.gdn');

    let brandHostname = hop.hostname;
    let brandDevZoneHostname = hop.org.n7m + '.workers.dev';
    let brandAccountId = 'f1176464a976947aa5665d989814a4b1';
    let brandSupportsLogpush = true; // Requires paid plan.

    if (/^workers-o5p-(?:me|org)(?:$|-)/u.test(pkgSlug)) {
        brandHostname = /^workers-o5p-org(?:$|-)/u.test(pkgSlug)
            ? o5pOrg.hostname // O5p.org brand hostname.
            : o5pMe.hostname; // O5p.me brand hostname.
        brandDevZoneHostname = 'j5s' + '.workers.dev';
        brandAccountId = '4cf0983a5f62681776b3bc8a8e35b104';
        brandSupportsLogpush = false; // Requires paid plan.
    }
    return {
        defaultAccountId: brandAccountId,
        defaultLogpush: brandSupportsLogpush,

        compatibilityDate: '2024-09-23',
        compatibilityFlags: [],

        defaultLocalIP: '0.0.0.0',
        defaultLocalHostname: 'localhost',
        defaultLocalProtocol: 'https',
        defaultLocalPort: '443',

        defaultDevLogLevel: 'error',
        miniflareEnvVarAsString: 'MINIFLARE=true',
        miniflareEnvVarAsObject: { MINIFLARE: 'true' },

        defaultPagesZoneName: brandHostname,
        defaultPagesDevZoneName: 'pages.dev',

        defaultPagesProjectName: pkgSlug,
        defaultPagesProjectShortName: pkgSlug //
            .replace(/-(?:o5p-(?:me|org)|hop-gdn|com|net|org|gdn|me)$/iu, ''),

        defaultPagesProductionBranch: 'production',
        defaultPagesProjectStageBranchName: 'stage',
        defaultPagesProductionEnvironment: 'production',

        defaultWorkerZoneName: brandHostname,
        defaultWorkersDevZoneName: brandDevZoneHostname,
        defaultWorkersDomain: 'workers.' + brandHostname,

        defaultWorkerName: pkgSlug, // e.g., `workers-hop-gdn-utilities`.
        defaultWorkerShortName: pkgSlug.replace(/^workers-(?:o5p-(?:me|org)|hop-gdn)-/iu, ''),
        defaultWorkerStageShortName: 'stage.' + pkgSlug.replace(/^workers-(?:o5p-(?:me|org)|hop-gdn)-/iu, ''),

        osDir: path.resolve(os.homedir(), './.wrangler'),
        projDir: path.resolve(projDir, './.wrangler'),
        projStateDir: path.resolve(projDir, './.wrangler/state'),

        osSSLCertDir: path.resolve(os.homedir(), './.wrangler/local-cert'),
        osSSLKeyFile: path.resolve(os.homedir(), './.wrangler/local-cert/key.pem'),
        osSSLCertFile: path.resolve(os.homedir(), './.wrangler/local-cert/cert.pem'),

        customSSLKeyFile: path.resolve(projDir, './dev/.files/bin/ssl-certs/i10e-ca-key.pem'),
        customSSLCertFile: path.resolve(projDir, './dev/.files/bin/ssl-certs/i10e-ca-crt.pem'),
    };
};
