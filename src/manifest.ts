import fs from 'fs-extra'
import type { Manifest } from 'webextension-polyfill'
import type PkgType from '../package.json'
import { r } from '../scripts/utils'

let isFirefox = process.env.TARGET === 'firefox'

export async function getManifest(target?: string) {
  const pkg = await fs.readJSON(r('package.json')) as typeof PkgType
  isFirefox = target ? target === 'firefox' : isFirefox

  const host_permissions = [
    '<all_urls>',
  ]

  const manifest: Manifest.WebExtensionManifest = {
    manifest_version: isFirefox ? 2 : 3,
    name: pkg.displayName || pkg.name,
    version: pkg.version,
    description: pkg.description,
    icons: {
      16: './assets/icon-512.png',
      48: './assets/icon-512.png',
      128: './assets/icon-512.png',
    },
    options_ui: {
      page: './dist/options/index.html',
      open_in_tab: true,
    },
    permissions: [
      'tabs',
      'storage',
      'activeTab',
    ],
    content_scripts: [{
      matches: host_permissions,
      js: ['./dist/contentScripts/index.global.js'],
    }],
  }

  const browser_action = {
    default_icon: './assets/icon-512.png',
    default_popup: './dist/popup/index.html',
  }
  const content_security_policy = 'script-src \'self\'; object-src \'self\''
  const backgroundScripts = './dist/background/background.js'
  const web_accessible_resources = ['dist/contentScripts/style.css']

  if (isFirefox) {
    manifest.browser_action = browser_action
    manifest.content_security_policy = content_security_policy
    manifest.permissions?.concat(host_permissions)
    manifest.background = { scripts: [backgroundScripts] }
    manifest.web_accessible_resources = web_accessible_resources
  }
  else {
    manifest.action = browser_action
    manifest.content_security_policy = { extension_pages: content_security_policy }
    manifest.host_permissions = host_permissions
    manifest.background = { service_worker: backgroundScripts }
    manifest.web_accessible_resources = [{ resources: web_accessible_resources, matches: ['<all_urls>'] }]
  }
  return manifest
}
