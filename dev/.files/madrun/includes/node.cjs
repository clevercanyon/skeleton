/**
 * Node prepended `--require`.
 *
 * @note PLEASE DO NOT EDIT THIS FILE!
 * @note This entire file will be updated automatically.
 * @note Instead of editing here, please review <https://github.com/clevercanyon/skeleton>.
 */

/**
 * Filters Node warnings.
 */
process.on('warning', (warning) => {
    if ('ExperimentalWarning' === warning.name && warning.message) {
        if (warning.message.includes('Web Crypto API algorithm is an experimental feature')) {
            return false; // Web Crypto is a thing. Ok to suppress.
        }
        if (
            warning.message.includes('Import assertions are not a stable feature') || //
            warning.message.includes('Importing JSON modules is an experimental feature')
        ) {
            return false; // JSON imports are a thing. Ok to suppress.
        }
    }
    console.warn(warning);
});
