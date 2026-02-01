import pytesseract
from PIL import Image

def extract_text_from_image(path: str) -> str:
    img = Image.open(path)
    text = pytesseract.image_to_string(img)
    return text
