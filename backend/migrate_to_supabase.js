// =========================================================================
// MIGRACIÓN AUTOMATIZADA A SUPABASE CLOUD (POSTGRESQL)
// =========================================================================
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const connectionString = process.env.DATABASE_URL || process.argv[2];

if (!connectionString || connectionString.includes('[PROJECT-REF]') || connectionString.includes('[PASSWORD]')) {
  console.error('❌ Error: No se ha configurado una DATABASE_URL válida de Supabase.');
  console.log('📌 Uso: node backend/migrate_to_supabase.js "postgresql://postgres.xxx:tu_password@aws-0-xxx.pooler.supabase.com:6543/postgres"');
  console.log('   O agrega DATABASE_URL en backend/.env');
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000,
});

async function runMigration() {
  console.log('🚀 Conectando a Supabase Cloud...');
  const client = await pool.connect();
  try {
    console.log('✅ Conexión establecida con éxito a Supabase.');
    const sqlPath = path.join(__dirname, 'supabase_schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('📄 Ejecutando esquema estandarizado (supabase_schema.sql)...');
    await client.query(sql);

    console.log('----------------------------------------------------');
    console.log('🎉 ¡MIGRACIÓN COMPLETADA EXITOSAMENTE EN SUPABASE!');
    console.log('----------------------------------------------------');

    // Comprobación de conteos en Supabase
    const usersCount = await client.query('SELECT COUNT(*) FROM public.users');
    const vehCount = await client.query('SELECT COUNT(*) FROM public.vehicles');
    const leadsCount = await client.query('SELECT COUNT(*) FROM public.leads');
    const purchasesCount = await client.query('SELECT COUNT(*) FROM public.purchases');

    console.log(`📊 Usuarios registrados:   ${usersCount.rows[0].count}`);
    console.log(`🚗 Vehículos en catálogo:  ${vehCount.rows[0].count}`);
    console.log(`📋 Leads / Solicitudes:    ${leadsCount.rows[0].count}`);
    console.log(`🛒 Órdenes de compra:      ${purchasesCount.rows[0].count}`);
    console.log('🔒 Políticas de Seguridad RLS aplicadas en todas las tablas.');
  } catch (err) {
    console.error('❌ Error durante la migración:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();

