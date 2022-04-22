# Webext

A Template for developing extension

Large references from [vitesse-webext](https://github.com/antfu/vitesse-webext), because of official repo has a mv3 developing branch and I modified the building process which contains some broken change different with branch, so I create a new repo here.

+ Support mv2 and mv3 development at the same time
+ Simplified building steps

## Development

```bash
# development
pnpm run dev:chromium
pnpm run start:chromium

# deploy
pnpm run build
pnpm run pack
```

## License

[MIT](./License)
