# Prerequisites

## macOS

macOS is required to work as a Clever Canyon developer. An M1 Pro chipset, or better, is strongly suggested. We no longer support the older intel chips in any of our supporting documentation. Also, please update to macOS Ventura or higher.

## Homebrew for macOS

```bash
$ xcode-select --install
$ /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
$ brew install mas # macOS app store for Homebrew. Not required, but recommended.
```

_**Note:** On M1 MacBooks, Homebrew installs into `/opt/homebrew` instead of `/usr/local`. If you have a `PATH` configured that’s expecting to find binaries in `/usr/local/bin` you will need to update those to `/opt/homebrew/bin` instead._

## Bash via Homebrew

macOS ships with an old version of bash. Homebrew installs the latest version. You need to install the latest version of bash for scripting needs; i.e., even if you’re not using bash as your preferred shell, you still need to install the latest version of bash.

```bash
$ brew install bash
$ brew install bash-completion@2 # Not required, but recommended.
```

## Git via Homebrew

macOS ships with an old version of git. Homebrew installs the latest version.

```bash
$ brew install git
$ brew install git-lfs # Not required, but recommended.
$ brew install gh      # Not required, but recommended.
```

`git lfs` is for large file storage. See: [git-lfs.com](https://git-lfs.com).

Regarding `hub`. We recommend the new `gh` (GitHub CLI) over `hub`.

-   `gh`: <https://cli.github.com> (new)
    -   <https://github.com/cli/cli/blob/trunk/docs/gh-vs-hub.md>
-   `hub`: <https://github.com/github/hub> (old)
    -   <https://github.com/github/hub#aliasing>

## `n`: Interactively Manage Node Versions

The `n` package allows you to juggle Node versions, as required, for various needs.

### Step 1: Uninstall Brew's Node

Other packages depend on Node and may have installed Node even if you haven't done so yourself yet. Please be sure to complete all of these steps to avoid conflicts with `n` for Node version management.

```bash
$ brew uninstall --ignore-dependencies node
$ brew uninstall --force node

$ rm --force --recursive /opt/homebrew/lib/node_modules
$ brew cleanup # Removes broken node module symlinks.
```

### Step 2: Install `n` for Node Version Management

```bash
$ brew install n # Includes NPM + corepack.
```

### Step 3: Customize `n` for Node Version Management

Set the `N_PREFIX` location to `/opt/homebrew/opt/n.node` (recommended) by adding this line to your macOS `~/.profile`.

```bash
export N_PREFIX=/opt/homebrew/opt/n.node
```

Add `/opt/homebrew/opt/n.node/bin` to your `PATH` by adding these lines to your macOS `~/.profile`.

```bash
PATH=/opt/homebrew/opt/n.node/bin:"${PATH}"
MANPATH=/opt/homebrew/opt/n.node/share/man:"${MANPATH}"
INFOPATH=/opt/homebrew/opt/n.node/share/info:"${INFOPATH}"
```

### Step 4: Enable Corepack w/ Yarn

Clever Canyon doesn't use Yarn, but you should enable in case Yarn is needed for other projects.

```bash
$ corepack enable
```

### Step 5: Enable Node ^19.2.0

Clever Canyon projects require Node ^19.2.0 and NPM ^8.19.3 that comes with it when using `n`.

```bash
$ n 19.2.0 # Includes NPM ^8.19.3.
```

### Step 6. Optionally Enable NPM Completion

The below assumes bash. You may need to adjust if you're using zsh, for example.

```bash
$ npm completion > /opt/homebrew/etc/bash_completion.d/npm
# See: <https://docs.npmjs.com/cli/commands/npm-completion>
```

## Environment Variables

These environment variables authenticate you as a Clever Canyon developer. Please add the following lines to your macOS `~/.profile`.There are details below that help with token generation, for each of these. Please read carefully.

```bash
export USER_GITHUB_TOKEN='your_token_goes_here'
export USER_NPM_TOKEN='your_token_goes_here'
export USER_CLOUDFLARE_TOKEN='your_token_goes_here'
```

### `USER_GITHUB_TOKEN`

-   Contact @jaswrks or @bruckwrks to request access to the Clever Canyon organization on GitHub.
-   Create a personal **classic** (aka: legacy) access token. Select scope `repo`, at minimum.
    -   See: <https://github.com/settings/tokens/new>

### `USER_NPM_TOKEN`

-   Contact @jaswrks or @bruckwrks to request access to the Clever Canyon organization on NPM.
-   Create a personal **classic** (aka: legacy) access token. Choose **automation** as the token type.
    -   See: <https://docs.npmjs.com/about-access-tokens>

### `USER_CLOUDFLARE_TOKEN`

-   Contact @jaswrks or @bruckwrks to request access to the Clever Canyon organization on Cloudflare.
-   Create a personal API token using Cloudflare's **Edit Cloudflare Workers** template type, which predefines all of the necessary/mininum permissions. Set **Account Resources** to include Clever Canyon, at minimum. Set **Zone Resources** to include all zones from Clever Canyon, at minimum.
    -   See: <https://dash.cloudflare.com/profile/api-tokens>

## Dotenv Vault Account Access

You will also need access to Clever Canyon’s [Dotenv Vault](https://www.dotenv.org).

-   Contact @jaswrks or @bruckwrks to request Clever Canyon org access at Dotenv Vault.
-   No token is needed. Dotenv Vault developer authentication must occur in a web browser. If you're working on repos where CLI scripts keep opening browser tabs asking for your Dotenv Vault login credentials, that's why. To resolve, contact @jaswrks or @bruckwrks to request Clever Canyon org access at Dotenv Vault.
