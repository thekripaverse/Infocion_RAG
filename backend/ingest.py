from nvidia_api import embed_text
from vector_store import add_doc

docs = [
    "Machine learning is a subset of AI that learns from data.",
    "RAG stands for Retrieval Augmented Generation.",
    "NVIDIA Nemotron models support safe AI generation."
]

for d in docs:
    emb = embed_text(d, "passage")
    add_doc(emb, d)

print("Documents loaded into FAISS")
