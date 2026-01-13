import os
import tempfile
import requests
import cv2
import numpy as np
import torch
import torchaudio
import tensorflow as tf
import tensorflow_hub as hub

from moviepy import VideoFileClip
from transformers import (
    CLIPProcessor,
    CLIPModel,
    BlipProcessor,
    BlipForConditionalGeneration,
)
from sentence_transformers import SentenceTransformer
from chroma import collection

# ------------------ LOAD MODELS ONCE ------------------

clip_model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
clip_processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")

blip_processor = BlipProcessor.from_pretrained(
    "Salesforce/blip-image-captioning-base"
)
blip_model = BlipForConditionalGeneration.from_pretrained(
    "Salesforce/blip-image-captioning-base"
)

text_model = SentenceTransformer("all-MiniLM-L6-v2")

yamnet = hub.load("https://tfhub.dev/google/yamnet/1")

# ------------------ HELPERS ------------------

def download_from_ipfs(cid: str) -> str:
    url = f"https://ipfs.io/ipfs/{cid}"
    r = requests.get(url, stream=True, timeout=30)
    if r.status_code != 200:
        raise Exception("IPFS download failed")

    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".mp4")
    for chunk in r.iter_content(8192):
        tmp.write(chunk)
    tmp.close()
    return tmp.name


def extract_frames(video_path: str, max_frames=6):
    cap = cv2.VideoCapture(video_path)
    frames = []

    total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    step = max(total // max_frames, 1)

    i = 0
    while len(frames) < max_frames:
        cap.set(cv2.CAP_PROP_POS_FRAMES, i)
        ret, frame = cap.read()
        if not ret:
            break
        frames.append(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
        i += step

    cap.release()
    return frames


def visual_embedding(frames):
    inputs = clip_processor(images=frames, return_tensors="pt", padding=True)
    with torch.no_grad():
        emb = clip_model.get_image_features(**inputs)
    emb = emb / emb.norm(dim=1, keepdim=True)
    return emb.mean(dim=0).cpu().numpy()


def caption_embedding(frames):
    inputs = blip_processor(images=frames[0], return_tensors="pt")
    with torch.no_grad():
        caption_ids = blip_model.generate(**inputs)

    caption = blip_processor.decode(
        caption_ids[0], skip_special_tokens=True
    )

    emb = text_model.encode(caption)
    return caption, emb


def audio_embedding(video_path: str):
    clip = VideoFileClip(video_path)
    if clip.audio is None:
        return None

    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as f:
        audio_path = f.name

    clip.audio.write_audiofile(audio_path, logger=None)

    waveform, sr = torchaudio.load(audio_path)
    os.remove(audio_path)

    waveform = waveform.mean(dim=0).numpy()
    if sr != 16000:
        waveform = tf.audio.resample(waveform, sr, 16000)

    scores, embeddings, _ = yamnet(waveform)
    return tf.reduce_mean(embeddings, axis=0).numpy()


def novelty_score(embedding):
    if embedding is None:
        return 0.5

    results = collection.query(
        query_embeddings=[embedding.tolist()],
        n_results=5
    )

    if not results["distances"][0]:
        return 1.0

    return min(1.0, float(np.mean(results["distances"][0])))

# ------------------ MAIN ENTRY ------------------

def compute_rarity_from_cid(cid: str) -> float:
    video_path = download_from_ipfs(cid)

    try:
        frames = extract_frames(video_path)
        if not frames:
            return 0.1

        v_emb = visual_embedding(frames)
        caption, c_emb = caption_embedding(frames)
        a_emb = audio_embedding(video_path)

        v_score = novelty_score(v_emb)
        c_score = novelty_score(c_emb)
        a_score = novelty_score(a_emb)

        rarity = 0.5 * v_score + 0.3 * c_score + 0.2 * a_score

        collection.add(
            ids=[cid],
            embeddings=[v_emb.tolist()],
            metadatas=[{"caption": caption}]
        )

        return round(float(rarity), 4)

    finally:
        if os.path.exists(video_path):
            os.remove(video_path)