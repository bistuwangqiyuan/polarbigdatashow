const { neon } = require('@neondatabase/serverless')
const url = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL
const sql = neon(url)
sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`
  .then(rows => { console.log('Tables:', rows.map(r => r.table_name).join(', ')) })
  .catch(e => console.error(e.message))
