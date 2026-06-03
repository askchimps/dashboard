'use client';

import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createAgentAction, type CreateAgentFormState } from './actions';

interface Props {
  orgId: string;
}

const initial: CreateAgentFormState = {};

const VOICE_PROVIDERS = ['elevenlabs', 'polly', 'deepgram'] as const;
const TRANSCRIBERS = ['deepgram', 'bodhi'] as const;
const TELEPHONY = ['plivo', 'twilio', 'exotel'] as const;
const LANGUAGES: Array<{ code: 'en' | 'hi'; label: string }> = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'Hindi' },
];

const LLM_MODELS = ['gpt-4o-mini', 'gpt-4o', 'gpt-4.1-mini', 'gpt-4.1'];

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
    <form action={action} className="space-y-8">
      <Section
        title="Identity"
        description="What the agent is called and how it opens every call."
      >
        <Field
          label="Name"
          name="name"
          required
          hint="Unique within this org. Shown on the agents list."
          error={err.name}
        />
        <Field
          label="Welcome message"
          name="welcomeMessage"
          hint="First line the agent speaks on every call."
          defaultValue="Hello! This is Riya from AskChimps. Is now a good time to talk?"
          error={err.welcomeMessage}
        />
      </Section>

      <Section
        title="Voice"
        description="Synthesizer + voice the agent uses. Get the voice_id from your provider dashboard."
      >
        <Select
          label="Provider"
          name="voiceProvider"
          options={VOICE_PROVIDERS.map((p) => ({ value: p, label: p }))}
          defaultValue="elevenlabs"
        />
        <Field
          label="Voice ID"
          name="voiceId"
          required
          hint="e.g. ElevenLabs voice_id: V9LCAAi4tTlqe9JadbCo (Nila)."
          defaultValue="V9LCAAi4tTlqe9JadbCo"
          error={err.voiceId}
        />
        <Field
          label="Voice display name"
          name="voiceName"
          hint="Optional — shown next to the agent on the list."
          defaultValue="Nila"
          error={err.voiceName}
        />
        <Field
          label="Voice model"
          name="voiceModel"
          hint="e.g. eleven_turbo_v2_5, eleven_flash_v2_5."
          defaultValue="eleven_turbo_v2_5"
          error={err.voiceModel}
        />
      </Section>

      <Section
        title="Transcription"
        description="What converts the caller's audio into text."
      >
        <Select
          label="Language"
          name="language"
          options={LANGUAGES.map((l) => ({ value: l.code, label: l.label }))}
          defaultValue="en"
        />
        <Select
          label="Provider"
          name="transcriberProvider"
          options={TRANSCRIBERS.map((p) => ({ value: p, label: p }))}
          defaultValue="deepgram"
        />
        <Field
          label="Model"
          name="transcriberModel"
          hint="deepgram: nova-3, nova-2 · bodhi: hi-general-v2-8khz, etc."
          defaultValue="nova-3"
          error={err.transcriberModel}
        />
      </Section>

      <Section
        title="Conversation"
        description="LLM driving the conversation and how it behaves on silence."
      >
        <Select
          label="LLM model"
          name="llmModel"
          options={LLM_MODELS.map((m) => ({ value: m, label: m }))}
          defaultValue="gpt-4o-mini"
        />
        <Field
          label="Temperature"
          name="llmTemperature"
          type="number"
          step="0.1"
          min="0"
          max="2"
          hint="0 = deterministic, 1 = creative. Default 0.1."
          defaultValue="0.1"
          error={err.llmTemperature}
        />
        <Field
          label="Max tokens"
          name="llmMaxTokens"
          type="number"
          step="1"
          min="16"
          max="4096"
          defaultValue="150"
          error={err.llmMaxTokens}
        />
        <Field
          label="Hangup after silence (sec)"
          name="hangupAfterSilence"
          type="number"
          step="1"
          min="2"
          max="120"
          defaultValue="10"
          error={err.hangupAfterSilence}
        />
        <Field
          label="Max call duration (sec)"
          name="callTerminateSec"
          type="number"
          step="5"
          min="15"
          max="1800"
          defaultValue="90"
          error={err.callTerminateSec}
        />
      </Section>

      <Section
        title="Calling hours (optional)"
        description="Bolna will refuse to dial outside this window. Leave blank to allow 24h."
      >
        <Field
          label="Start hour (0-23)"
          name="callStartHour"
          type="number"
          step="1"
          min="0"
          max="23"
          error={err.callStartHour}
        />
        <Field
          label="End hour (0-23)"
          name="callEndHour"
          type="number"
          step="1"
          min="0"
          max="23"
          error={err.callEndHour}
        />
        <Select
          label="Telephony provider"
          name="telephonyProvider"
          options={TELEPHONY.map((p) => ({ value: p, label: p }))}
          defaultValue="plivo"
        />
      </Section>

      <Section
        title="Prompts"
        description="Base prompt drives the call. Analysis prompt runs locally on the transcript after the call ends."
      >
        <TextArea
          label="Base prompt"
          name="basePrompt"
          rows={6}
          hint="System prompt used during the call."
          error={err.basePrompt}
        />
        <TextArea
          label="Analysis prompt"
          name="analysisPrompt"
          rows={6}
          hint="Used post-call to extract structured answers + score intent."
          error={err.analysisPrompt}
        />
        <TextArea
          label="Knowledge base"
          name="knowledge"
          rows={8}
          hint="Free-form context appended to the base prompt (FAQs, product info)."
          error={err.knowledge}
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
          {pending ? 'Creating agent on Bolna…' : 'Create agent'}
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
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{children}</div>
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
  step,
  min,
  max,
  error,
}: {
  label: string;
  name: string;
  hint?: string;
  required?: boolean;
  defaultValue?: string;
  type?: string;
  step?: string;
  min?: string;
  max?: string;
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
        step={step}
        min={min}
        max={max}
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

function Select({
  label,
  name,
  options,
  defaultValue,
}: {
  label: string;
  name: string;
  options: Array<{ value: string; label: string }>;
  defaultValue?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700" htmlFor={name}>
        {label}
      </label>
      <select
        id={name}
        name={name}
        defaultValue={defaultValue}
        className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
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
    <div className="md:col-span-2">
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
