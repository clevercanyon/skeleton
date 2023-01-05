# Skeleton Project Templates

To start a new project with one of our skeletons, simply run:

```bash
$ cd ~/Projects/clevercanyon
$ npx degit clevercanyon/skeleton my-new-project --mode=git
```

-   Change `clevercanyon/skeleton` to [any other skeleton project](https://github.com/orgs/clevercanyon/repositories?q=skeleton) you'd like to start from.
-   Change `my-new-project` to the directory you'd like your new project to live in.

## Next Steps

```bash
$ cd ~/Projects/clevercanyon/my-new-project
$ npm run install:project # Installs NPM dependencies, envs, and builds project.
$ npm run envs:setup:new  # Interactively sets up new envs in Dotenv Vault for this project.
```

You will need a [Dotenv Vault](https://www.dotenv.org) login. Please contact `@jaswrks` to request access. You must also have an environment meeting all [prerequisites](./prerequisites.md), along with the additional credentials noted at the bottom of the prerequisites article.

## Help

```bash
$ npm run install:help
$ npm run envs:help
```
