#!/usr/bin/env bash
##
# Utility function(s).
##

##
# Checks if terminal supports 16M colors.
# Result is cached to optimize chalk performance.
#
# @output void No output.
# @return int `0` (true) if terminal supports 16M colors.
##
function :is-term-16m-colors() {
    if [[ -n "${___is_term_16m_colors___:-}" ]]; then
        return "${___is_term_16m_colors___}"
    fi
    if [[ -n "${COLORTERM:-}" && "${COLORTERM,,}" =~ true[_\-]?color|24[_\-]?bit ]]; then
        ___is_term_16m_colors___=0
        return "${___is_term_16m_colors___}" # True.

    elif [[ -n "${TERM:-}" && "${TERM,,}" =~ true[_\-]?color|24[_\-]?bit ]]; then
        ___is_term_16m_colors___=0
        return "${___is_term_16m_colors___}" # True.

    elif :can-run tput && (($(tput colors 2> /dev/null) >= 16000000)); then
        ___is_term_16m_colors___=0
        return "${___is_term_16m_colors___}" # True.
    fi
    ___is_term_16m_colors___=1
    return "${___is_term_16m_colors___}" # False.
}
