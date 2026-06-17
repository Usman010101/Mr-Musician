// components/songdetection/SongDetection.js
'use client';
import { useState, useRef } from 'react';
import { FaMicrophone, FaTimes } from 'react-icons/fa';
import style from "./songdectection.module.css"


export default function SongDetection() {
  const [isRecording, setIsRecording] = useState(false);
  const [result, setResult] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);

  const startRecording = async () => {
    setIsRecording(true);
    audioChunksRef.current = []; // Reset audio chunks

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        console.log('Audio recorded:', audioUrl);

        // Send the audio to the backend for processing
        const formData = new FormData();
        formData.append('file', audioBlob, 'recording.wav');

        const response = await fetch('/api/detect-song', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();
        setResult(data); // Assuming the backend returns song details

        // Clean up the stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      };

      mediaRecorder.start();
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
          setIsRecording(false);
        }
      }, 10000); // Record for 10 seconds
    } catch (error) {
      console.log('Error recording audio:', error); // Temporary workaround
      setIsRecording(false);

      // Clean up the stream if an error occurs
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop(); // Stop recording
    }
    setIsRecording(false);

    // Clean up the stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  return (
    <div className="text-center p-6 bg-gray-800 rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Detect a Song</h2>
      <button
        onClick={startRecording}
        disabled={isRecording}
        className={`bg-pink-600 text-white p-4 rounded-full hover:bg-pink-700 transition-all ${
          isRecording ? style.pulsating : ''
        }`}
      >
        <FaMicrophone size={32} />
      </button>
      {isRecording && (
        <div className="mt-4">
          <p>Recording...</p>
          <button
            onClick={cancelRecording}
            className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-all mt-2"
          >
            <FaTimes size={24} />
          </button>
        </div>
      )}
      {result && (
        <div className="mt-6">
          <h3 className="text-xl font-bold">Detected Song:</h3>
          <p>{result.title}</p>
          <p>{result.artist}</p>
          <img src={result.cover} alt={result.title} className="w-32 h-32 mt-4 mx-auto" />
        </div>
      )}
    </div>
  );
}