#!/usr/bin/env bash
##
# Utility function(s).
##

##
# Checks if terminal supports 256 colors.
# Result is cached to optimize chalk performance.
#
# @output void No output.
# @return int `0` (true) if terminal supports 256 colors.
##
function :is-term-256-colors() {
    if [[ -n "${___is_term_256_colors___:-}" ]]; then
        return "${___is_term_256_colors___}"
    fi
    if :is-term-16m-colors; then
        ___is_term_256_colors___=0
        return "${___is_term_256_colors___}" # True.

    elif [[ -n "${COLORTERM:-}" && "${COLORTERM,,}" =~ true[_\-]?color|24[_\-]?bit|256[_\-]?color ]]; then
        ___is_term_256_colors___=0
        return "${___is_term_256_colors___}" # True.

    elif [[ -n "${TERM:-}" && "${TERM,,}" =~ 256[_\-]?color ]]; then
        ___is_term_256_colors___=0
        return "${___is_term_256_colors___}" # True.

    elif :can-run tput && (($(tput colors 2> /dev/null) >= 256)); then
        ___is_term_256_colors___=0
        return "${___is_term_256_colors___}" # True.
    fi
    ___is_term_256_colors___=1
    return "${___is_term_256_colors___}" # False.
}
