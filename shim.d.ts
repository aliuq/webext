import type { ProtocolWithReturn } from 'webext-bridge'

declare module 'webext-bridge' {
  export interface ProtocolMap {
    // define message protocol types
    // see https://github.com/antfu/webext-bridge#type-safe-protocols
    'tab-prev': { title: string | undefined }
    'get-current-tab': ProtocolWithReturn<{ tabId: number }, { title?: string }>
    'modify-pages-changed': { source: string }
    'update-element': { status: boolean; source?: string }
    'copy-source': { source: string }
    'get-source': ProtocolWithReturn<{}, string | undefined>
  }
}

export interface Source {
  name: string
  repo: string
  branch?: string
  directory?: string
}

export interface BuildCliOptions {
  /**
   * Target platform
   */
  target: ['chromium' | 'firefox']
  /**
   * Production mode
   */
  prod: boolean
  /**
   * Extension name
   * @default `target` value
   */
  name?: string[] | undefined
}
