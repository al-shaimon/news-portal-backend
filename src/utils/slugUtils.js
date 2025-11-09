import slugify from 'slugify';

export const createSlug = (text, options = {}) => {
  return slugify(text, {
    lower: true,
    strict: true,
    ...options,
  });
};

export const createUniqueSlug = async (Model, baseSlug, excludeId = null) => {
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const query = { slug };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    const existing = await Model.findOne(query);

    if (!existing) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
};
