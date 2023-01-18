#!/usr/bin/env bash
##
# Utility function(s).
##

##
# References for colorization codes.
#
# @see https://misc.flogisoft.com/bash/tip_colors_and_formatting
# @see https://stackoverflow.com/a/19501528 ... regarding `\x01` and `\x02`.
##

##
# Default + 16 most basic named colorizers.
# Actual colors vary based on terminal configuration.
##

##
# Colorizes a string in default color.
#
# @param string ${1} String.
#
# @output string Colorized string.
# @return int `0` (true) on success.
##
function :chalk-default() {
    local str="${1:-}"

    if ! :is-term-16-colors; then
        echo -ne "${str}" && return 0
    fi
    echo -ne "\x01\e[39m\x02${str}\x01\e[0m\x02"
}

##
# Colorizes a string in dark gray color.
#
# @param string ${1} String.
#
# @output string Colorized string.
# @return int `0` (true) on success.
##
function :chalk-gray() {
    local str="${1:-}"

    if ! :is-term-16-colors; then
        echo -ne "${str}" && return 0
    fi
    echo -ne "\x01\e[90m\x02${str}\x01\e[0m\x02"
}

##
# Colorizes a string in black color.
#
# @param string ${1} String.
#
# @output string Colorized string.
# @return int `0` (true) on success.
##
function :chalk-black() {
    local str="${1:-}"

    if ! :is-term-16-colors; then
        echo -ne "${str}" && return 0
    fi
    echo -ne "\x01\e[30m\x02${str}\x01\e[0m\x02"
}

##
# Colorizes a string in red color.
#
# @param string ${1} String.
#
# @output string Colorized string.
# @return int `0` (true) on success.
##
function :chalk-red() {
    local str="${1:-}"

    if ! :is-term-16-colors; then
        echo -ne "${str}" && return 0
    fi
    echo -ne "\x01\e[31m\x02${str}\x01\e[0m\x02"
}

##
# Colorizes a string in green color.
#
# @param string ${1} String.
#
# @output string Colorized string.
# @return int `0` (true) on success.
##
function :chalk-green() {
    local str="${1:-}"

    if ! :is-term-16-colors; then
        echo -ne "${str}" && return 0
    fi
    echo -ne "\x01\e[32m\x02${str}\x01\e[0m\x02"
}

##
# Colorizes a string in yellow color.
#
# @param string ${1} String.
#
# @output string Colorized string.
# @return int `0` (true) on success.
##
function :chalk-yellow() {
    local str="${1:-}"

    if ! :is-term-16-colors; then
        echo -ne "${str}" && return 0
    fi
    echo -ne "\x01\e[33m\x02${str}\x01\e[0m\x02"
}

##
# Colorizes a string in blue color.
#
# @param string ${1} String.
#
# @output string Colorized string.
# @return int `0` (true) on success.
##
function :chalk-blue() {
    local str="${1:-}"

    if ! :is-term-16-colors; then
        echo -ne "${str}" && return 0
    fi
    echo -ne "\x01\e[34m\x02${str}\x01\e[0m\x02"
}

##
# Colorizes a string in magenta color.
#
# @param string ${1} String.
#
# @output string Colorized string.
# @return int `0` (true) on success.
##
function :chalk-magenta() {
    local str="${1:-}"

    if ! :is-term-16-colors; then
        echo -ne "${str}" && return 0
    fi
    echo -ne "\x01\e[35m\x02${str}\x01\e[0m\x02"
}

##
# Colorizes a string in cyan color.
#
# @param string ${1} String.
#
# @output string Colorized string.
# @return int `0` (true) on success.
##
function :chalk-cyan() {
    local str="${1:-}"

    if ! :is-term-16-colors; then
        echo -ne "${str}" && return 0
    fi
    echo -ne "\x01\e[36m\x02${str}\x01\e[0m\x02"
}

##
# Colorizes a string in light gray color.
#
# @param string ${1} String.
#
# @output string Colorized string.
# @return int `0` (true) on success.
##
function :chalk-light-gray() {
    local str="${1:-}"

    if ! :is-term-16-colors; then
        echo -ne "${str}" && return 0
    fi
    echo -ne "\x01\e[37m\x02${str}\x01\e[0m\x02"
}

##
# Colorizes a string in light red color.
#
# @param string ${1} String.
#
# @output string Colorized string.
# @return int `0` (true) on success.
##
function :chalk-light-red() {
    local str="${1:-}"

    if ! :is-term-16-colors; then
        echo -ne "${str}" && return 0
    fi
    echo -ne "\x01\e[91m\x02${str}\x01\e[0m\x02"
}

##
# Colorizes a string in light green color.
#
# @param string ${1} String.
#
# @output string Colorized string.
# @return int `0` (true) on success.
##
function :chalk-light-green() {
    local str="${1:-}"

    if ! :is-term-16-colors; then
        echo -ne "${str}" && return 0
    fi
    echo -ne "\x01\e[92m\x02${str}\x01\e[0m\x02"
}

##
# Colorizes a string in light yellow color.
#
# @param string ${1} String.
#
# @output string Colorized string.
# @return int `0` (true) on success.
##
function :chalk-light-yellow() {
    local str="${1:-}"

    if ! :is-term-16-colors; then
        echo -ne "${str}" && return 0
    fi
    echo -ne "\x01\e[93m\x02${str}\x01\e[0m\x02"
}

##
# Colorizes a string in light blue color.
#
# @param string ${1} String.
#
# @output string Colorized string.
# @return int `0` (true) on success.
##
function :chalk-light-blue() {
    local str="${1:-}"

    if ! :is-term-16-colors; then
        echo -ne "${str}" && return 0
    fi
    echo -ne "\x01\e[94m\x02${str}\x01\e[0m\x02"
}

##
# Colorizes a string in light magenta color.
#
# @param string ${1} String.
#
# @output string Colorized string.
# @return int `0` (true) on success.
##
function :chalk-light-magenta() {
    local str="${1:-}"

    if ! :is-term-16-colors; then
        echo -ne "${str}" && return 0
    fi
    echo -ne "\x01\e[95m\x02${str}\x01\e[0m\x02"
}

##
# Colorizes a string in light cyan color.
#
# @param string ${1} String.
#
# @output string Colorized string.
# @return int `0` (true) on success.
##
function :chalk-light-cyan() {
    local str="${1:-}"

    if ! :is-term-16-colors; then
        echo -ne "${str}" && return 0
    fi
    echo -ne "\x01\e[96m\x02${str}\x01\e[0m\x02"
}

##
# Colorizes a string in white color.
#
# @param string ${1} String.
#
# @output string Colorized string.
# @return int `0` (true) on success.
##
function :chalk-white() {
    local str="${1:-}"

    if ! :is-term-16-colors; then
        echo -ne "${str}" && return 0
    fi
    echo -ne "\x01\e[97m\x02${str}\x01\e[0m\x02"
}

##
# Named output utilities following Bootstrap convention.
# Colors are explicit, but adapt to light|dark backgrounds.
##

##
# Outputs a string.
#
# @param string ${1} String.
#
# @output string Colorized string.
# @return int `0` (true) on success.
##
function :chalk-output() {
    local str="${1:-}"
    echo -e "${str}"
}

##
# Outputs a new line.
#
# @output string New line.
# @return int `0` (true) on success.
##
function :chalk-new-line() { echo; }

##
# Outputs a horizontal line.
# Exactly 75 bytes in length.
#
# @output string Horizontal line.
# @return int `0` (true) on success.
##
function :chalk-horiz-line {
    local color="${1:-}"
    local line='---------------------------------------------------------------------------'

    if [[ -n "${color}" ]]; then
        echo -e "$(:chalk-"${color}" "${line}")"
    else
        echo -e "${line}"
    fi
}

##
# Outputs a string in heading color.
#
# @param string ${1} String.
#
# @output string Colorized string.
# @return int `0` (true) on success.
##
function :chalk-heading() {
    local str="${1:-}"

    if ! :is-term-256-colors; then
        echo -e "${str}"
    elif :is-term-on-dark-bg; then
        echo -e "\x01\e[38;5;212m\x02\x01\e[1m\x02${str}\x01\e[0m\x02"
    else
        echo -e "\x01\e[38;5;132m\x02\x01\e[1m\x02${str}\x01\e[0m\x02"
    fi
}

##
# Outputs a string in default color (dimmed).
#
# Typically used to output verbose details.
#
# @param string ${1} String.
#
# @output string Colorized string.
# @return int `0` (true) on success.
##
function :chalk-log() {
    local str="${1:-}"

    if ! :is-term-256-colors; then
        echo -e "${str}"
    elif :is-term-on-dark-bg; then
        echo -e "\x01\e[38;5;255m\x02\x01\e[2m\x02${str}\x01\e[0m\x02"
    else
        echo -e "\x01\e[38;5;232m\x02\x01\e[2m\x02${str}\x01\e[0m\x02"
    fi
}

##
# Outputs string in a dynamic blue color.
#
# @param string ${1} String.
#
# @output string Colorized string.
# @return int `0` (true) on success.
##
function :chalk-info() {
    local str="${1:-}"

    if ! :is-term-256-colors; then
        echo -e "${str}"
    elif :is-term-on-dark-bg; then
        echo -e "\x01\e[38;5;39m\x02\x01\e[1m\x02${str}\x01\e[0m\x02"
    else
        echo -e "\x01\e[38;5;26m\x02\x01\e[1m\x02${str}\x01\e[0m\x02"
    fi
}

##
# Outputs string in a dynamic blue color (hilite variant).
#
# Uses a background behind white text to grab extra attention.
#
# @param string ${1} String.
#
# @output string Colorized string.
# @return int `0` (true) on success.
##
function :chalk-info-hilite() {
    local str="${1:-}"

    if ! :is-term-256-colors; then
        echo -e "${str}"
    else
        echo -e "\x01\e[38;5;255m\x02\x01\e[48;5;26m\x02\x01\e[1m\x02${str}\x01\e[0m\x02"
    fi
}

##
# Outputs string in a dynamic orange color.
#
# @param string ${1} String.
#
# @output string Colorized string.
# @return int `0` (true) on success.
##
function :chalk-warning() {
    local str="${1:-}"

    if ! :is-term-256-colors; then
        echo -e "${str}"
    elif :is-term-on-dark-bg; then
        echo -e "\x01\e[38;5;214m\x02\x01\e[1m\x02${str}\x01\e[0m\x02"
    else
        echo -e "\x01\e[38;5;130m\x02\x01\e[1m\x02${str}\x01\e[0m\x02"
    fi
}

##
# Outputs string in a dynamic orange color (hilite variant).
#
# Uses a background behind white text to grab extra attention.
#
# @param string ${1} String.
#
# @output string Colorized string.
# @return int `0` (true) on success.
##
function :chalk-warning-hilite() {
    local str="${1:-}"

    if ! :is-term-256-colors; then
        echo -e "${str}"
    else
        echo -e "\x01\e[38;5;255m\x02\x01\e[48;5;130m\x02\x01\e[1m\x02${str}\x01\e[0m\x02"
    fi
}

##
# Outputs string in a dynamic red color.
#
# @param string ${1} String.
#
# @output string Colorized string.
# @return int `0` (true) on success.
##
function :chalk-danger() {
    local str="${1:-}"

    if ! :is-term-256-colors; then
        echo -e "${str}"
    elif :is-term-on-dark-bg; then
        echo -e "\x01\e[38;5;203m\x02\x01\e[1m\x02${str}\x01\e[0m\x02"
    else
        echo -e "\x01\e[38;5;124m\x02\x01\e[1m\x02${str}\x01\e[0m\x02"
    fi
}

##
# Outputs string in a dynamic red color (hilite variant).
#
# Uses a background behind white text to grab extra attention.
#
# @param string ${1} String.
#
# @output string Colorized string.
# @return int `0` (true) on success.
##
function :chalk-danger-hilite() {
    local str="${1:-}"

    if ! :is-term-256-colors; then
        echo -e "${str}"
    else
        echo -e "\x01\e[38;5;255m\x02\x01\e[48;5;124m\x02\x01\e[1m\x02${str}\x01\e[0m\x02"
    fi
}

##
# Outputs string in a dynamic green color.
#
# @param string ${1} String.
#
# @output string Colorized string.
# @return int `0` (true) on success.
##
function :chalk-success() {
    local str="${1:-}"

    if ! :is-term-256-colors; then
        echo -e "${str}"
    elif :is-term-on-dark-bg; then
        echo -e "\x01\e[38;5;41m\x02\x01\e[1m\x02${str}\x01\e[0m\x02"
    else
        echo -e "\x01\e[38;5;28m\x02\x01\e[1m\x02${str}\x01\e[0m\x02"
    fi
}

##
# Outputs string in a dynamic green color (hilite variant).
#
# Uses a background behind white text to grab extra attention.
#
# @param string ${1} String.
#
# @output string Colorized string.
# @return int `0` (true) on success.
##
function :chalk-success-hilite() {
    local str="${1:-}"

    if ! :is-term-256-colors; then
        echo -e "${str}"
    else
        echo -e "\x01\e[38;5;255m\x02\x01\e[48;5;28m\x02\x01\e[1m\x02${str}\x01\e[0m\x02"
    fi
}
