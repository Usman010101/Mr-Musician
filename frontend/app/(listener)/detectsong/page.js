'use client'

import { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import { FaMicrophone, FaStop, FaMusic, FaUpload } from 'react-icons/fa'
import styles from './songDetector.module.css'

export default function SongDetector() {
  const [isListening, setIsListening] = useState(false)
  const [progress, setProgress]       = useState(0)
  const [results, setResults]         = useState(null)
  const [error, setError]             = useState(null)
  const [activeTab, setActiveTab]     = useState('mic')

  const audioCtxRef   = useRef(null)
  const procRef       = useRef(null)
  const streamRef     = useRef(null)
  const pcmChunksRef  = useRef([])
  const timerRef      = useRef(null)
  const fileInputRef  = useRef(null)

  const MAX_DURATION = 30

  // Cleanup on unmount
  useEffect(() => {
    return () => stopListening()
  }, [])

  async function startListening() {
    try {
      setError(null)
      setResults(null)
      setIsListening(true)
      setProgress(0)
      pcmChunksRef.current = []

      // 1) Create audio context and grab mic
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      audioCtxRef.current = new AudioCtx()
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      // 2) ScriptProcessor to capture PCM
      const source    = audioCtxRef.current.createMediaStreamSource(stream)
      const processor = audioCtxRef.current.createScriptProcessor(4096, 1, 1)
      processor.onaudioprocess = (e) => {
        const input = e.inputBuffer.getChannelData(0)
        // copy Float32Array so it doesn't get overwritten
        pcmChunksRef.current.push(new Float32Array(input))
      }
      source.connect(processor)
      processor.connect(audioCtxRef.current.destination)
      procRef.current = processor

      // 3) Timer to auto-stop
      timerRef.current = setInterval(() => {
        setProgress((p) => {
          if (p >= MAX_DURATION) {
            stopListening()
            return MAX_DURATION
          }
          return p + 1
        })
      }, 1000)
    } catch (err) {
      setError(err.message)
      setIsListening(false)
    }
  }

  async function stopListening() {
    clearInterval(timerRef.current)
    setIsListening(false)

    // stop everything
    streamRef.current?.getTracks().forEach((t) => t.stop())
    procRef.current?.disconnect()
    if (audioCtxRef.current?.state !== 'closed') {
      await audioCtxRef.current.close()
    }

    // encode and send
    if (pcmChunksRef.current.length) {
      await processAndSendWav()
    }
  }

  async function processAndSendWav() {
    try {
      const sampleRate = audioCtxRef.current.sampleRate
      const wavBlob    = encodeWAV(pcmChunksRef.current, sampleRate)

      const formData = new FormData()
      formData.append('audio', wavBlob, 'recording.wav')

      const res = await axios.post(
        'http://localhost:5000/api/detection/song',
        formData
      )

      if (res.data.success) {
        setResults(res.data.results.slice(0, 3))
      } else {
        setError(res.data.error || 'Detection failed')
      }
    } catch (err) {
      setError(err.message)
    }
  }

  // Build a WAV file (PCM16 little-endian) from Float32Array chunks
  function encodeWAV(chunks, sampleRate) {
    // total samples
    const totalSamples = chunks.reduce((sum, c) => sum + c.length, 0)
    const buffer       = new ArrayBuffer(44 + totalSamples * 2)
    const view         = new DataView(buffer)

    /* RIFF header */
    writeString(view, 0, 'RIFF')
    view.setUint32(4, 36 + totalSamples * 2, true)
    writeString(view, 8, 'WAVE')

    /* fmt chunk */
    writeString(view, 12, 'fmt ')
    view.setUint32(16, 16, true)       // Subchunk1Size
    view.setUint16(20, 1, true)        // AudioFormat = PCM
    view.setUint16(22, 1, true)        // NumChannels = mono
    view.setUint32(24, sampleRate, true)
    view.setUint32(28, sampleRate * 2, true) // ByteRate = SampleRate * NumChannels * BitsPerSample/8
    view.setUint16(32, 2, true)        // BlockAlign = NumChannels * BitsPerSample/8
    view.setUint16(34, 16, true)       // BitsPerSample

    /* data chunk */
    writeString(view, 36, 'data')
    view.setUint32(40, totalSamples * 2, true)

    // write PCM samples
    let offset = 44
    chunks.forEach((chunk) => {
      for (let i = 0; i < chunk.length; i++, offset += 2) {
        const s = Math.max(-1, Math.min(1, chunk[i]))
        view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true)
      }
    })

    return new Blob([view], { type: 'audio/wav' })
  }

  function writeString(view, offset, str) {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i))
    }
  }

  // File-upload tab remains the same
  async function handleFileUpload(e) {
    const file = e.target.files[0]
    if (!file) return

    try {
      setError(null)
      setResults(null)
      setIsListening(true)

      const formData = new FormData()
      formData.append('audio', file)

      const res = await axios.post(
        'http://localhost:5000/api/detection/song',
        formData
      )

      if (res.data.success) {
        setResults(res.data.results.slice(0, 3))
      } else {
        setError(res.data.error || 'Detection failed')
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message)
    } finally {
      setIsListening(false)
    }
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Song Detector</h1>
      <p className={styles.subtitle}>Identify songs playing around you</p>

      <div className={styles.tabs}>
        <button
          className={`${styles.tabButton} ${
            activeTab === 'mic' ? styles.activeTab : ''
          }`}
          onClick={() => setActiveTab('mic')}
        >
          <FaMicrophone /> Use Microphone
        </button>
        <button
          className={`${styles.tabButton} ${
            activeTab === 'upload' ? styles.activeTab : ''
          }`}
          onClick={() => setActiveTab('upload')}
        >
          <FaUpload /> Upload File
        </button>
      </div>

      {activeTab === 'mic' ? (
        <div className={styles.micSection}>
          <div className={`${styles.circle} ${isListening ? styles.listening : ''}`}>
            <div className={styles.innerCircle}>
              <FaMusic className={styles.musicIcon} />
            </div>
            {isListening && (
              <>
                <div className={styles.pulse}></div>
                <div className={`${styles.pulse} ${styles.pulse2}`}></div>
                <div className={`${styles.pulse} ${styles.pulse3}`}></div>
              </>
            )}
          </div>

          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${(progress / MAX_DURATION) * 100}%` }}
            />
          </div>

          <p className={styles.statusText}>
            {isListening
              ? `Listening... ${MAX_DURATION - progress}s remaining`
              : 'Tap to start listening'}
          </p>

          <button
            className={`${styles.actionButton} ${
              isListening ? styles.stopButton : styles.startButton
            }`}
            onClick={isListening ? stopListening : startListening}
          >
            {isListening ? <FaStop /> : <FaMicrophone />}
            {isListening ? 'Stop' : 'Start Listening'}
          </button>
        </div>
      ) : (
        <div className={styles.uploadSection}>
          <div className={styles.uploadBox}>
            <FaUpload className={styles.uploadIcon} />
            <p>Upload an audio file to identify</p>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="audio/*"
              style={{ display: 'none' }}
            />
            <button
              className={styles.uploadButton}
              onClick={() => fileInputRef.current.click()}
            >
              Choose File
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className={styles.errorBox}>
          <p>{error}</p>
        </div>
      )}

      {results && (
        <div className={styles.resultsSection}>
          <h2>Top Matches</h2>
          <div className={styles.resultsList}>
            {results.map((r, i) => (
              <div key={i} className={styles.resultItem}>
                <div className={styles.resultRank}>{i + 1}</div>
                <div className={styles.resultInfo}>
                  <h3>{r.title}</h3>
                  <p>Artist ID: {r.artistId}</p>
                </div>
                <div className={styles.resultConfidence}>
                  <div className={styles.confidenceBar}>
                    <div
                      className={styles.confidenceFill}
                      style={{ width: r.confidence }}
                    />
                  </div>
                  <span>{r.confidence}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
