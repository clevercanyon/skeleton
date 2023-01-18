#!/usr/bin/env bash
##
# NPM 2-script proxy.
#
# This proxies an NPM script for the purpose of running CMD 1, then CMD 2;
# i.e., when an NPM script is configured such that it needs to run two scripts.
#
# Without this proxy, CMD 1 would not receive user-supplied arguments given to `npm run [script] -- [args]`.
# For example, if a user types `$ npm run update:project --dryRun` and we need to configure and run two scripts,
# only the second script would receive the `--dryRun` argument, which could potentially end in a disaster.
#
# A similar, albeit, less serious, problem arises in `--help` or `--version` modes.
# These two additional cases are also accounted for by this proxy.
#
# Note: Everything here logs to stderr so we don't interfere with proxied output to stdout stream.
##

__dirname="$(cd "$(dirname "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"
[[ -d "${__dirname}" ]] || { echo 'Missing `__dirname`!' >&2 && exit 1; }
. "${__dirname}"/utilities/load.bash || { echo 'Missing utilities!' >&2 && exit 1; }

##
# Project directory.
##

cd "${__dirname}"/../../../.. || { :chalk-danger '`cd` failure.' >&2 && exit 1; }
proj_dir="$(pwd)" # Now operating from project directory.

##
# Utility functions.
##

function is-cmd-safe-to-run() {
    [[ "${1:-}" =~ ^(git|npm|npx)[[:space:]] ]] || is-cmd-in-dev-bin "${1:-}"
}

function is-cmd-help-or-version() {
    [[ "${1:-}" =~ (^|[[:space:]])(-(h|v)|--(help|version))($|[[:space:]]) ]]
}

function is-cmd-dry-run() {
    [[ "${1:-}" =~ (^|[[:space:]])(--dry(Run|-run))($|[[:space:]]) ]]
}

function is-cmd-in-dev-bin() {
    [[ "${1:-}" =~ ^\.\/dev\/\.files\/bin\/ ]]
}

function is-cmd-an-npm-script-in-dev-bin() {
    [[ "${1:-}" =~ ^npm[[:space:]]+run(-script)?[[:space:]]+(envs|install|update)\: ]]
}

function is-cmd-an-npm-install() {
    # https://docs.npmjs.com/cli/commands/npm-ci
    # https://docs.npmjs.com/cli/commands/npm-install
    [[ "${1:-}" =~ ^npm[[:space:]](ci|clean-install|install-clean|isntall-clean|i|in|ins|inst|insta|instal|isnt|isnta|isntal|install)($|[[:space:]]) ]]
}

function proxy-cmd() {
    set +o errexit  # Disable.
    set +o errtrace # Disable.
    trap - ERR      # Disable.
    [[ -n "${1:-}" ]] && /usr/bin/env sh -c "${1}"
}

##
# Validation routines.
##

cmd1="${*:1:1}"
cmd2="${*:2:1}"
cmd2_args="${*:3}"

if ! is-cmd-safe-to-run "${cmd1}"; then
    :chalk-danger 'Insecure; refusing to proxy CMD 1: `'"${cmd1}"'`' >&2
    exit 1 # Security issue; error status.

elif ! is-cmd-safe-to-run "${cmd2}"; then
    :chalk-danger 'Insecure; refusing to proxy CMD 2: `'"${cmd2}"'`' >&2
    exit 1 # Security issue; error status.
fi

##
# Proxies `${cmd1}` (maybe), then `${cmd2}`.
##

if is-cmd-an-npm-install "${cmd1}" && [[ "${cmd2}" =~ ^\.\/dev\/\.files\/bin\/install\.js$ && -d "${proj_dir}"/node_modules ]]; then
    :chalk-log 'Skipping `'"${cmd1}"'` in favor of `'"${cmd2}"'`.' >&2
    proxy-cmd "${cmd2} ${cmd2_args}"

elif ! is-cmd-an-npm-install "${cmd1}" && is-cmd-help-or-version "${cmd2_args}"; then
    :chalk-log 'Skipping `'"${cmd1}"'` when `'"${cmd2}"'` is in -h|-v|--help|--version mode.' >&2
    proxy-cmd "${cmd2} ${cmd2_args}"

elif is-cmd-dry-run "${cmd2_args}"; then
    if is-cmd-in-dev-bin "${cmd1}" || is-cmd-an-npm-script-in-dev-bin "${cmd1}"; then
        if is-cmd-in-dev-bin "${cmd1}" || [[ "${cmd1}" =~ [[:space:]]--[[:space:]] ]]; then
            proxy-cmd "${cmd1} --dryRun" && proxy-cmd "${cmd2} ${cmd2_args}"
        else
            proxy-cmd "${cmd1} -- --dryRun" && proxy-cmd "${cmd2} ${cmd2_args}"
        fi
    elif is-cmd-an-npm-install "${cmd1}"; then
        proxy-cmd "${cmd1}" && proxy-cmd "${cmd2} ${cmd2_args}"
    else
        :chalk-log 'Skipping `'"${cmd1}"'` when `'"${cmd2}"'` is a --dryRun.' >&2
    fi
else
    proxy-cmd "${cmd1}" && proxy-cmd "${cmd2} ${cmd2_args}"
fi
