import os
import requests
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("NVIDIA_API_KEY")

HEADERS = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

# ✅ NVIDIA Embedding (works perfectly)
def embed_text(text: str, mode: str):
    url = "https://integrate.api.nvidia.com/v1/embeddings"

    payload = {
        "model": "nvidia/llama-3.2-nv-embedqa-1b-v2",
        "input": [text],
        "input_type": mode
    }

    r = requests.post(url, headers=HEADERS, json=payload)
    res = r.json()

    if "data" not in res:
        raise Exception(f"Embedding failed: {res}")

    return res["data"][0]["embedding"]


# ✅ NVIDIA Chat model that EXISTS for all accounts
def generate_answer(prompt: str):
    url = "https://integrate.api.nvidia.com/v1/chat/completions"

    payload = {
        "model": "meta/llama3-70b-instruct",  # available on Build
        "messages": [
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.2,
        "max_tokens": 512
    }

    r = requests.post(url, headers=HEADERS, json=payload)
    res = r.json()

    if "choices" not in res:
        raise Exception(f"LLM failed: {res}")

    return res["choices"][0]["message"]["content"]
