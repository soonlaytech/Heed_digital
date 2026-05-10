import pkg from 'pg';
const { Client } = pkg;

async function fixRole() {
  const client = new Client({
    connectionString: 'postgresql://postgres@localhost:5432/postgres',
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL');
    
    // Grant login permission
    await client.query('ALTER ROLE heed_user WITH LOGIN;');
    console.log('✓ Granted LOGIN permission to heed_user');
    
    // Grant database access
    await client.query('GRANT ALL PRIVILEGES ON DATABASE heed_db TO heed_user;');
    console.log('✓ Granted database privileges to heed_user');
    
    console.log('Database role setup complete!');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

fixRole();
