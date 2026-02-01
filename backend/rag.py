from nvidia_api import embed_text
from vector_store import search
from vector_store import add_embedding
from utils import chunk_text

def retrieve_context(query: str):
    q_emb = embed_text(query, "query")
    docs = search(q_emb)
    return "\n".join(docs)

def add_to_vectorstore(text: str) -> int:
    chunks = chunk_text(text)

    for chunk in chunks:
        emb = embed_text(chunk, "passage")
        add_embedding(emb, chunk)

    return len(chunks)
