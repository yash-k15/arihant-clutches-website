import siteConfig from './config/siteConfig.js';

export const BASE_URL = process.env.REACT_APP_API_URL || '';
export const PRODUCTS_URL = '/api/products';
export const USERS_URL = '/api/users';
export const ORDERS_URL = '/api/orders';
export const UPLOAD_URL = '/api/upload';
export const PAYMENT_URL = '/api/payment';
export const WISHLIST_URL = '/api/wishlist';
export const GUEST_WISHLIST_URL = '/api/wishlist/guest';
export const GUEST_WISHLIST_SHARE_URL = '/api/wishlist/guest/share';
export const USER_ADDRESSES_URL = '/api/users/addresses';
export const LOGO_URL = siteConfig.assets.logoUrl;
