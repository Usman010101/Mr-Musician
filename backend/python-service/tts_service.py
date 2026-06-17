# app.py
import os
import io
import logging
import tempfile
from datetime import datetime
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from werkzeug.utils import secure_filename
from gtts import gTTS
from PyPDF2 import PdfReader
from docx import Document

# --- CONFIGURATION ---
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXT = {'pdf', 'docx', 'doc', 'txt'}
MAX_CONTENT = 10 * 1024 * 1024  # 10MB

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)
app.config.update(
    UPLOAD_FOLDER=UPLOAD_FOLDER,
    MAX_CONTENT_LENGTH=MAX_CONTENT
)
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


def allowed_file(fn):
    return '.' in fn and fn.rsplit('.', 1)[1].lower() in ALLOWED_EXT


def extract_text(filepath: str) -> str:
    ext = filepath.lower().rsplit('.', 1)[1]
    if ext == 'pdf':
        reader = PdfReader(filepath)
        return "\n".join(p.extract_text() or '' for p in reader.pages)
    if ext in ('docx', 'doc'):
        doc = Document(filepath)
        return "\n".join(p.text for p in doc.paragraphs if p.text)
    if ext == 'txt':
        return open(filepath, encoding='utf-8').read()
    return ''


def text_to_speech(text: str) -> io.BytesIO:
    logger.info(f"TTS: converting {len(text)} chars")
    buf = io.BytesIO()
    tts = gTTS(text=text[:10000], lang='en', slow=False)
    tts.write_to_fp(buf)
    buf.seek(0)
    return buf


@app.route('/api/tts', methods=['POST'])
def handle_tts():
    data = request.get_json(force=True) or {}
    text = (data.get('text') or '').strip()
    if not text:
        return jsonify(error="Text input required"), 400

    audio = text_to_speech(text)
    return send_file(
        audio,
        mimetype='audio/mpeg',
        as_attachment=True,
        download_name='text_speech.mp3'
    )


@app.route('/api/document-tts', methods=['POST'])
def handle_document_tts():
    if 'file' not in request.files:
        return jsonify(error="No file uploaded"), 400

    f = request.files['file']
    if f.filename == '' or not allowed_file(f.filename):
        return jsonify(error="Invalid or missing file"), 400

    filename = secure_filename(f.filename)
    path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    f.save(path)

    text = extract_text(path)
    os.remove(path)

    if not text.strip():
        return jsonify(error="No text could be extracted"), 400

    audio = text_to_speech(text)
    return send_file(
        audio,
        mimetype='audio/mpeg',
        as_attachment=True,
        download_name=f"{filename.rsplit('.',1)[0]}.mp3"
    )


if __name__ == '__main__':
    logger.info("Starting Flask TTS server on port 8080")
    app.run(host='0.0.0.0', port=8081, threaded=True)
