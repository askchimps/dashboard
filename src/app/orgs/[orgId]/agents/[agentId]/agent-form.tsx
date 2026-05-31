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
  return (
    <form action={action} className="space-y-5">
      <Field
        label="Name"
        name="name"
        defaultValue={agent.name}
        hint="Short identifier, unique within this org."
      />
      <TextArea
        label="Base prompt"
        name="basePrompt"
        defaultValue={agent.basePrompt}
        hint="System prompt the voice agent uses on every call."
        rows={6}
      />
      <TextArea
        label="Analysis prompt"
        name="analysisPrompt"
        defaultValue={agent.analysisPrompt}
        hint="Used post-call to extract structured answers + score intent."
        rows={6}
      />
      <TextArea
        label="Knowledge base"
        name="knowledge"
        defaultValue={agent.knowledge}
        hint="Free-form context the agent can draw on (FAQs, product info, etc.)."
        rows={10}
      />

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
          {pending ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  defaultValue,
  hint,
}: {
  label: string;
  name: string;
  defaultValue: string;
  hint?: string;
}) {
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
        defaultValue={defaultValue}
        required
        className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
      />
      {hint ? <p className="mt-1 text-xs text-gray-500">{hint}</p> : null}
    </div>
  );
}

function TextArea({
  label,
  name,
  defaultValue,
  hint,
  rows,
}: {
  label: string;
  name: string;
  defaultValue: string;
  hint?: string;
  rows: number;
}) {
  return (
    <div>
      <label
        className="block text-sm font-medium text-gray-700"
        htmlFor={name}
      >
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        defaultValue={defaultValue}
        rows={rows}
        className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 font-mono text-xs text-gray-900 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
      />
      {hint ? <p className="mt-1 text-xs text-gray-500">{hint}</p> : null}
    </div>
  );
}
