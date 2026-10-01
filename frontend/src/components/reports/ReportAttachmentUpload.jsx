import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, Image as ImageIcon, X, AlertCircle } from 'lucide-react';

const MAX_FILES = 5;
const MAX_FILE_SIZE_MB = 5;
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.pdf'];

export default function ReportAttachmentUpload({
  files = [],
  onFilesChange
}) {
  const fileInputRef = useRef(null);
  const [uploadError, setUploadError] = useState(null);

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleFileSelect = (e) => {
    setUploadError(null);
    const selectedList = Array.from(e.target.files || []);
    if (!selectedList.length) return;

    if (files.length + selectedList.length > MAX_FILES) {
      setUploadError(`You can only attach up to ${MAX_FILES} files in total.`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const validatedFiles = [];

    for (const file of selectedList) {
      const ext = '.' + file.name.split('.').pop().toLowerCase();

      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        setUploadError(`File "${file.name}" has an unsupported format. Allowed: JPG, PNG, WEBP, PDF.`);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        setUploadError(`File "${file.name}" exceeds the ${MAX_FILE_SIZE_MB} MB size limit.`);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      validatedFiles.push(file);
    }

    onFilesChange([...files, ...validatedFiles]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveFile = (indexToRemove) => {
    setUploadError(null);
    onFilesChange(files.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-xs font-bold text-neutral-900">
            Supporting Evidence & Attachments <span className="text-stone-400 font-normal">(Optional)</span>
          </label>
          <span className="text-[11px] text-stone-500">
            Attach on-site photographs, official notices, or relevant documentation.
          </span>
        </div>
        <span className="text-[11px] font-semibold text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
          {files.length} / {MAX_FILES} files
        </span>
      </div>

      {/* Hidden native input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf"
        onChange={handleFileSelect}
        className="hidden"
        id="attachment-file-input"
      />

      {/* Upload Drop/Click Area */}
      {files.length < MAX_FILES && (
        <label
          htmlFor="attachment-file-input"
          className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-stone-300 rounded-lg hover:border-navy-700 hover:bg-navy-50/40 cursor-pointer transition-colors text-center"
        >
          <div className="w-10 h-10 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center mb-2">
            <UploadCloud className="w-5 h-5 text-navy-900" />
          </div>
          <p className="text-xs font-semibold text-neutral-900">
            Click to browse or drag and drop files
          </p>
          <p className="text-[11px] text-stone-500 mt-1">
            JPG, PNG, WEBP, or PDF (Max {MAX_FILE_SIZE_MB} MB each, up to {MAX_FILES} attachments)
          </p>
        </label>
      )}

      {/* Error Message */}
      {uploadError && (
        <div className="p-2.5 rounded-md text-xs bg-red-50 text-red-700 border border-red-200 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Selected Files List */}
      {files.length > 0 && (
        <div className="space-y-2 pt-1">
          {files.map((file, idx) => {
            const isImage = file.type.startsWith('image/');
            const Icon = isImage ? ImageIcon : FileText;

            return (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 bg-stone-50 border border-stone-200 rounded-md text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="w-7 h-7 rounded bg-white border border-stone-200 text-stone-600 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-navy-900" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-neutral-900 truncate">
                      {file.name}
                    </p>
                    <p className="text-[10px] text-stone-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveFile(idx)}
                  className="p-1 rounded text-stone-400 hover:text-red-600 hover:bg-stone-200 transition-colors ml-2"
                  aria-label={`Remove attachment ${file.name}`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
