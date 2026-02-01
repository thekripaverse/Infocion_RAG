import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { uploadPDF } from "../services/api";

export default function UploadPDF() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState("");

  const openPicker = () => {
    fileRef.current?.click();
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    const file = e.target.files[0];
    setMsg("Processing PDF...");

    try {
      const res = await uploadPDF(file);
      setMsg(`Indexed ${res.chunks} chunks!!`);
    } catch (error) {
      setMsg("Upload failed !!");
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* Properly labeled hidden input */}
      <label htmlFor="pdfUpload" className="sr-only">
        Upload PDF Knowledge Base
      </label>

      <input
        id="pdfUpload"
        ref={fileRef}
        type="file"
        accept="application/pdf"
        onChange={handleUpload}
        className="hidden"
      />

      {/* Accessible button */}
      <button
        onClick={openPicker}
        aria-label="Upload PDF for knowledge base"
        title="Upload PDF"
        className="upload-btn"
      >
        <Upload className="h-8 w-8 text-primary" />
      </button>

      {msg && <p className="mt-2 text-sm text-primary">{msg}</p>}
    </div>
  );
}
