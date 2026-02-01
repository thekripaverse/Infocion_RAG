from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from rag import retrieve_context
from nvidia_api import generate_answer
from vector_store import load_index
from fastapi import UploadFile, File
from ocr import extract_text_from_image
from rag import add_to_vectorstore
from document_loader import extract_text_from_pdf, chunk_text
from vector_store import add_embedding, load_index
from nvidia_api import embed_text
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
    load_index()

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

@app.post("/upload")
async def upload_doc(file: UploadFile = File(...)):
    path = f"temp_{file.filename}"

    with open(path, "wb") as f:
        f.write(await file.read())

    text = extract_text_from_pdf(path)
    chunks = chunk_text(text)

    for chunk in chunks:
        emb = embed_text(chunk, "passage")
        add_embedding(emb, chunk)

    return {"status": "Document processed", "chunks": len(chunks)}

@app.post("/upload-image")
async def upload_image(file: UploadFile = File(...)):
    path = f"temp_{file.filename}"
    with open(path, "wb") as f:
        f.write(await file.read())

    text = extract_text_from_image(path)
    chunks = add_to_vectorstore(text)

    return {"chunks": chunks}