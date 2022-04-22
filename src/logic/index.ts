import pkg from '../../package.json'
export * from './storage'

export function log(msg: any) {
  if (typeof msg === 'object')
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(msg, null, 2))
  else
    // eslint-disable-next-line no-console
    console.log(`[${pkg.displayName || pkg.name}] ${msg}`)
}
