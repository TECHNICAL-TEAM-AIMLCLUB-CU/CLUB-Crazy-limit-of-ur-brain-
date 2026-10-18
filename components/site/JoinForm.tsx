'use client';

import { useState, type FormEvent } from 'react';

type Status = 'idle' | 'submitting' | 'success' | 'error';
type Errors = Partial<Record<'name' | 'email' | 'message', string>>;

const field =
  'mt-1.5 w-full rounded-lg border border-line-strong bg-surface-2 px-4 py-3 text-sm text-fg placeholder:text-muted/60 focus:border-brand-cyan';

export default function JoinForm() {
  const [status, setStatus] = useState<Status>('idle');
  const [errors, setErrors] = useState<Errors>({});
  const [message, setMessage] = useState('');

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === 'submitting') return;
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setStatus('submitting');
    setErrors({});
    setMessage('');
    try {
      const res = await fetch('/api/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string; errors?: Errors };
      if (res.ok) {
        setStatus('success');
        setMessage('Thanks! Your message has been sent. The team will get back to you.');
        form.reset();
      } else {
        setStatus('error');
        setErrors(json.errors ?? {});
        setMessage(json.error ?? 'Something went wrong. Please try again.');
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Please check your connection and try again.');
    }
  }

  const err = (k: keyof Errors) => (errors[k] ? `${k}-error` : undefined);

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5 rounded-2xl border border-line bg-surface/90 p-6 sm:p-8">
      <div>
        <label htmlFor="name" className="text-sm font-medium">Name</label>
        <input id="name" name="name" type="text" required maxLength={100} autoComplete="name" className={field}
          aria-invalid={!!errors.name} aria-describedby={err('name')} />
        {errors.name && <p id="name-error" className="mt-1 text-sm text-red-400">{errors.name}</p>}
      </div>
      <div>
        <label htmlFor="email" className="text-sm font-medium">Email</label>
        <input id="email" name="email" type="email" required maxLength={200} autoComplete="email" className={field}
          aria-invalid={!!errors.email} aria-describedby={err('email')} />
        {errors.email && <p id="email-error" className="mt-1 text-sm text-red-400">{errors.email}</p>}
      </div>
      <div>
        <label htmlFor="interest" className="text-sm font-medium">Area of interest <span className="text-muted">(optional)</span></label>
        <input id="interest" name="interest" type="text" maxLength={100} placeholder="e.g. computer vision, NLP, robotics" className={field} />
      </div>
      <div>
        <label htmlFor="message" className="text-sm font-medium">Message</label>
        <textarea id="message" name="message" rows={5} required minLength={10} maxLength={2000} className={field}
          aria-invalid={!!errors.message} aria-describedby={err('message')} />
        {errors.message && <p id="message-error" className="mt-1 text-sm text-red-400">{errors.message}</p>}
      </div>

      {/* Honeypot: hidden from people and assistive tech; bots fill it in. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={status === 'submitting'}
          className="rounded-full bg-brand-cyan px-6 py-3 text-sm font-semibold text-bg transition hover:brightness-110 disabled:opacity-60"
        >
          {status === 'submitting' ? 'Sending…' : 'Send message'}
        </button>
        <p role="status" aria-live="polite" className={`text-sm ${status === 'success' ? 'text-brand-cyan' : 'text-red-400'}`}>
          {message}
        </p>
      </div>
    </form>
  );
}
