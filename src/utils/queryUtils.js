import { PAGINATION } from '../config/constants.js';

export const getPaginationParams = (req) => {
  const page = Math.max(1, parseInt(req.query.page) || PAGINATION.DEFAULT_PAGE);
  const limit = Math.min(
    parseInt(req.query.limit) || PAGINATION.DEFAULT_LIMIT,
    PAGINATION.MAX_LIMIT
  );
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

export const buildSortObject = (sortQuery) => {
  if (!sortQuery) return { createdAt: -1 };

  const sortObj = {};
  const sortFields = sortQuery.split(',');

  sortFields.forEach((field) => {
    if (field.startsWith('-')) {
      sortObj[field.substring(1)] = -1;
    } else {
      sortObj[field] = 1;
    }
  });

  return sortObj;
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
