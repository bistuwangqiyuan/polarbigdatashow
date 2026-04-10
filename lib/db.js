import { neon } from '@neondatabase/serverless'

const databaseUrl = process.env.DATABASE_URL
  || process.env.NETLIFY_DATABASE_URL
  || null

export const isDatabaseConfigured = !!databaseUrl

let sqlClient = null

export function getSQL() {
  if (!isDatabaseConfigured) return null
  if (!sqlClient) {
    sqlClient = neon(databaseUrl)
  }
  return sqlClient
}

export const sql = isDatabaseConfigured ? neon(databaseUrl) : null
