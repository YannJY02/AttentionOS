import { CalendarClock, Lightbulb, Save } from 'lucide-react';
import { useState } from 'react';
import {
  type ContextCaptureChannel,
  readContextCaptures,
  saveContextCapture,
} from '../adapters/storage/contextCapture';

const CHANNEL_OPTIONS: readonly {
  readonly description: string;
  readonly label: string;
  readonly value: ContextCaptureChannel;
}[] = [
  {
    description: 'Keep it as a remembered idea.',
    label: 'Idea',
    value: 'idea',
  },
  {
    description: 'Make it available as a task draft in Execution Plan.',
    label: 'Task input',
    value: 'task',
  },
  {
    description: 'Make it available as a project draft in Execution Plan.',
    label: 'Project input',
    value: 'project',
  },
  {
    description: 'Keep a dated calendar intention with the capture.',
    label: 'Calendar intent',
    value: 'calendar',
  },
];

export function CapturePage() {
  const [calendarIntentAt, setCalendarIntentAt] = useState('');
  const [channels, setChannels] = useState<readonly ContextCaptureChannel[]>(['idea']);
  const [content, setContent] = useState('');
  const [captures, setCaptures] = useState(() => readContextCaptures());
  const [status, setStatus] = useState('Capture is local and ready.');

  function toggleChannel(channel: ContextCaptureChannel) {
    setChannels((current) =>
      current.includes(channel)
        ? current.filter((currentChannel) => currentChannel !== channel)
        : [...current, channel],
    );
  }

  function saveCapture() {
    try {
      const saved = saveContextCapture({
        calendarIntentAt,
        channels,
        content,
      });
      setCaptures(readContextCaptures());
      setContent('');
      setStatus(`Saved to ${saved.channels.join(', ')}.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Unable to save capture.');
    }
  }

  return (
    <section className="mx-auto max-w-5xl">
      <div className="mb-8">
        <p className="font-medium text-emerald-700 text-sm">Context bus</p>
        <h1 className="mt-2 font-semibold text-4xl text-stone-950">Capture</h1>
        <p className="mt-3 max-w-2xl text-base text-stone-600">
          Write once, route the same context into the channels it should serve.
        </p>
      </div>

      <section className="rounded-md border border-stone-200 bg-white p-5">
        <p className="inline-flex items-center gap-2 font-medium text-sm text-stone-500">
          <Lightbulb aria-hidden="true" size={16} />
          One input, multiple channels
        </p>

        <label className="mt-5 block font-medium text-sm text-stone-800" htmlFor="capture-content">
          Capture text
          <textarea
            className="mt-2 min-h-32 w-full resize-y rounded-md border border-stone-300 bg-white p-3 font-normal text-sm text-stone-900 outline-none focus:border-emerald-700"
            id="capture-content"
            onChange={(event) => setContent(event.target.value)}
            value={content}
          />
        </label>

        <fieldset className="mt-5 grid gap-3">
          <legend className="font-medium text-sm text-stone-800">Channels</legend>
          <div className="grid gap-3 md:grid-cols-2">
            {CHANNEL_OPTIONS.map((option) => (
              <label
                className="flex items-start gap-3 rounded-md border border-stone-200 p-4 text-sm text-stone-700"
                key={option.value}
              >
                <input
                  checked={channels.includes(option.value)}
                  className="mt-0.5 h-4 w-4 rounded border-stone-300 text-emerald-700"
                  onChange={() => toggleChannel(option.value)}
                  type="checkbox"
                />
                <span>
                  <span className="block font-medium text-stone-900">{option.label}</span>
                  <span className="mt-1 block text-stone-600">{option.description}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        {channels.includes('calendar') ? (
          <label
            className="mt-5 block font-medium text-sm text-stone-800"
            htmlFor="capture-calendar"
          >
            Calendar intent time
            <input
              className="mt-2 w-full rounded-md border border-stone-300 bg-white px-3 py-2 font-normal text-sm text-stone-900 outline-none focus:border-emerald-700 md:max-w-sm"
              id="capture-calendar"
              onChange={(event) => setCalendarIntentAt(event.target.value)}
              type="datetime-local"
              value={calendarIntentAt}
            />
          </label>
        ) : null}

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            className="inline-flex items-center gap-2 rounded-md bg-emerald-700 px-4 py-2 font-medium text-sm text-white"
            onClick={saveCapture}
            type="button"
          >
            <Save aria-hidden="true" size={16} />
            Save capture
          </button>
          <p className="text-sm text-stone-600" role="status">
            {status}
          </p>
        </div>
      </section>

      <section className="mt-5 rounded-md border border-stone-200 bg-white p-5">
        <p className="inline-flex items-center gap-2 font-medium text-sm text-stone-500">
          <CalendarClock aria-hidden="true" size={16} />
          Recent captures
        </p>
        <div className="mt-4 grid gap-3">
          {captures.slice(0, 5).map((capture) => (
            <article className="rounded-md border border-stone-200 p-4" key={capture.id}>
              <p className="font-medium text-stone-950">{capture.content}</p>
              <p className="mt-2 text-sm text-stone-600">
                {capture.channels.join(', ')}
                {capture.calendarIntentAt ? ` · ${capture.calendarIntentAt}` : ''}
              </p>
            </article>
          ))}
          {captures.length === 0 ? (
            <p className="rounded-md bg-stone-50 p-4 text-sm text-stone-600">
              No context captures yet.
            </p>
          ) : null}
        </div>
      </section>
    </section>
  );
}
