// User Roles
export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  EDITORIAL: 'editorial',
};

// Article Status
export const ARTICLE_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
  SCHEDULED: 'scheduled',
};

// Advertisement Types
export const AD_TYPES = {
  BANNER: 'banner',
  SIDEBAR: 'sidebar',
  IN_CONTENT: 'in-content',
  POPUP: 'popup',
};

// Advertisement Positions
export const AD_POSITIONS = {
  TOP: 'top',
  MIDDLE: 'middle',
  BOTTOM: 'bottom',
  SIDEBAR_TOP: 'sidebar-top',
  SIDEBAR_MIDDLE: 'sidebar-middle',
  SIDEBAR_BOTTOM: 'sidebar-bottom',
};

// Media Types
export const MEDIA_TYPES = {
  IMAGE: 'image',
  VIDEO: 'video',
  DOCUMENT: 'document',
};

// Languages
export const LANGUAGES = {
  ENGLISH: 'en',
  BANGLA: 'bn',
};

// Permissions
export const PERMISSIONS = {
  // Article permissions
  CREATE_ARTICLE: 'create_article',
  EDIT_ARTICLE: 'edit_article',
  DELETE_ARTICLE: 'delete_article',
  PUBLISH_ARTICLE: 'publish_article',

  // User permissions
  CREATE_USER: 'create_user',
  EDIT_USER: 'edit_user',
  DELETE_USER: 'delete_user',

  // Category permissions
  MANAGE_CATEGORIES: 'manage_categories',

  // Advertisement permissions
  MANAGE_ADS: 'manage_ads',

  // Media permissions
  UPLOAD_MEDIA: 'upload_media',
  DELETE_MEDIA: 'delete_media',

  // Settings
  MANAGE_SETTINGS: 'manage_settings',
};

// Role Permissions Mapping
export const ROLE_PERMISSIONS = {
  [USER_ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS),
  [USER_ROLES.ADMIN]: [
    PERMISSIONS.CREATE_ARTICLE,
    PERMISSIONS.EDIT_ARTICLE,
    PERMISSIONS.DELETE_ARTICLE,
    PERMISSIONS.PUBLISH_ARTICLE,
    PERMISSIONS.MANAGE_CATEGORIES,
    PERMISSIONS.MANAGE_ADS,
  ],
  [USER_ROLES.EDITORIAL]: [
    PERMISSIONS.CREATE_ARTICLE,
    PERMISSIONS.EDIT_ARTICLE,
  ],
};

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
};

// File upload limits
export const UPLOAD_LIMITS = {
  IMAGE_MAX_SIZE: 5 * 1024 * 1024, // 5MB
  VIDEO_MAX_SIZE: 50 * 1024 * 1024, // 50MB
  DOCUMENT_MAX_SIZE: 10 * 1024 * 1024, // 10MB
};

// Allowed file types
export const ALLOWED_FILE_TYPES = {
  IMAGE: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
  VIDEO: ['video/mp4', 'video/webm', 'video/ogg'],
  DOCUMENT: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
};
