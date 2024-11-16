const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgres://postgres.pjdsnkvwpunlyovdtelx:Spectral5.095!@aws-0-eu-west-2.pooler.supabase.com:6543/postgres',
});

client.connect()
  .then(() => console.log('Connected successfully'))
  .catch(e => console.log(e))
  .finally(() => client.end());
