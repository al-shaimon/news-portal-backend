import { PAGINATION } from '../config/constants.js';

export const getPaginationParams = (query = {}) => {
  const page = Math.max(1, parseInt(query.page, 10) || PAGINATION.DEFAULT_PAGE);
  const limit = Math.min(
    parseInt(query.limit, 10) || PAGINATION.DEFAULT_LIMIT,
    PAGINATION.MAX_LIMIT
  );
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

export const buildSortObject = (sortQuery, defaultField = 'createdAt') => {
  if (!sortQuery) return [{ [defaultField]: 'desc' }];

  const sortFields = sortQuery.split(',');
  return sortFields.map((field) => {
    if (field.startsWith('-')) {
      return { [field.substring(1)]: 'desc' };
    }
    return { [field]: 'asc' };
  });
};

export const buildFilterObject = (query, allowedFields = []) => {
  const filter = {};

  allowedFields.forEach((field) => {
    if (query[field]) {
      filter[field] = query[field];
    }
  });

  return filter;
};
