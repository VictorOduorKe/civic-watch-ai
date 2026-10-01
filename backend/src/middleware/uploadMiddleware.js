import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

// Upload directory outside public web root
const UPLOAD_DIR = path.resolve('uploads/reports');

// Ensure directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Configurable limits
const MAX_FILE_SIZE_MB = parseInt(process.env.MAX_REPORT_ATTACHMENT_SIZE_MB || '5', 10);
const MAX_FILES = parseInt(process.env.MAX_REPORT_ATTACHMENTS || '5', 10);

// Allowed MIME types and corresponding safe extensions
const ALLOWED_MIME_TYPES = new Map([
  ['image/jpeg', ['.jpg', '.jpeg']],
  ['image/png', ['.png']],
  ['image/webp', ['.webp']],
  ['application/pdf', ['.pdf']]
]);

// Storage configuration with randomized filenames
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const randomHex = crypto.randomBytes(16).toString('hex');
    const timestamp = Date.now();
    const safeStoredName = `${timestamp}-${randomHex}${ext}`;
    cb(null, safeStoredName);
  }
});

// File filter enforcing strict MIME and extension validation
const fileFilter = (req, file, cb) => {
  const mime = file.mimetype.toLowerCase();
  const ext = path.extname(file.originalname).toLowerCase();

  const allowedExts = ALLOWED_MIME_TYPES.get(mime);

  if (!allowedExts || !allowedExts.includes(ext)) {
    const err = new Error(
      `File format not permitted for "${file.originalname}". Allowed formats: JPG, PNG, WEBP, PDF.`
    );
    err.code = 'UNSUPPORTED_FILE_TYPE';
    return cb(err, false);
  }

  // Prevent path traversal in originalName
  file.originalname = path.basename(file.originalname).replace(/[^a-zA-Z0-9._\- ]/g, '_');

  cb(null, true);
};

export const reportUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE_MB * 1024 * 1024,
    files: MAX_FILES
  }
});

/**
 * Middleware to handle Multer specific errors cleanly
 */
export function handleUploadErrors(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: `File size exceeds the permitted limit of ${MAX_FILE_SIZE_MB} MB.`
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: `Cannot upload more than ${MAX_FILES} attachments per report.`
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: `Unexpected file field received. Use field name "attachments".`
      });
    }
    return res.status(400).json({
      success: false,
      message: `File upload error: ${err.message}`
    });
  }

  if (err && err.code === 'UNSUPPORTED_FILE_TYPE') {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }

  next(err);
}
