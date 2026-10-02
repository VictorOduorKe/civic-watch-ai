import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

// Upload directory outside public web root
const UPLOAD_DIR = path.resolve('uploads/verifications');

// Ensure directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const MAX_FILE_SIZE_MB = 5;

// Allowed MIME types and corresponding extensions for verification images
const ALLOWED_MIME_TYPES = new Map([
  ['image/jpeg', ['.jpg', '.jpeg']],
  ['image/png', ['.png']],
  ['image/webp', ['.webp']]
]);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const randomHex = crypto.randomBytes(16).toString('hex');
    const timestamp = Date.now();
    const safeStoredName = `verification_${timestamp}_${randomHex}${ext}`;
    cb(null, safeStoredName);
  }
});

const fileFilter = (req, file, cb) => {
  const mime = file.mimetype.toLowerCase();
  const ext = path.extname(file.originalname).toLowerCase();

  const allowedExts = ALLOWED_MIME_TYPES.get(mime);

  if (!allowedExts || !allowedExts.includes(ext)) {
    const err = new Error(
      `File format not permitted for verification screenshot. Allowed formats: JPG, JPEG, PNG, WEBP.`
    );
    err.code = 'UNSUPPORTED_FILE_TYPE';
    return cb(err, false);
  }

  // Prevent path traversal in originalName
  file.originalname = path.basename(file.originalname).replace(/[^a-zA-Z0-9._\- ]/g, '_');

  cb(null, true);
};

export const verificationUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE_MB * 1024 * 1024,
    files: 1
  }
});

export function handleVerificationUploadErrors(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: `Image size exceeds the permitted limit of ${MAX_FILE_SIZE_MB} MB.`
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Only 1 screenshot image can be uploaded per verification request.'
      });
    }
    return res.status(400).json({
      success: false,
      message: `Image upload error: ${err.message}`
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
