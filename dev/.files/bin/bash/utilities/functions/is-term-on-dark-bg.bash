#!/usr/bin/env bash
##
# Utility function(s).
##

##
# Checks if terminal has a dark background color.
#
# {@link https://o5p.me/BAkbEq} for inspiration.
#
# @param string ${1} String.
#
# @return int `0` (true) if terminal has a dark background color.
#
# @review This needs more work in the future.
##
function :is-term-on-dark-bg() {
    if [[ -z "${COLORFGBG:-}" || "${COLORFGBG}" == '15;0' || "${COLORFGBG}" == '15;default;0' ]]; then
        return 0 # True; {@see https://o5p.me/BAkbEq}.
    fi
    return 1 # False.
}
