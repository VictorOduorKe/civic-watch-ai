import React, { useState } from 'react';
import {
  FileText,
  Image as ImageIcon,
  FileSpreadsheet,
  FileArchive,
  Download,
  AlertCircle,
  Loader2,
  Paperclip
} from 'lucide-react';
import { reportApi } from '../../services/api';

/**
 * Format bytes into human-readable size: KB, MB
 */
function formatFileSize(bytes) {
  if (!bytes || isNaN(bytes)) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Get relevant file icon based on MIME type
 */
function getFileIcon(mimeType) {
  if (mimeType?.startsWith('image/')) {
    return <ImageIcon className="w-5 h-5 text-gold-600" />;
  }
  if (mimeType === 'application/pdf') {
    return <FileText className="w-5 h-5 text-red-600" />;
  }
  if (
    mimeType?.includes('sheet') ||
    mimeType?.includes('excel') ||
    mimeType?.includes('csv')
  ) {
    return <FileSpreadsheet className="w-5 h-5 text-green-600" />;
  }
  if (mimeType?.includes('zip') || mimeType?.includes('tar')) {
    return <FileArchive className="w-5 h-5 text-stone-600" />;
  }
  return <Paperclip className="w-5 h-5 text-navy-700" />;
}

export default function ReportAttachmentList({ reference, attachments = [] }) {
  const [downloadingId, setDownloadingId] = useState(null);
  const [downloadError, setDownloadError] = useState(null);

  if (!attachments || attachments.length === 0) {
    return (
      <div className="p-4 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-500 text-center">
        No supporting files attached to this report.
      </div>
    );
  }

  const handleDownload = async (attachment) => {
    try {
      setDownloadError(null);
      setDownloadingId(attachment.id);
      await reportApi.downloadAttachment(reference, attachment.id, attachment.original_name);
    } catch (err) {
      console.error('[Attachment] Download failed:', err);
      setDownloadError(err.message || 'Failed to download attachment. Please try again.');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="space-y-3">
      {downloadError && (
        <div
          className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 flex items-center gap-2"
          role="alert"
        >
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{downloadError}</span>
        </div>
      )}

      <ul className="divide-y divide-stone-200 border border-stone-200 rounded-lg bg-white overflow-hidden shadow-2xs">
        {attachments.map((att) => {
          const isDownloading = downloadingId === att.id;

          return (
            <li
              key={att.id}
              className="p-3 sm:p-4 flex items-center justify-between gap-3 hover:bg-stone-50/80 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 bg-stone-100 rounded-lg shrink-0 border border-stone-200">
                  {getFileIcon(att.mime_type)}
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className="text-xs font-bold text-navy-950 truncate"
                    title={att.original_name}
                  >
                    {att.original_name}
                  </p>
                  <p className="text-[11px] text-stone-500 flex items-center gap-2 mt-0.5">
                    <span>{formatFileSize(att.size_bytes)}</span>
                    <span className="w-1 h-1 rounded-full bg-stone-300"></span>
                    <span className="truncate uppercase font-mono text-[10px]">
                      {att.mime_type?.split('/')[1] || 'FILE'}
                    </span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleDownload(att)}
                disabled={isDownloading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-navy-900 hover:text-white text-navy-950 text-xs font-semibold rounded-md border border-stone-300 transition-colors shrink-0 disabled:opacity-60 focus:outline-none focus:ring-1 focus:ring-gold-500"
                aria-label={`Download ${att.original_name}`}
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Downloading...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
