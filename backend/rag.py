from nvidia_api import embed_text
from vector_store import search

def retrieve_context(query: str):
    q_emb = embed_text(query, "query")
    docs = search(q_emb)
    return "\n".join(docs)
