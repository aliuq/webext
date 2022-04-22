import { resolve } from 'path'
import { bgCyan, black } from 'kolorist'

export const port = parseInt(process.env.PORT || '') || 3303
export const r = (...args: string[]) => resolve(__dirname, '..', ...args)
export const isDev = process.env.NODE_ENV !== 'production'

export function log(name?: string, message?: string) {
  // eslint-disable-next-line no-console
  if (!name) {
    console.log()
    return
  }
  console.log(black(bgCyan(` ${name} `)), message)
}

interface ParseArgs {
  maps?: Record<string, any>
  start?: number
  serialize?: (value: any, key: string) => any
}

export function parseArgs<T extends {}>(options: ParseArgs): T {
  const {
    maps = {},
    start = 2,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    serialize = (value: any, key: string) => value,
  } = options
  const args = process.argv.slice(start)
  const result: Pick<T, any> = {}

  const isMatchKey = (key: string) => key.match(/^--(.+)/)
  const isMatchShortKey = (key: string) => key.match(/^-([a-zA-Z])/)
  const validKey = (key: string) => isMatchKey(key) || isMatchShortKey(key)
  const getRealKey = (key: string, maps: Record<string, any> = {}) => {
    if (isMatchKey(key))
      return key.replace(/^--/, '')
    if (isMatchShortKey(key))
      return maps[key.replace(/^-/, '')]
  }

  for (let i = 0; i < args.length; i++) {
    if (!validKey(args[i]))
      continue

    const _key = getRealKey(args[i], maps)
    const nextKey = args[i + 1]
    if (_key)
      result[_key] = nextKey && !validKey(nextKey) ? serialize(nextKey, _key) : true
  }

  return result
}
