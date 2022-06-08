
export const SERVER_PORT = process.env.SERVER_PORT ? Number(process.env.SERVER_PORT) : 8080
export const DEBUG = process.env.DEBUG === 'true'
export const LOGS_PATH = process.env.LOGS_PATH ?? 'server/logs'
