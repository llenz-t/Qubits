/**
 * Multer config for justification-file uploads: kept in memory (not
 * disk) since files are immediately re-uploaded to Supabase storage,
 * restricted to a small allowlist of document/image types, and capped
 * by MAX_PDF_UPLOAD_BYTES (default 5MB).
 */
const multer = require('multer');

const allowedTypes = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: Number(process.env.MAX_PDF_UPLOAD_BYTES || 5242880) },
  fileFilter: (_request, file, callback) => {
    callback(null, allowedTypes.has(file.mimetype));
  }
});

module.exports = upload;