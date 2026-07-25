"use client";

import { useRef, useState, ChangeEvent } from "react";
import { Upload, X } from "lucide-react";

interface ImageUploadProps {
  value: string;
  onChange: (file: File | null) => void;
  label?: string;
}

export default function ImageUpload({
  value,
  onChange,
  label,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string>(value || "");

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    onChange(file);

    const reader = new FileReader();
    reader.onload = (ev) => {
      setPreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    setPreview("");
    onChange(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div>
      {label && (
        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}

      <div
        onClick={() => inputRef.current?.click()}
        className="relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:border-primary dark:border-gray-600 dark:bg-gray-800 dark:hover:border-primary"
      >
        {preview ? (
          <>
            <img
              src={preview}
              alt="Preview"
              className="h-40 w-full rounded-lg object-contain"
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove();
              }}
              className="absolute right-2 top-2 rounded-full bg-white p-1 shadow dark:bg-gray-900"
            >
              <X className="h-4 w-4 text-gray-500" />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center py-8">
            <Upload className="mb-2 h-8 w-8 text-gray-400 dark:text-gray-500" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Click to upload an image
            </p>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </div>
  );
}
