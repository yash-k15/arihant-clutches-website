export const getCloudinaryImage = (url, transformation = 'f_auto,q_auto') => {
  if (!url) return '';

  return url.replace('/upload/f_auto,q_auto/', `/upload/${transformation}/`);
};
