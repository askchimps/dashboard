'use client';

import { useActionState } from 'react';
import type { OrgSettings } from '@/lib/types';
import { saveSettingsAction, type SettingsState } from './actions';

interface Props {
  orgId: string;
  settings: OrgSettings;
}

const initial: SettingsState = {};

const SECTIONS: {
  key: 'A' | 'B' | 'C';
  label: string;
  hint: string;
}[] = [
  { key: 'A', label: 'Section A (morning)', hint: 'Default 09:00–12:00' },
  { key: 'B', label: 'Section B (afternoon)', hint: 'Default 13:00–17:00' },
  { key: 'C', label: 'Section C (evening)', hint: 'Default 18:00–20:00' },
];

export function SettingsForm({ orgId, settings }: Props) {
  const [state, action, pending] = useActionState(
    saveSettingsAction.bind(null, orgId),
    initial,
  );

  const startOf = (k: 'A' | 'B' | 'C'): string =>
    k === 'A' ? settings.sectionAStart : k === 'B' ? settings.sectionBStart : settings.sectionCStart;
  const endOf = (k: 'A' | 'B' | 'C'): string =>
    k === 'A' ? settings.sectionAEnd : k === 'B' ? settings.sectionBEnd : settings.sectionCEnd;

  return (
    <form action={action} className="space-y-5">
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          Calling sections
        </h2>
        <p className="mb-3 text-xs text-gray-500">
          Three wall-clock windows per day in the configured timezone. The
          dispatcher only places calls while the current local time falls
          inside one of these windows. Reschedules cycle A → B → C → A on
          the next calendar day until max-retries is hit.
        </p>
        <div className="space-y-4">
          {SECTIONS.map((s) => (
            <div key={s.key}>
              <div className="mb-1 flex items-baseline justify-between">
                <span className="text-sm font-medium text-gray-700">{s.label}</span>
                <span className="text-xs text-gray-400">{s.hint}</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field
                  label="Start (HH:MM)"
                  name={`section${s.key}Start`}
                  defaultValue={startOf(s.key)}
                  placeholder="09:00"
                  pattern="^([01]\d|2[0-3]):[0-5]\d$"
                />
                <Field
                  label="End (HH:MM)"
                  name={`section${s.key}End`}
                  defaultValue={endOf(s.key)}
                  placeholder="12:00"
                  pattern="^([01]\d|2[0-3]):[0-5]\d$"
                />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <Field
            label="Timezone"
            name="timezone"
            defaultValue={settings.timezone}
            placeholder="Asia/Kolkata"
          />
        </div>
      </div>

      <hr className="border-gray-200" />

      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          Retry policy
        </h2>
        <p className="mb-3 text-xs text-gray-500">
          Bounds applied to no-pickup / voicemail / partial-answer schedules.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <Field
            label="Max retries per lead"
            name="maxRetries"
            type="number"
            defaultValue={String(settings.maxRetries)}
            min={0}
            max={20}
          />
          <Field
            label="Delay between retries (minutes)"
            name="retryDelayMinutes"
            type="number"
            defaultValue={String(settings.retryDelayMinutes)}
            min={1}
            max={1440}
          />
        </div>
      </div>

      {state.message ? (
        <p
          className={`text-sm ${
            state.status === 'ok' ? 'text-emerald-700' : 'text-red-600'
          }`}
        >
          {state.message}
        </p>
      ) : null}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? 'Saving…' : 'Save settings'}
        </button>
      </div>
    </form>
  );
}

interface FieldProps {
  label: string;
  name: string;
  defaultValue: string;
  type?: 'text' | 'number';
  placeholder?: string;
  pattern?: string;
  min?: number;
  max?: number;
}

function Field({
  label,
  name,
  defaultValue,
  type = 'text',
  placeholder,
  pattern,
  min,
  max,
}: FieldProps) {
  return (
    <div>
      <label
        className="block text-sm font-medium text-gray-700"
        htmlFor={name}
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        pattern={pattern}
        min={min}
        max={max}
        required
        className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
      />
    </div>
  );
}
