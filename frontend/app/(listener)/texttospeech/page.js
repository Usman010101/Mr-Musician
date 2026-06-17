// components/TextToSpeech.jsx
'use client';

import React, { useState, useRef } from 'react';
import axios from 'axios';
import styles from './textspeech.module.css';

export default function TextToSpeech() {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const fileRef = useRef();
  const abortRef = useRef();

  const downloadBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleText = async e => {
    e.preventDefault();
    if (!text.trim()) return setError('Enter some text');
    setError(''); setIsLoading(true); setProgress(0);
    abortRef.current = new AbortController();

    try {
      const res = await axios.post(
        'http://localhost:8081/api/tts',
        { text },
        {
          responseType: 'blob',
          signal: abortRef.current.signal,
          onUploadProgress: p => setProgress(Math.round((p.loaded/p.total)*100))
        }
      );
      downloadBlob(res.data, `text_speech_${Date.now()}.mp3`);
    } catch (e) {
      if (!axios.isCancel(e)) setError(e.response?.data?.error || e.message);
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  };

  const handleFile = async e => {
    e.preventDefault();
    const file = fileRef.current.files[0];
    if (!file) return setError('Select a file');
    setError(''); setIsLoading(true); setProgress(0);
    abortRef.current = new AbortController();

    const fd = new FormData();
    fd.append('file', file);

    try {
      const res = await axios.post(
        'http://localhost:8081/api/document-tts',
        fd,
        {
          responseType: 'blob',
          signal: abortRef.current.signal,
          onUploadProgress: p => setProgress(Math.round((p.loaded/p.total)*100))
        }
      );
      downloadBlob(res.data, `doc_speech_${Date.now()}.mp3`);
    } catch (e) {
      if (!axios.isCancel(e)) setError(e.response?.data?.error || e.message);
    } finally {
      setIsLoading(false);
      setProgress(0);
      fileRef.current.value = '';
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Text &amp; File → Speech</h1>

      <div className={styles.progressContainer}>
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <form onSubmit={handleText} className={styles.section}>
        <textarea
          className={styles.textarea}
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Enter text..."
          disabled={isLoading}
        />
        <button
          type="submit"
          className={styles.button}
          disabled={isLoading || !text.trim()}
        >
          {isLoading ? 'Converting…' : 'Convert Text'}
        </button>
      </form>

      <form onSubmit={handleFile} className={styles.section}>
        <input
          type="file"
          className={styles.fileInput}
          ref={fileRef}
          accept=".pdf,.doc,.docx,.txt"
          disabled={isLoading}
        />
        <button
          type="submit"
          className={styles.button}
          disabled={isLoading}
        >
          {isLoading ? 'Converting…' : 'Convert File'}
        </button>
      </form>
    </div>
  );
}
