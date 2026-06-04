'use client';

import { useActionState } from 'react';
import { saveAgentAction, type AgentFormState } from './actions';
import type { Agent } from '@/lib/types';

interface Props {
  orgId: string;
  agent: Agent;
}

const initial: AgentFormState = {};

export function AgentForm({ orgId, agent }: Props) {
  const [state, action, pending] = useActionState(
    saveAgentAction.bind(null, orgId, agent.id),
    initial,
  );
  const err = state.fieldErrors ?? {};

  return (
    <form action={action} className="space-y-6">
      <Section
        title="Agent (admin only)"
        description="Name + analysis prompt. The voice agent ID is paired at creation and cannot be changed here."
      >
        <Field label="Name" name="name" defaultValue={agent.name} required error={err.name} />
        <Field
          label="Voice Agent ID"
          name="voiceAgentId"
          defaultValue={agent.voiceAgentId}
          disabled
          hint="Set at creation. Recreate the agent if this needs to change."
        />
        <TextArea
          label="Analysis prompt"
          name="analysisPrompt"
          rows={8}
          defaultValue={agent.analysisPrompt}
          error={err.analysisPrompt}
        />
      </Section>

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
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </form>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <header className="mb-4">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        <p className="mt-0.5 text-xs text-gray-500">{description}</p>
      </header>
      <div className="grid grid-cols-1 gap-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  name,
  defaultValue,
  required,
  type = 'text',
  hint,
  disabled,
  error,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
  type?: string;
  hint?: string;
  disabled?: boolean;
  error?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        disabled={disabled}
        readOnly={disabled}
        className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500"
      />
      {error ? (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-xs text-gray-500">{hint}</p>
      ) : null}
    </div>
  );
}

function TextArea({
  label,
  name,
  defaultValue,
  rows,
  error,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  rows: number;
  error?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700" htmlFor={name}>
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        defaultValue={defaultValue}
        rows={rows}
        className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 font-mono text-xs text-gray-900 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
      />
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
