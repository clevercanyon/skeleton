# `install.js`

## Interactive Install

```bash
$ npm ci # Clean install.
# Triggers `postinstall` script: `./install.js project`.
```

## Non-Interactive Install

```bash
$ npm ci --include=dev --ignore-scripts # Bypasses `postinstall` script.
$ npm run postinstall -- --mode=[dev,ci,stage,prod] # With option to choose mode.
```
