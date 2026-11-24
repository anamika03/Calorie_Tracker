import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";

const g = globalThis as unknown as { __db?: DatabaseSync };

function dbPath() {
  if (process.env.DATABASE_PATH) return process.env.DATABASE_PATH;
  // Vercel's filesystem is read-only except /tmp (data there is not persistent).
  return process.env.VERCEL ? "/tmp/app.db" : "data/app.db";
}

export function db(): DatabaseSync {
  if (g.__db) return g.__db;
  const file = dbPath();
  fs.mkdirSync(path.dirname(path.resolve(file)), { recursive: true });
  const d = new DatabaseSync(file);
  d.exec(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS profile (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      name TEXT NOT NULL, sex TEXT NOT NULL, age INTEGER NOT NULL,
      height_cm REAL NOT NULL, weight_kg REAL NOT NULL,
      activity TEXT NOT NULL, tier TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS meal_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      day TEXT NOT NULL, slot TEXT NOT NULL, name TEXT NOT NULL,
      grams REAL, kcal REAL NOT NULL, protein REAL NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS water_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      day TEXT NOT NULL, ml INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS burned_log (
      day TEXT PRIMARY KEY, kcal REAL NOT NULL
    );
    CREATE TABLE IF NOT EXISTS stock_item (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE COLLATE NOCASE, qty REAL NOT NULL, unit TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS planned_meal (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      day TEXT NOT NULL, slot TEXT NOT NULL, name TEXT NOT NULL,
      kcal REAL NOT NULL, protein REAL NOT NULL, ingredients TEXT NOT NULL,
      logged INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS grocery_item (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL, qty REAL NOT NULL, unit TEXT NOT NULL, category TEXT NOT NULL,
      checked INTEGER NOT NULL DEFAULT 0
    );
  `);
  g.__db = d;
  return d;
}
