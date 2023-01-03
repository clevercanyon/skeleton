# `update.js`

## Interactive Updates

### Help

```bash
$ npm run update: -- --help
```

### Updates Dotfiles

```bash
$ npm run update:dotfiles
```

### Updates Dotfiles + Project

```bash
$ npm run update:project
```

### Updates Dotfiles + Project + Repos

```bash
$ npm run update:project:repos
```

### Updates Dotfiles + Project + Repos + Pkgs

```bash
$ npm run update:project:repos:pkgs
```

## Interactively Updating Multiple Projects

### Help

```bash
$ npm run update:projects:: -- --help
```

### Updates Dotfiles

```bash
$ npm run update:projects::dotfiles
```

### Updates Dotfiles + Project

```bash
$ npm run update:projects::project
```

### Updates Dotfiles + Project + Repos

```bash
$ npm run update:projects::project:repos
```

### Updates Dotfiles + Project + Repos + Pkgs

```bash
$ npm run update:projects::project:repos:pkgs
```

### Updates w/ Custom Scripts in Sequence

```bash
$ npm run update:projects:: -- --run [script] [script] [script] ... [script]
```

### Updates w/ Custom CMD + Args

```bash
$ npm run update:projects:: -- --cmdArgs [command] [arg] [arg] ... [arg]
```

### Updates w/ Custom Glob, Ignores, and More

```bash
$ npm run update:projects:: -- \
	--glob 'foo-*' --ignore 'foo-{utils,addons}' \
	--run 'npm-script-one' 'npm-script-two' 'npm-script-three'
	--cmd 'git checkout main'
```

```bash
$ npm run update:projects:: -- \
	--glob 'foo' 'bar-{two,three,four}' 'baz-*-utils' \
	--ignore 'baz-foo-utils' 'baz-bar-utils' \
	--run script-one script-two script-three
	--cmdArgs 'git status --short'
```

## Non-Interactive Updates

Not permissable at this time. Updates _must_ be performed interactively.
