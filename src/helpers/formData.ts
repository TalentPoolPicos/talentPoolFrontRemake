export const toFormData = (file: File) => {
  const fd = new FormData();
  fd.append('file', file);
  return fd;
};