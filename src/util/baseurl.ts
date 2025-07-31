export const BASE_URL = 'http://192.168.223.70:3000/api';

// // Helper to resolve image URL like ProfileScreen
// export const getImageUrl = (imageUrl: string | undefined | null): string | undefined => {
//   if (!imageUrl) return undefined;
//   if (imageUrl.startsWith('http')) return imageUrl;
//   // If already starts with /uploads, just prepend baseURL
//   if (imageUrl.startsWith('/uploads')) {
//     return `${BASE_URL}${imageUrl}`;
//   }
//   // If starts with /, but not /uploads, add /uploads
//   if (imageUrl.startsWith('/')) {
//     return `${BASE_URL}/uploads${imageUrl}`;
//   }
//   // Otherwise, add /uploads/
//   return `${BASE_URL}/uploads/${imageUrl}`;
// };