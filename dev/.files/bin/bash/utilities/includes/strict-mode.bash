#!/usr/bin/env bash
##
# Utility include.
##

##
# Loads strict mode.
##

function :___strict_mode_closure___() {
    ##
    # Sets options.
    ##

    set -o nounset
    set -o errexit
    set -o errtrace
    set -o pipefail

    ##
    # Strict mode stack trace for debugging.
    #
    # @param  int ${1} Last command’s name/args.
    # @param  int ${2} Last command’s status code.
    #
    # @output string Diagnostic report.
    # @exit   int    Last command’s status code.
    #
    # @see https://o5p.me/8eGn9c
    ##

    function :strict-mode-stack-trace() {
        set +o xtrace # Don't trace this routine ↓.

        # Checks global set by this function.
        if [[ -n "${___strict_mode_stack_trace_complete___:-}" &&
            "${___strict_mode_stack_trace_complete___}" == true ]]; then
            return 0 # One time only.
        fi
        ___strict_mode_stack_trace_complete___=true # Tracing now.

        local diagnostic_lines=()
        local diagnostic_report=''

        local last_command="${1:-}"
        local last_command_status_code="${2:-1}"

        diagnostic_lines+=('---------------------------------------------------------------------------')
        diagnostic_lines+=('Error in '"${BASH_SOURCE[1]}"':'"${BASH_LINENO[0]}")
        diagnostic_lines+=('`'"${last_command}"'` exited with status `'"${last_command_status_code}"'`.')

        if [[ ${#FUNCNAME[@]} -gt 2 ]]; then
            diagnostic_lines+=('Stack Trace:')

            for ((_i = 1; _i < ${#FUNCNAME[@]} - 1; _i++)); do
                diagnostic_lines+=(" ${_i}: ${BASH_SOURCE[${_i} + 1]}:${BASH_LINENO[${_i}]} ${FUNCNAME[${_i}]}(...)")
            done
        fi
        diagnostic_lines+=('Exiting with status `'"${last_command_status_code}"'`.')
        diagnostic_report="$(IFS=$'\n' && echo "${diagnostic_lines[*]}")"

        echo -e "\x01\e[30m\x02${diagnostic_report}\x01\e[0m\x02" >&2 # Lines from above.
        exit "${last_command_status_code}"                            # Preserves exit status.
    }
    trap ':strict-mode-stack-trace "${BASH_COMMAND}" "${?}"' ERR

} && :___strict_mode_closure___
