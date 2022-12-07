## `appType` + `targetEnv` Possibilities

## Default Skeleton

- clevercanyon/skeleton (`custom` + `any`)
- ↑ clevercanyon/skeleton-dev-deps (dev dependencies)

## All Possible Combinations

Our build system supports `appType` on `targetEnv` directives. However, not all combinations
actually make sense. For example, one would never create a `multipage` app and target a
`web-worker` environment. The same with `multipage` on `any`, because a multipage app needs to
target something that will serve it as HTML. Likewise, creating a `custom` on `cf-pages` app makes
no sense. Instead, we'd create a `multipage` on `cf-pages` app.

### Multipage Apps

- clevercanyon/skeleton-multipage-any
- clevercanyon/skeleton-multipage-cf-pages
- clevercanyon/skeleton-multipage-cf-worker
- clevercanyon/skeleton-multipage-node
- clevercanyon/skeleton-multipage-web
- clevercanyon/skeleton-multipage-web-worker

### Custom Apps

- clevercanyon/skeleton (`custom` on `any`)
- clevercanyon/skeleton-custom-cf-pages
- clevercanyon/skeleton-custom-cf-worker
- clevercanyon/skeleton-custom-node
- clevercanyon/skeleton-custom-web
- clevercanyon/skeleton-custom-web-worker

## All Sensible Combinations

### Multipage Apps

- clevercanyon/skeleton-multipage-cf-pages
- clevercanyon/skeleton-multipage-cf-worker
- clevercanyon/skeleton-multipage-node
- clevercanyon/skeleton-multipage-web

### Custom Apps

- clevercanyon/skeleton (`custom` on `any`)
- clevercanyon/skeleton-custom-cf-worker
- clevercanyon/skeleton-custom-node
- clevercanyon/skeleton-custom-web
- clevercanyon/skeleton-custom-web-worker
