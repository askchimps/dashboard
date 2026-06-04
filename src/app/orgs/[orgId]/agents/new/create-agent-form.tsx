'use client';

import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createAgentAction, type CreateAgentFormState } from './actions';

interface Props {
  orgId: string;
}

const initial: CreateAgentFormState = {};

export function CreateAgentForm({ orgId }: Props) {
  const router = useRouter();
  const [state, action, pending] = useActionState(
    createAgentAction.bind(null, orgId),
    initial,
  );
  const err = state.fieldErrors ?? {};
  useEffect(() => {
    if (state.status === 'ok' && state.createdId) {
      router.push(`/orgs/${orgId}/agents/${state.createdId}`);
    }
  }, [state.status, state.createdId, orgId, router]);
  return (
    <form action={action} className="space-y-6">
      <Section
        title="Agent"
        description="A pointer to the voice agent + the analysis prompt run against its transcripts."
      >
        <Field
          label="Name"
          name="name"
          required
          hint="Unique within this org. Shown on the agents list."
          error={err.name}
        />
        <Field
          label="Voice Agent ID"
          name="voiceAgentId"
          required
          hint="Paste the agent ID from the voice provider dashboard."
          error={err.voiceAgentId}
        />
        <TextArea
          label="Analysis prompt"
          name="analysisPrompt"
          rows={8}
          hint="Run after each call against the transcript to extract structured answers + score intent."
          error={err.analysisPrompt}
        />
      </Section>

      {state.message ? (
        <p
          className={`text-sm ${
            state.status === 'error' ? 'text-red-600' : 'text-emerald-700'
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
          {pending ? 'Creating agent…' : 'Create agent'}
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
  hint,
  required,
  defaultValue,
  type = 'text',
  error,
}: {
  label: string;
  name: string;
  hint?: string;
  required?: boolean;
  defaultValue?: string;
  type?: string;
  error?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700" htmlFor={name}>
        {label}
        {required ? <span className="ml-0.5 text-red-500">*</span> : null}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
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
  hint,
  rows,
  defaultValue,
  error,
}: {
  label: string;
  name: string;
  hint?: string;
  rows: number;
  defaultValue?: string;
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
        rows={rows}
        defaultValue={defaultValue}
        className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 font-mono text-xs text-gray-900 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
      />
      {error ? (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-xs text-gray-500">{hint}</p>
      ) : null}
    </div>
  );
}
