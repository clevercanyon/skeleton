#!/usr/bin/env bash

__dirname="$(cd "$(dirname "${BASH_SOURCE[0]}")" &>/dev/null && pwd)";
. "${__dirname}"/../strict-mode.bash;
. "${__dirname}"/../shell-options.bash;

if [[ "${*}" =~ (^|[[:space:]])(--dry(Run|-run))($|[[:space:]]) ]]; then
	"${__dirname}"/../../update.js dotfiles --dryRun;
else
	"${__dirname}"/../../update.js dotfiles;
fi;
"${@}";
