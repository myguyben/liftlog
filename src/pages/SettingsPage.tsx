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
    <div className="animate-fade-in">
      <PageHeader title="Settings" />

      {/* General section */}
      <div className="px-4 pt-4">
        <p className="text-[13px] font-semibold text-notes-muted/70 uppercase tracking-wider mb-2 px-1">General</p>
        <div className="rounded-[var(--radius-card)] overflow-hidden">
          <SettingsRow
            label="Default Unit"
            right={
              <button
                onClick={handleUnitToggle}
                className="px-4 py-1 bg-notes-fill-secondary rounded-full text-[14px] font-semibold text-notes-accent active:bg-notes-accent-dim transition-colors min-w-[52px]"
              >
                {prefs.defaultUnit.toUpperCase()}
              </button>
            }
          />
        </div>
      </div>

      {/* Data section */}
      <div className="px-4 pt-6">
        <p className="text-[13px] font-semibold text-notes-muted/70 uppercase tracking-wider mb-2 px-1">Data</p>
        <div className="rounded-[var(--radius-card)] overflow-hidden">
          <SettingsButton label="Export Backup" sublabel="Download your data as JSON" onClick={handleExport} />
          <SettingsButton label="Import Backup" sublabel="Restore from a backup file" onClick={handleImport} />
        </div>
      </div>

      {/* About section */}
      <div className="px-4 pt-6">
        <p className="text-[13px] font-semibold text-notes-muted/70 uppercase tracking-wider mb-2 px-1">About</p>
        <div className="rounded-[var(--radius-card)] overflow-hidden">
          <div className="bg-notes-card px-4 py-3.5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-notes-accent rounded-[10px] flex items-center justify-center flex-shrink-0">
                <span className="text-black font-bold text-[18px]">L</span>
              </div>
              <div>
                <p className="font-semibold text-[15px] text-notes-text">LiftLog</p>
                <p className="text-[12px] text-notes-muted/60 mt-0.5">
                  Offline-first. No account needed. Your data stays on device.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsRow({ label, right }: { label: string; right: React.ReactNode }) {
  return (
    <div className="bg-notes-card px-4 py-3 flex items-center justify-between border-b border-notes-divider/40 last:border-b-0">
      <span className="text-[15px] text-notes-text">{label}</span>
      {right}
    </div>
  );
}

function SettingsButton({ label, sublabel, onClick }: { label: string; sublabel: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-notes-card px-4 py-3 text-left border-b border-notes-divider/40 last:border-b-0 active:bg-notes-card-elevated transition-colors flex items-center justify-between"
    >
      <div>
        <p className="text-[15px] text-notes-accent">{label}</p>
        <p className="text-[12px] text-notes-muted/50 mt-0.5">{sublabel}</p>
      </div>
      <svg className="w-4 h-4 text-notes-muted/30 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
      </svg>
    </button>
  );
}
