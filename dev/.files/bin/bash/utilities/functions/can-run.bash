#!/usr/bin/env bash
##
# Utility function(s).
##

##
# Can run a command?
#
# @param string ${1} Command name.
#
# @output void No output.
# @return int `0` (true) if can run command name.
##
function :can-run() {
    local name="${1:-}"

    if [[ -z "${name}" ]]; then
        return 1 # False.
    fi
    command -v "${name}" > /dev/null 2>&1
}
