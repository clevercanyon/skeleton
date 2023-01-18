#!/usr/bin/env bash
##
# Utility include.
##

##
# Loads baseline options/utilities.
##

function :___baseline_closure___() {
    ##
    # Sets glob options.
    ##

    shopt -s extglob
    shopt -s dotglob
    shopt -s globstar
    shopt -s nullglob

    ##
    # Gets this file’s directory.
    ##

    local __dirname="$(cd "$(dirname "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"
    [[ -d "${__dirname}" ]] || { :chalk-danger ':___baseline_closure___: Missing `__dirname`!' >&2 && return 1; }

    ##
    # Loads all utility functions.
    ##

    local _function_file # Initializes local var.
    for _function_file in "${__dirname}"/../functions/**.bash; do
        [[ -f "${_function_file}" ]] && . "${_function_file}"
    done

} && :___baseline_closure___
