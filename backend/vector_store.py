import faiss
import numpy as np
import os
import pickle

INDEX_FILE = "faiss.index"
DOC_FILE = "docs.pkl"

index = None
documents = []

def save_index():
    faiss.write_index(index, INDEX_FILE)
    with open(DOC_FILE, "wb") as f:
        pickle.dump(documents, f)

def load_index():
    global index, documents
    if os.path.exists(INDEX_FILE):
        index = faiss.read_index(INDEX_FILE)
        with open(DOC_FILE, "rb") as f:
            documents = pickle.load(f)

def add_embedding(embedding, text):
    global index

    vec = np.array([embedding]).astype("float32")

    if index is None:
        index = faiss.IndexFlatL2(len(embedding))

    index.add(vec)
    documents.append(text)
    save_index()

def search(query_embedding, k=3):
    emb = np.array([query_embedding]).astype("float32")
    D, I = index.search(emb, k)
    return [documents[i] for i in I[0]]
