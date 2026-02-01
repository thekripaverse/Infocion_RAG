from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from rag import retrieve_context
from nvidia_api import generate_answer
from vector_store import init_knowledge
import time

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup():
    init_knowledge()

class Query(BaseModel):
    input_text: str

@app.post("/query")
def query(q: Query):
    start = time.time()

    context = retrieve_context(q.input_text)

    prompt = f"""
Answer using only the context below.

Context:
{context}

Question: {q.input_text}
"""

    answer = generate_answer(prompt)

    return {
        "answer": answer,
        "safety_flag": False,
        "retrieval_time_ms": int((time.time() - start) * 1000)
    }
