const DEFAULT_PAGE = 1;
const MAX_PAGE = 10000;

const parsePageNumber = (value) => {
  if (value === undefined || value === null || value === '') {
    return DEFAULT_PAGE;
  }

  const page = Number(value);

  if (!Number.isSafeInteger(page) || page < 1) {
    return DEFAULT_PAGE;
  }

  return Math.min(page, MAX_PAGE);
};

const parsePageSize = (value, fallback = 10, max = 100) => {
  const pageSize = Number(value);

  if (!Number.isSafeInteger(pageSize) || pageSize < 1) {
    return fallback;
  }

  return Math.min(pageSize, max);
};

export { parsePageNumber, parsePageSize };
