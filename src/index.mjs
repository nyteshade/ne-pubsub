const { PubSub, Logs, Errors } = await import('./pubsub.mjs')
const defaultObj = { PubSub, Logs, Errors }

export { defaultObj as default, PubSub, Logs, Errors }