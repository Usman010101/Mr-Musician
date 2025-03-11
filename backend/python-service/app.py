# backend/python-service/app.py
import librosa
import numpy as np
import librosa.display  # For visualizing audio and spectrogram
import matplotlib.pyplot as plt
from flask import Flask, request, jsonify
import tempfile
import os
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for cross-origin requests

def generate_fingerprint(audio_path):
    try:
        print(f"Processing file: {audio_path}")

        # Step 1: Load audio
        y, sr = librosa.load(
            audio_path,
            sr=22050,  # Fixed sampling rate
            mono=True,
            res_type='kaiser_fast'
        )
        print(f"Audio loaded successfully! Sample Rate: {sr}, Shape of y: {y.shape}")
        
        # Visualize waveform
        import matplotlib.pyplot as plt
        plt.figure(figsize=(10, 4))
        librosa.display.waveshow(y, sr=sr)
        plt.title("Waveform")
        plt.xlabel("Time (s)")
        plt.ylabel("Amplitude")
        plt.show()

        # Step 2: Compute Short-Time Fourier Transform (STFT)
        stft = librosa.stft(y)
        print("Stft:",stft)
        spectrogram = np.abs(stft)
        print(f"Spectrogram Shape: {spectrogram.shape}")

        # Visualize spectrogram
        plt.figure(figsize=(10, 4))
        librosa.display.specshow(
            librosa.amplitude_to_db(spectrogram, ref=np.max),
            sr=sr,
            x_axis="time",
            y_axis="log"
        )
        plt.title("Log-Scaled Spectrogram")
        plt.colorbar(format="%+2.0f dB")
        plt.show()

        # Step 3: Peak Detection
        peaks = librosa.util.peak_pick(
            spectrogram.flatten(),
            pre_max=3,
            post_max=3,
            pre_avg=3,
            post_avg=5,
            delta=0.5,
            wait=10
        )
        print(f"Number of Peaks Detected: {len(peaks)}")

        # Step 4: Map Peaks to Time-Frequency Pairs
        time_freq_pairs = [
            [
                int(idx // spectrogram.shape[0]),  # Time index
                int(idx % spectrogram.shape[0])    # Frequency index
            ] for idx in peaks
        ]
        print(f"Time-Frequency Pairs (First 10): {time_freq_pairs[:10]}")

        return time_freq_pairs

    except Exception as e:
        print(f"Audio processing error: {str(e)}")
        return None

@app.route('/fingerprint', methods=['POST'])
def handle_fingerprint():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    
    audio_file = request.files['file']
    temp_path = None
    
    try:
        # 5. Secure temporary file handling
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as tmp:
            temp_path = tmp.name
            audio_file.save(temp_path)
            
            fingerprint = generate_fingerprint(temp_path)
            
            if not fingerprint:
                return jsonify({"error": "Fingerprint generation failed"}), 500
                
            return jsonify({
                "status": "success",
                "fingerprint": fingerprint,
                "length": len(fingerprint)
            })
            
    except Exception as e:
        print(f"Server error: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500
        
    finally:
        # 6. Guaranteed cleanup
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)

if __name__ == '__main__':
    # 7. Production-ready configuration
    app.run(
        host='0.0.0.0',
        port=8080,
        threaded=True,  # Handle concurrent requests
        debug=False    # Disable in production
    )