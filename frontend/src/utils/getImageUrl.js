// src/utils/getImageUrl.js
export function getImageUrl(imagePath) {
  // Named export
  if (!imagePath) return "";
  return `http://localhost:8080${imagePath}`;
}
