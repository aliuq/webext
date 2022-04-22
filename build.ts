/* eslint-disable no-console */
import type { InlineConfig } from 'vite'
import { mergeConfig, build as viteBuild } from 'vite'
import WindiCSS from 'vite-plugin-windicss'
import chokidar from 'chokidar'
import fs from 'fs-extra'
import { blue, cyan, green, red, yellow } from 'kolorist'
import type { BuildCliOptions } from 'shim'
import { getManifest } from './src/manifest'
import { isDev as _isDev, log, parseArgs, r } from './scripts/utils'
import { sharedConfig } from './vite.config'
import windiConfig from './windi.config'
import packageJson from './package.json'

/**
 * If target is an array, because of the building is common and the only difference between firefox(mv2) and chrome(mv3),
 * so we need create a common directory for building, and then copy it to different target directory.
 */
const { target, prod, name } = parseArgs<BuildCliOptions>({
  maps: {
    t: 'target',
    p: 'prod',
    n: 'name',
  },
  serialize: (value: any, key) => {
    value = value.split(',')
    return value.length === 1 ? ['target', 'name'].includes(key) ? value : value[0] : value
  },
})
const isDev = typeof prod !== 'undefined' ? !prod : _isDev

const logError = (err: string) => {
  throw new Error(red(err))
}

function validBefore() {
  if (!target)
    logError(`Please specify target, like: ${green('esno build.ts -t firefox')}`)
  const invalidTarget = target.filter(t => !['chromium', 'firefox'].includes(t))
  if (invalidTarget.length)
    logError(`Invalid target: ${red(invalidTarget.join(', '))}`)
  if (name && name.length !== target.length)
    logError(`The length of target(t) and name(n) must be equal, but got ${target.length} target and ${name.length} name`)
}

// Check
validBefore()

const destName = name || target
const config: InlineConfig = {
  ...sharedConfig,
  build: {
    watch: isDev ? {} : undefined,
    cssCodeSplit: false,
    emptyOutDir: false,
    sourcemap: isDev ? 'inline' : false,
    minify: isDev ? 'esbuild' : 'terser',
    // https://developer.chrome.com/docs/webstore/program_policies/#:~:text=Code%20Readability%20Requirements
    terserOptions: {
      mangle: false,
      compress: {
        // 生产环境时移除console
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
  plugins: [
    ...sharedConfig.plugins!,

    // https://github.com/antfu/vite-plugin-windicss
    WindiCSS({
      config: {
        ...windiConfig,
        // disable preflight to avoid css population
        preflight: false,
      },
    }),
  ],
}
const logPlugin = (title: string, message: string) => ({
  name: title,
  enforce: 'pre',
  buildStart: () => log(title, message),
})
const copyPlugin = (title: string, dir: string) => ({
  name: `copy-assets-${title.toLowerCase()}`,
  writeBundle(_: any, assets: object) {
    const files = Object.keys(assets)
    target.map(async(t: string) => {
      files.map(async(file: string) => {
        await fs.copy(
          r(`extension/__COMMON__/dist/${dir}/${file}`),
          r(`extension/${t}/dist/${dir}/${file}`),
          { overwrite: true },
        )
        log(title, `Copied to ${green(r(`extension/${t}/dist/${dir}/${file}`))}`)
      })
    })
  },
})

// Copy assets to dist folder
async function copyAssets() {
  const assetsExists = await fs.pathExists(r('extension/assets'))
  if (!assetsExists) {
    log('PRE', `No assets folder found in ${yellow(r('extension/assets'))}`)
    return
  }
  return Promise.all(destName.map(async(name: string) => {
    const dest = r(`extension/${name}/assets`)
    const exists = await fs.pathExists(dest)
    if (exists) {
      log('PRE', `Assets exists at ${green(dest)}`)
      return
    }
    await fs.copy(r('extension/assets'), dest)
    log('PRE', `Copied assets done at ${green(dest)}`)
  }))
}
// Clear dist folder
async function clearDestination() {
  return Promise.all(destName.map(async(name: string) => {
    await fs.remove(r(`extension/${name}/dist`))
    log('PRE', `Cleared ${yellow(r(`extension/${name}/dist`))}`)
    await fs.remove(r(`extension/${name}/manifest.json`))
    log('PRE', `Cleared ${yellow(r(`extension/${name}/manifest.json`))}`)
  }))
}
// Create manifest.json
async function writeManifest() {
  return Promise.all(target.map(async(t: string, i: number) => {
    const dest = r(`extension/${destName[i]}/manifest.json`)
    await fs.writeJSON(dest, await getManifest(t), { spaces: 2 })
    log('PRE', `Wrote ${cyan(t)} manifest at ${green(dest)}`)
  }))
}
// Build popup
async function buildPopup() {
  log()
  const dest = r(`extension/${destName.length > 1 ? '__COMMON__' : destName[0]}/dist`)
  await viteBuild(mergeConfig(config, {
    base: '/dist/',
    build: {
      outDir: dest,
      rollupOptions: {
        input: {
          popup: r('src/popup/index.html'),
        },
      },
    },
    plugins: destName.length > 1 && [
      logPlugin('POPUP', 'Building popup'),
      copyPlugin('POPUP', '/'),
    ],
  }))
}
// Build popup
async function buildOptions() {
  log()
  const dest = r(`extension/${destName.length > 1 ? '__COMMON__' : destName[0]}/dist`)
  await viteBuild(mergeConfig(config, {
    base: '/dist/',
    build: {
      outDir: dest,
      rollupOptions: {
        input: {
          options: r('src/options/index.html'),
        },
      },
    },
    plugins: destName.length > 1 && [
      logPlugin('Options', 'Building options'),
      copyPlugin('Options', '/'),
    ],
  }))
}
// Build background scripts
async function buildBackground() {
  log()
  const dest = r(`extension/${destName.length > 1 ? '__COMMON__' : destName[0]}/dist/background`)
  await viteBuild(mergeConfig(config, {
    build: {
      outDir: dest,
      lib: {
        entry: r('src/background/main.ts'),
        formats: ['cjs'],
      },
      rollupOptions: {
        output: {
          entryFileNames: 'background.js',
          extend: true,
        },
      },
    },
    plugins: destName.length > 1 && [
      logPlugin('BACKGROUND', 'Building background.js'),
      copyPlugin('BACKGROUND', 'background'),
    ],
  }))
}
// Build content scripts
async function buildContent() {
  log()
  const dest = r(`extension/${destName.length > 1 ? '__COMMON__' : destName[0]}/dist/contentScripts`)
  await viteBuild(mergeConfig(config, {
    build: {
      outDir: dest,
      lib: {
        entry: r('src/contentScripts/index.ts'),
        name: packageJson.name,
        formats: ['iife'],
      },
      rollupOptions: {
        output: {
          entryFileNames: 'index.global.js',
          extend: true,
        },
      },
    },
    plugins: destName.length > 1 && [
      logPlugin('CONTENT SCRIPTS', 'Building content scripts'),
      copyPlugin('CONTENT SCRIPTS', 'contentScripts'),
    ],
  }))
}

async function build() {
  log('INFO', `Get ${target.length} targets - ${blue(target.join(', '))}`)
  log('INFO', `Get ${destName.length} destName, it will gererated in:\n${blue(destName.map(n => r(`extension/${n}`)).join('\n'))}`)

  destName.forEach(async(name: string) => {
    await fs.ensureDir(r(`extension/${name}`))
  })

  log()
  await clearDestination()
  await writeManifest()
  await copyAssets()
  await buildPopup()
  await buildOptions()
  await buildBackground()
  await buildContent()
}

build()

if (isDev) {
  chokidar.watch([r('src/manifest.ts'), r('package.json')])
    .on('change', async() => {
      await writeManifest()
    })
}
