import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { PageHeader } from '../components/layout/PageHeader';
import { exportData, importData } from '../utils/export';

export function SettingsPage() {
  const prefs = useLiveQuery(() => db.userPreferences.get(1));

  async function handleUnitToggle() {
    if (!prefs) return;
    await db.userPreferences.update(1, {
      defaultUnit: prefs.defaultUnit === 'lbs' ? 'kg' : 'lbs',
    });
  }

  async function handleExport() {
    const json = await exportData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `liftlog-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleImport() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const text = await file.text();
      await importData(text);
    };
    input.click();
  }

  if (!prefs) return null;

  return (
    <div>
      <PageHeader title="Settings" />

      <div className="px-4 flex flex-col gap-2 pt-2">
        {/* Unit toggle */}
        <div className="bg-notes-card rounded-[var(--radius-card)] px-4 py-3.5 flex items-center justify-between">
          <div>
            <p className="font-medium text-[15px] text-notes-text">Default Unit</p>
            <p className="text-xs text-notes-muted mt-0.5">Weight unit for new sets</p>
          </div>
          <button
            onClick={handleUnitToggle}
            className="px-4 py-1.5 bg-notes-fill rounded-full text-sm font-semibold text-notes-accent active:bg-notes-accent-dim transition-colors"
          >
            {prefs.defaultUnit.toUpperCase()}
          </button>
        </div>

        {/* Export */}
        <div className="bg-notes-card rounded-[var(--radius-card)] px-4 py-3.5">
          <p className="font-medium text-[15px] text-notes-text mb-3">Data</p>
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              className="flex-1 px-3 py-2.5 bg-notes-fill rounded-xl text-sm font-medium text-notes-accent active:bg-notes-accent-dim transition-colors"
            >
              Export Backup
            </button>
            <button
              onClick={handleImport}
              className="flex-1 px-3 py-2.5 bg-notes-fill rounded-xl text-sm font-medium text-notes-accent active:bg-notes-accent-dim transition-colors"
            >
              Import Backup
            </button>
          </div>
        </div>

        {/* About */}
        <div className="bg-notes-card rounded-[var(--radius-card)] px-4 py-3.5">
          <p className="font-medium text-[15px] text-notes-text">LiftLog</p>
          <p className="text-xs text-notes-muted mt-1 leading-relaxed">
            Offline-first workout logger. Your data stays on your device.
          </p>
        </div>
      </div>
    </div>
  );
}
