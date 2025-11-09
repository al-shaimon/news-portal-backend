import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { AppError } from '../middleware/errorHandler.js';
import { ALLOWED_FILE_TYPES, UPLOAD_LIMITS } from '../config/constants.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    ...ALLOWED_FILE_TYPES.IMAGE,
    ...ALLOWED_FILE_TYPES.VIDEO,
    ...ALLOWED_FILE_TYPES.DOCUMENT,
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new AppError('Invalid file type. Only images, videos, and documents are allowed.', 400),
      false
    );
  }
};

// Multer upload configuration
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: UPLOAD_LIMITS.IMAGE_MAX_SIZE, // Default limit
  },
});

// Specific upload configurations
export const uploadImage = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (ALLOWED_FILE_TYPES.IMAGE.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError('Only image files are allowed', 400), false);
    }
  },
  limits: { fileSize: UPLOAD_LIMITS.IMAGE_MAX_SIZE },
});

export const uploadVideo = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (ALLOWED_FILE_TYPES.VIDEO.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError('Only video files are allowed', 400), false);
    }
  },
  limits: { fileSize: UPLOAD_LIMITS.VIDEO_MAX_SIZE },
});

export const uploadDocument = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (ALLOWED_FILE_TYPES.DOCUMENT.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError('Only document files are allowed', 400), false);
    }
  },
  limits: { fileSize: UPLOAD_LIMITS.DOCUMENT_MAX_SIZE },
});
