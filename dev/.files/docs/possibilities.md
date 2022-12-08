# `appType` + `targetEnv` Possibilities

## Default Skeleton + Dependencies

- [clevercanyon/skeleton](https://github.com/clevercanyon/skeleton) (`custom` on `any`)  
  **+** [clevercanyon/skeleton-dev-deps](https://github.com/clevercanyon/skeleton-dev-deps)

## Naming Convention

All skeleton repos should have a name in this format, at minimum.

- `clevercanyon/skeleton`.`[app-type]`.`[target-env]`

Skeleton variants should use a `.` separator preceding their slug.

- `clevercanyon/skeleton`.`[app-type]`.`[target-env]`.`[variant]`

## All Possible Combinations

Our build system supports `appType` on `targetEnv` directives. However, not all combinations
actually make sense. For example, we're not likely to create a `multipage` app and target a
`webw` environment. The same with `multipage` on `any`, because a multipage app needs to target
something that will serve it as HTML. Likewise, creating a `custom` on `cfp` app makes little sense.
Instead, we'd create a `multipage` on `cfp` app.

### Multipage Apps

- clevercanyon/skeleton.multipage `any`
- clevercanyon/skeleton.multipage.cfp
- clevercanyon/skeleton.multipage.cfw
- clevercanyon/skeleton.multipage.node
- clevercanyon/skeleton.multipage.web
- clevercanyon/skeleton.multipage.webw

### Custom Apps

- clevercanyon/skeleton (`custom` on `any`)
- clevercanyon/skeleton.custom.cfp
- clevercanyon/skeleton.custom.cfw
- clevercanyon/skeleton.custom.node
- clevercanyon/skeleton.custom.web
- clevercanyon/skeleton.custom.webw

## All Rational Combinations

These lists include those from above that actually make sense, at least in theory.

### Multipage Apps

- clevercanyon/skeleton.multipage.cfp
- clevercanyon/skeleton.multipage.cfw
- clevercanyon/skeleton.multipage.node
- clevercanyon/skeleton.multipage.web

### Custom Apps

- clevercanyon/skeleton (`custom` on `any`)
- clevercanyon/skeleton.custom.cfw
- clevercanyon/skeleton.custom.node
- clevercanyon/skeleton.custom.web
- clevercanyon/skeleton.custom.webw

## Skeletons We Actually Need

What do we really care about most, or will likely need?

### Multipage Apps

- [clevercanyon/skeleton.multipage.cfp](#): Multipage or single-page React apps with static assets,
  functions, routes, middleware, and more. This covers most of our needs for general sites,
  services, and even purpose-built apps.

### Custom Apps

- [clevercanyon/skeleton](https://github.com/clevercanyon/skeleton) (`custom` on `any`)
	- Base skeleton that all others extend in some way and have their dotfiles updated by.

- [clevercanyon/skeleton.custom.cfw](#)
	- Purpose-built Cloudflare workers for backend APIs and microservices. Let's create this
	  skeleton along with variants that cover common use cases; e.g., scheduled events.

- [clevercanyon/skeleton.custom.node](#)
	- NPM packages targeting Node. Let's create this skeleton along with variants that cover common
	  use cases; e.g., CLI tools.

- [clevercanyon/skeleton.custom.web](#)
	- NPM packages targeting web browsers. Let's create this skeleton along with variants that cover
	  common use cases; e.g., UI, React components.

- [clevercanyon/skeleton.custom.webw](#)
	- NPM packages. Scaffolding for workers that run in a browser.
