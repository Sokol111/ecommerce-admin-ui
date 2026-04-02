import { consola } from 'consola'

export default defineNitroPlugin(() => {
  for (let i = 1; i <= 50; i++) {
    consola.info(`[test] ecommerce-admin-ui info log #${i} — server running normally`)
    consola.warn(`[test] ecommerce-admin-ui warn log #${i} — cache miss detected`)
    consola.error(`[test] ecommerce-admin-ui error log #${i} — connection timeout`)
  }
})
