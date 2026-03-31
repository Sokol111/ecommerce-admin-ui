import { consola } from 'consola'

export default defineNitroPlugin(() => {
  if (import.meta.dev) return

  consola.setReporters([{
    log: (logObj) => {
      console.log(JSON.stringify({
        date: logObj.date.toISOString(),
        level: logObj.type,
        tag: logObj.tag || undefined,
        msg: logObj.args.map((a) => typeof a === 'string' ? a : JSON.stringify(a)).join(' ')
      }))
    }
  }])
})
