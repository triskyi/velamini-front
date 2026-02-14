"use client";

import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type UploadedFile = {
  id: string;
  name: string;
  size: string;
  type: string;
};

interface FileUploaderProps {
  files: UploadedFile[];
  onUpload: (files: UploadedFile[]) => void;
}

export default function FileUploader({ files, onUpload }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles: UploadedFile[] = Array.from(e.target.files).map(file => ({
        name: file.name,
        size: (file.size / 1024 / 1024).toFixed(2) + " MB",
        type: file.type,
        id: Math.random().toString(36).substr(2, 9)
      }));
      onUpload([...files, ...newFiles]);
    }
  };

  const removeFile = (id: string) => {
    onUpload(files.filter(f => f.id !== id));
  };

  return (
    <div className="space-y-4">
      <div 
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files) {
            const droppedFiles: UploadedFile[] = Array.from(e.dataTransfer.files).map(file => ({
              name: file.name,
              size: (file.size / 1024 / 1024).toFixed(2) + " MB",
              type: file.type,
              id: Math.random().toString(36).substr(2, 9)
            }));
            onUpload([...files, ...droppedFiles]);
          }
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-3xl p-8 transition-all cursor-pointer flex flex-col items-center justify-center gap-3 ${
          isDragging ? "border-cyan-500 bg-cyan-500/5" : "border-zinc-800 bg-zinc-900/30 hover:border-zinc-700"
        }`}
      >
        <input 
          type="file" 
          multiple 
          className="hidden" 
          ref={fileInputRef} 
          onChange={handleFileChange}
        />
        <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-white transition-all">
          <Upload className="w-6 h-6" />
        </div>
        <div className="text-center">
          <p className="font-bold text-zinc-200">Upload CV, Portfolio, or Images</p>
          <p className="text-xs text-zinc-500 mt-1">Drag & drop or click to browse (PDF, PNG, JPG, DOCX)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <AnimatePresence>
          {files.map((file) => (
            <motion.div
              key={file.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center gap-3 p-3 bg-zinc-900 border border-zinc-800 rounded-2xl group"
            >
              <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-cyan-500">
                {file.type.includes('image') ? <ImageIcon className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-zinc-200 truncate">{file.name}</p>
                <p className="text-[10px] text-zinc-500 uppercase font-black">{file.size}</p>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); removeFile(file.id); }}
                className="p-2 text-zinc-600 hover:text-red-400 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
