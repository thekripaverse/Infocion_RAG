import faiss
import numpy as np
from nvidia_api import embed_text

index = None
documents = []

def init_knowledge():
    global index, documents

    with open("knowledge.txt", "r") as f:
        docs = f.read().splitlines()

    for doc in docs:
        emb = embed_text(doc, "passage")
        vec = np.array([emb]).astype("float32")

        if index is None:
            index = faiss.IndexFlatL2(len(emb))

        index.add(vec)
        documents.append(doc)

def search(query_embedding, k=3):
    emb = np.array([query_embedding]).astype("float32")
    D, I = index.search(emb, k)
    return [documents[i] for i in I[0]]
