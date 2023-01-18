#!/usr/bin/env bash
##
# Utilities.
##

##
# Loads utilities.
##

function :___load_closure___() {
    ##
    # Minimum required version.
    ##

    local required_bash_version='5.2.15'

    ##
    # Checks bash version against minimum required version.
    ##

    local v1="${BASH_VERSION:-}" v2="${required_bash_version}"
    [[ -n "${v1}" && "$(printf '%s\n' "${v1}" "${v2}" | sort -rV | head -n1)" == "${v1}" ]] || {
        echo ':___load_closure___: Minimum required bash version is `'"${required_bash_version}"'`.' >&2
        echo ':___load_closure___: Currently running bash version `'"${BASH_VERSION:-}"'`.' >&2 && return 1
    }

    ##
    # Gets this file’s directory.
    ##

    local __dirname="$(cd "$(dirname "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"
    [[ -d "${__dirname}" ]] || { echo ':___load_closure___: Missing `__dirname`!' >&2 && return 1; }

    ##
    # Loads baseline options/utilities.
    ##

    local mode="${C10N_UTILITIES_MODE:-strict}" # Default is strict mode.
    . "${__dirname}"/includes/baseline.bash || { echo ':___load_closure___: Missing baseline!' >&2 && return 1; }

    ##
    # Loads strict mode when applicable.
    ##

    if [[ "${mode}" == strict ]]; then
        . "${__dirname}"/includes/strict-mode.bash ||
            { :chalk-danger ':___load_closure___: Missing strict mode!' >&2 && return 1; }

    ##
    # Loads loose mode when applicable.
    ##

    elif [[ "${mode}" == loose ]]; then
        . "${__dirname}"/includes/loose-mode.bash ||
            { :chalk-danger ':___load_closure___: Missing loose mode!' >&2 && return 1; }

    ##
    # Loads interactive shell mode when applicable.
    ##

    elif [[ "${mode}" == ishell ]]; then
        . "${__dirname}"/includes/ishell-mode.bash ||
            { :chalk-danger ':___load_closure___: Missing ishell mode!' >&2 && return 1; }

    ##
    # Warns about an invalid mode when applicable.
    ##
    else
        :chalk-danger ':___load_closure___: Invalid mode: `'"${mode}"'`!' >&2 && return 1
    fi
} && :___load_closure___
