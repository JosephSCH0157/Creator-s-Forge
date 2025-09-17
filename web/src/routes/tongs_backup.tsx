// web/src/routes/Tongs.tsx
import React, { useMemo, useState } from 'react';

type Asset = {
  name: string;
  size: number;
  type: string;
};

type UploadResult = {
  ok: boolean;
  id?: string;
  error?: string;
};

export default function Tongs(): JSX.Element {
  const [title, setTitle] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const asset: Asset | null = useMemo(() => {
    if (!file) return null;
    return { name: file.name, size: file.size, type: file.type };
  }, [file]);

  function onPickFile(e: React.ChangeEvent<HTMLInputElement>): void {
    const f = e.currentTarget.files?.[0] ?? null;
    setFile(f);
    setSuccess(null);
    setError(null);
  }

  function onTitle(e: React.ChangeEvent<HTMLInputElement>): void {
    setTitle(e.currentTarget.value);
    setSuccess(null);
  }

  function onNotes(e: React.ChangeEvent<HTMLTextAreaElement>): void {
    setNotes(e.currentTarget.value);
  }

  const canSubmit: boolean = Boolean(title.trim() && file && !isSubmitting);

  // Intentionally not async here: we wrap async work in a void-call below
  function onSubmit(e: React.FormEvent<HTMLFormElement>): void {
    e.preventDefault();
    if (!canSubmit || !file) return;
    void doUpload({ title: title.trim(), notes: notes.trim(), file });
  }

  async function doUpload(input: { title: string; notes: string; file: File }): Promise<void> {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      // TODO: Replace this mock with your real uploader call (fetch/axios/etc.)
      const res = await mockUpload(input);
      if (res.ok) {
        setSuccess(`Uploaded: ${input.title}${res.id ? ` (id ${res.id})` : ''}`);
        // optional: clear form but keep last file visible if you want
        setTitle('');
        setNotes('');
        setFile(null);
      } else {
        setError(res.error ?? 'Upload failed.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main style={{ maxWidth: 720, margin: '2rem auto', padding: '1rem' }}>
      <h1 style={{ marginBottom: '1rem' }}>Tongs — Script Uploader</h1>

      <form onSubmit={onSubmit} noValidate>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="title">Title</label>
          <input
            id="title"
            name="title"
            type="text"
            placeholder="e.g., Washington Warned Us"
            value={title}
            onChange={onTitle}
            required
            aria-invalid={title.trim() ? 'false' : 'true'}
            style={{ display: 'block', width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="file">Script File</label>
          <input
            id="file"
            name="file"
            type="file"
            accept=".txt,.md,.docx,.pdf"
            onChange={onPickFile}
            required
            aria-describedby="file-help"
            style={{ display: 'block', marginTop: '0.25rem' }}
          />
          <div id="file-help" style={{ fontSize: '0.9rem', opacity: 0.8 }}>
            Accepted: .txt, .md, .docx, .pdf
          </div>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="notes">Notes (optional)</label>
          <textarea
            id="notes"
            name="notes"
            rows={4}
            placeholder="Short description or tags"
            value={notes}
            onChange={onNotes}
            style={{ display: 'block', width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
          />
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          style={{
            padding: '0.6rem 1rem',
            cursor: canSubmit ? 'pointer' : 'not-allowed',
          }}
        >
          {isSubmitting ? 'Uploading…' : 'Upload'}
        </button>
      </form>

      <section style={{ marginTop: '1rem', minHeight: '2rem' }} aria-live="polite">
        {error && (
          <div role="alert" style={{ color: '#b00020' }}>
            {error}
          </div>
        )}
        {success && <div style={{ color: '#1a7f37' }}>{success}</div>}
      </section>

      <hr style={{ margin: '1.5rem 0' }} />

      <section aria-label="Selected File">
        <h2 style={{ marginBottom: '0.5rem' }}>Selected File</h2>
        {asset ? (
          <ul>
            <li>
              <strong>Name:</strong> {asset.name}
            </li>
            <li>
              <strong>Size:</strong> {formatBytes(asset.size)}
            </li>
            <li>
              <strong>Type:</strong> {asset.type || 'unknown'}
            </li>
          </ul>
        ) : (
          <p>No file chosen.</p>
        )}
      </section>
    </main>
  );
}

// --------- helpers (pure, typed, and outside JSX) ---------

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'] as const;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = parseFloat((bytes / Math.pow(k, i)).toFixed(2));
  return `${value} ${sizes[i]}`;
}

async function mockUpload(input: {
  title: string;
  notes: string;
  file: File;
}): Promise<UploadResult> {
  // Simulate latency & success
  await new Promise((r) => setTimeout(r, 600));
  // Always “ok” in the mock:
  return { ok: true, id: Math.random().toString(36).slice(2, 9) };
}
