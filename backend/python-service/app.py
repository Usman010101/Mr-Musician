import librosa
import librosa.display
import matplotlib.pyplot as plt
import numpy as np
import hashlib
from flask import Flask, request, jsonify
from io import BytesIO
import logging

app = Flask(__name__)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration
CHROMA_BINS = 12
HOP_LENGTH = 512
SAMPLE_RATE = 22050
TIME_WINDOW = 1.5
DELTA_PRECISION = 1
PEAK_THRESHOLD = 0.6
MAX_HASHES = 2000

def generate_hashes(peaks):
    """Generate complete fingerprints with all required fields"""
    fingerprints = []
    seen_hashes = set()
    
    for i in range(len(peaks)):
        anchor_time, anchor_bin = peaks[i]
        
        for j in range(i+1, min(i+20, len(peaks))):
            target_time, target_bin = peaks[j]
            
            # Calculate values with full precision first
            raw_delta = target_time - anchor_time
            
            # Apply final rounding for output
            delta = round(raw_delta, DELTA_PRECISION)
            time = round(anchor_time, DELTA_PRECISION)
            
            # Validate after rounding
            if delta <= 0 or delta > TIME_WINDOW:
                continue
                
            # Create complete fingerprint object
            fingerprint = {
                "bins": [int(anchor_bin), int(target_bin)],
                "delta": delta,
                "time": time,
                "hash": None  # Initialize hash field
            }
            
            # Generate hash from visible values
            hash_str = f"{fingerprint['bins'][0]}|{fingerprint['bins'][1]}|{delta}|{time}"
            fingerprint["hash"] = hashlib.md5(hash_str.encode()).hexdigest()[:12]
            
            if fingerprint["hash"] not in seen_hashes:
                fingerprints.append(fingerprint)
                seen_hashes.add(fingerprint["hash"])
                
            if len(fingerprints) >= MAX_HASHES:
                return fingerprints
    return fingerprints

def process_audio(file_data):
    """Audio processing pipeline with debug logging"""
    try:
        y, sr = librosa.load(
            BytesIO(file_data),
            sr=SAMPLE_RATE,
            mono=True,
            res_type='kaiser_fast',
            duration=300
        )

        print("Waveform (y):", y[:10])  # Print the first 10 samples for simplicity
        print("Sample rate (sr):", sr)
        
        chroma = librosa.feature.chroma_cqt(
            y=y,
            sr=sr,
            hop_length=HOP_LENGTH,
            bins_per_octave=36
        )
        print("Chroma matrix shape:", chroma.shape) 
        print("First 5 Chroma columns:\n", chroma[:, :5])
        
        # Generate peaks with precise timing
        peaks = []
        for time_idx in range(chroma.shape[1]):
            frame = chroma[:, time_idx]
            bin_idx = np.argmax(frame)
            if frame[bin_idx] > PEAK_THRESHOLD:
                precise_time = time_idx * HOP_LENGTH / SAMPLE_RATE
                peaks.append((precise_time, int(bin_idx)))
        
        fingerprints = generate_hashes(peaks)
        
        # Debug: Verify first fingerprint format
        if fingerprints:
            logger.info(f"Sample fingerprint: {fingerprints[0]}")
        
        return {
            "success": True,
            "duration": round(librosa.get_duration(y=y, sr=sr), 1),
            "fingerprints": fingerprints,
            "hash_count": len(fingerprints)
        }
        
    except Exception as e:
        logger.error(f"Processing error: {str(e)}")
        return {"success": False, "error": str(e)}

@app.route('/detect', methods=['POST'])
def handle_detection():
    try:
        if 'file' not in request.files:
            return jsonify({"success": False, "error": "No file uploaded"}), 400
            
        file = request.files['file']
        audio_data = file.read()
        
        result = process_audio(audio_data)
        if not result['success']:
            return jsonify(result), 400
            
        # Return data in format matching database structure
        return jsonify({
            "success": True,
            "hashes": [fp["hash"] for fp in result["fingerprints"]],
            "timing_data": [{
                "hash": fp["hash"],
                "sample_time": fp["time"]
            } for fp in result["fingerprints"]],
            "duration": result["duration"]
        })
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/process', methods=['POST'])
def handle_upload():
    try:
        if 'song' not in request.files:
            return jsonify({"success": False, "error": "Missing 'song' field"}), 400
            
        file = request.files['song']
        if not file or file.filename == '':
            return jsonify({"success": False, "error": "Empty filename"}), 400
            
        audio_data = file.read()
        result = process_audio(audio_data)
        
        if result['success']:
            return jsonify(result)
        return jsonify(result), 400
        
    except Exception as e:
        logger.error(f"Upload error: {str(e)}")
        return jsonify({"success": False, "error": "Upload failed"}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, threaded=True)