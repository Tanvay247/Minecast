# rarity_service/chroma.py

import chromadb

client = chromadb.Client(
    chromadb.config.Settings(
        persist_directory="./data/chroma",
        anonymized_telemetry=False
    )
)

collection = client.get_or_create_collection(
    name="minecast_videos",
    metadata={"hnsw:space": "cosine"}
)