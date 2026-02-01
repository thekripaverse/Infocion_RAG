import { useRef, useState } from "react";
import { ImagePlus } from "lucide-react";
import { uploadImage } from "../services/api";

export default function UploadImage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState("");

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const openPicker = () => fileRef.current?.click();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    const file = e.target.files[0];
    setMsg("Extracting text from image...");

    try {
      const res = await uploadImage(file);
      setMsg(`Indexed ${res.chunks} chunks from image ✅`);
    } catch {
      setMsg("Image upload failed ❌");
    }
  };

  return (
    <div className="flex flex-col items-center">
      <label htmlFor="imageUpload" className="sr-only">
        Upload image for knowledge base
      </label>

      <input
        id="imageUpload"
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
      />

      <button
        onClick={openPicker}
        aria-label="Upload image for knowledge base"
        title="Upload Image"
        className="upload-btn"
      >
        <ImagePlus className="h-8 w-8 text-primary" />
      </button>

      {msg && <p className="mt-2 text-sm text-primary">{msg}</p>}
    </div>
  );
}
