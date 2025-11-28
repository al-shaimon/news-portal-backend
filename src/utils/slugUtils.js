import slugify from 'slugify';
import { prisma } from '../config/database.js';

export const createSlug = (text, options = {}) => {
  return slugify(text, {
    lower: true,
    strict: true,
    ...options,
  });
};

export const createUniqueSlug = async (modelName, baseSlug, excludeId = null) => {
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await prisma[modelName].findFirst({
      where: {
        slug,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    });

    if (!existing) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }
};
