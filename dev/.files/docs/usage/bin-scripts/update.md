# `dev/.files/bin/update.js`

See Also: [Prerequisites](./prerequisites.md)

All updates _must_ be performed interactively.

## Updates Dotfiles

```bash
$ npm run update:dotfiles
```

-   Git-commits any pending changes prior to running whenever this script is run from the `@clevercanyon/skeleton` project. This is to avoid a devastating loss of all changes prior to a self-update in the `@clevercanyon/skeleton`.

-   Downloads, or pulls from cache, the latest `@clevercanyon/skeleton` containing our master copy of `dev/.files` and the accompanying project dotfiles found in the main `@clevercanyon/skeleton` project directory.

-   Runs dotfiles update using latest `dev/.files/bin/updater/index.js` from `@clevercanyon/skeleton`. This will update the entire `dev/.files` directory and process updates across all the accompanying project dotfiles found in the main `@clevercanyon/skeleton` project directory. Any `<custom:start></custom:end>` sections will be preserved.

-   A few properties in `package.json` will be reset to their expected values during the update. For a detailed look at which `package.json` properties you should never change, or they'll be lost during a dotfiles update, please review `dev/.files/bin/updater/data/package.json/updates.json`.

## Updates Dotfiles + Project

```bash
$ npm run update:project
```

-   Updates dotfiles (see details above).
-   Runs `npm update --ignore-scripts --save`, updating NPM packages.
-   If it's a dotenv vault; re-encrypts the `.env.vault` to reflect any `.env` file changes.
-   Updates the project build (`--mode=prod`) located in `dist/` directory.

## Updates Dotfiles + Project + Repos

```bash
$ npm run update:project:repos
```

-   Updates dotfiles (see details above).
-   Also updates project (see details above).
-   If `--pkgs` is also set and it's an NPM package in a publishable branch/state, the `--repos` update also performs an NPM version bump and git commit with the expectation that a rebuild is about to occur, which needs the bumped version, and that (see below) a publish event will occur after other updates are finished.
-   If it's a git repo; adds, commits, and pushes to current branch.
-   If it's a dotenv vault; pushes current copy of all envs to remote vault.

## Updates Dotfiles + Project + Repos + Pkgs

```bash
$ npm run update:project:repos:pkgs
```

-   Updates dotfiles (see details above).
-   Also updates project (see details above).
-   Also updates project repos (see details above).
-   If it's an NPM package in a publishable branch/state, this runs `npm publish --ignore-scripts`, effectively deploying the updated package to the NPM repository.

## Help

```bash
$ npm run update:help
```

---

## Updating Multiple Projects

When updating multiple projects, the `./update.js` script simply steps up one directory level and looks for sibling project directories with a customizable set of glob and ignore patterns, as described below. After globbing, matching project directories, or deeper, can be updated all in a single command, saving an enormous amount of time.

### Recommended Project Directory Tree Structure

```text
~/Projects/clevercanyon
 - skeleton
 - utilities
 - forks
   - project.fork
 - foobar
 - etc., etc.
```

With this structure, all `clevercanyon` projects are together. If you are working in the `foobar` project and do an `$ npm run update:projects::dotfiles`, the script steps up one directory to `~/Projects/clevercanyon` where it globs for siblings. In the matching directories, it updates each of their dotfiles.

By default, the glob pattern is `*`, matching all direct siblings. However, if any of the glob patterns is set to a single `*` (as in the default case), scripts are only run if the project directory contains a `dev/.files` directory and a `package.json` file.

When the glob pattern is set to something else, you must be sure of what you're doing because the restriction is no longer applied and all scripts and/or custom commands will run as requested with no validation. For this reason it is **strongly suggested** that you do a `--dryRun` and review carefully.

### Updates Dotfiles

```bash
$ npm run update:projects::dotfiles -- --dryRun
```

-   Updates dotfiles in all matching directories (see details above).

### Updates Dotfiles + Project

```bash
$ npm run update:projects::project -- --dryRun
```

-   Updates dotfiles in all matching directories (see details above).
-   Also updates project in all matching directories (see details above).

### Updates Dotfiles + Project + Repos

```bash
$ npm run update:projects::project:repos -- --dryRun
```

-   Updates dotfiles in all matching directories (see details above).
-   Also updates project in all matching directories (see details above).
-   Also updates project repos in all matching directories (see details above).

### Updates Dotfiles + Project + Repos + Pkgs

```bash
$ npm run update:projects::project:repos:pkgs -- --dryRun
```

-   Updates dotfiles in all matching directories (see details above).
-   Also updates project in all matching directories (see details above).
-   Also updates project repos in all matching directories (see details above).
-   Also updates packages in all matching directories (see details above).

### Updates Projects by Running a Custom Command

```bash
$ npm run update:projects:: -- --cmd 'git checkout main' --dryRun
```

### Updates Projects by Running NPM Scripts

```bash
$ npm run update:projects:: -- --run script:one script:two script:three --dryRun
```

### Updates w/ Custom Globs, Ignores + a Few Tips

You can combine `--cmd` with `--run`. Note: `--cmd` always runs first, no matter what order you give.

```bash
$ npm run update:projects:: -- \
	--glob 'foo-*' --ignore 'foo-{utils,addons}' \
	--cmd 'git add --all && git commit -m "Message" && git push && git checkout main' \
	--run script:one script:two script:three \
	--dryRun
```

You can pass more than a single glob pattern, and more than a single ignore pattern.

```bash
$ npm run update:projects:: -- \
	--glob 'foo' 'bar-{two,three,four}' 'baz-*-utils' \
	--ignore 'baz-foo-utils' 'baz-bar-utils' \
	--cmd 'git add --all && git commit -m "Message" && git push && git checkout main' \
	--run script:one script:two script:three \
	--dryRun
```

If you need more control over sequence, consider putting everything in a custom CMD.

```bash
# Tip: Save repeated commands in a variable.
$ gitACP='git add --all && git commit -m "Message" && git push';

$ cmd="${gitACP}"; # Commit and push changes before starting.
$ cmd+=' && git checkout main && npm run script:one && '"${gitACP}";
$ cmd+=' && git checkout dev && npm run script:one && '"${gitACP}";

$ npm run update:projects:: -- \
	--glob 'foo' 'bar-{two,three,four}' 'baz-*-utils' \
	--ignore 'baz-foo-utils' 'baz-bar-utils' \
	--cmd '"${cmd}"' \
	--dryRun
```

### Help

```bash
$ npm run update:projects::help
```

## Non-Interactive Updates

Not permissable at this time. All updates _must_ be performed interactively.
