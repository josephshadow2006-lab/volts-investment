import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const defaultDbPath = path.join(__dirname, 'volts.db');
const dbPath = process.env.DB_PATH || defaultDbPath;

export const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

export const pool = db;

export async function query(text, params) {
  try {
    const stmt = db.prepare(text);
    if (params && params.length > 0) {
      return {
        rows: stmt.all(...params),
        rowCount: stmt.all(...params).length,
      };
    }
    const rows = stmt.all();
    return {
      rows,
      rowCount: rows.length,
    };
  } catch (error) {
    console.error('Query error:', error, text, params);
    throw error;
  }
}

export function run(text, params) {
  try {
    const stmt = db.prepare(text);
    if (params && params.length > 0) {
      return stmt.run(...params);
    }
    return stmt.run();
  } catch (error) {
    console.error('Run error:', error, text, params);
    throw error;
  }
}
