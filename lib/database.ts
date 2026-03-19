import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

/**
 * Returns the singleton database instance, opening it if necessary.
 */
export function getDb(): SQLite.SQLiteDatabase {
  if (!db) {
    db = SQLite.openDatabaseSync('liftlog.db');
  }
  return db;
}

/**
 * Creates all tables (IF NOT EXISTS) and inserts default rows.
 * Call once at app startup.
 */
export function initDatabase(): void {
  const database = getDb();

  database.runSync(`
    CREATE TABLE IF NOT EXISTS workouts (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      date        TEXT    NOT NULL,
      title       TEXT    NOT NULL,
      notes       TEXT,
      created_at  INTEGER NOT NULL,
      updated_at  INTEGER NOT NULL
    );
  `);

  database.runSync(`
    CREATE TABLE IF NOT EXISTS exercise_entries (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      workout_id  INTEGER NOT NULL,
      name        TEXT    NOT NULL,
      sort_order  INTEGER NOT NULL DEFAULT 0,
      notes       TEXT,
      created_at  INTEGER NOT NULL,
      FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE
    );
  `);

  database.runSync(`
    CREATE TABLE IF NOT EXISTS set_entries (
      id                INTEGER PRIMARY KEY AUTOINCREMENT,
      exercise_entry_id INTEGER NOT NULL,
      set_number        INTEGER NOT NULL,
      weight            REAL    NOT NULL DEFAULT 0,
      unit              TEXT    NOT NULL DEFAULT 'lbs',
      reps              INTEGER NOT NULL DEFAULT 0,
      rpe               REAL,
      completed         INTEGER NOT NULL DEFAULT 1,
      timestamp         INTEGER NOT NULL,
      FOREIGN KEY (exercise_entry_id) REFERENCES exercise_entries(id) ON DELETE CASCADE
    );
  `);

  database.runSync(`
    CREATE TABLE IF NOT EXISTS exercise_templates (
      id                TEXT PRIMARY KEY,
      name              TEXT NOT NULL,
      equipment         TEXT,
      primary_muscles   TEXT,
      secondary_muscles TEXT,
      category          TEXT,
      level             TEXT,
      force             TEXT,
      mechanic          TEXT
    );
  `);

  database.runSync(`
    CREATE TABLE IF NOT EXISTS user_exercise_stats (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      exercise_name  TEXT    UNIQUE NOT NULL,
      last_used_at   INTEGER NOT NULL,
      use_count      INTEGER NOT NULL DEFAULT 0,
      personal_best  TEXT
    );
  `);

  database.runSync(`
    CREATE TABLE IF NOT EXISTS user_preferences (
      id            INTEGER PRIMARY KEY,
      default_unit  TEXT NOT NULL DEFAULT 'lbs',
      theme         TEXT NOT NULL DEFAULT 'system'
    );
  `);

  // Insert default preferences row if it doesn't exist
  const existing = database.getFirstSync<{ id: number }>(
    'SELECT id FROM user_preferences WHERE id = 1'
  );
  if (!existing) {
    database.runSync(
      "INSERT INTO user_preferences (id, default_unit, theme) VALUES (1, 'lbs', 'system')"
    );
  }
}
