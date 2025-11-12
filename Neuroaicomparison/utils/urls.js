/* const isProd = process.env.NODE_ENV === 'production';
const origin = window.location.origin;

export const APP_URLS = {
  neuroaccess: isProd 
    ? `${origin}/`                       // main app at root
    : 'http://localhost:3000',

  neurovault: isProd 
    ? `${origin}/neurovault/`            // same origin in prod
    : 'http://localhost:3001',

  promptgallery: isProd 
    ? `${origin}/neuropromptgallery/`
    : 'http://localhost:3002',

  aicomparison: isProd 
    ? `${origin}/neuroaicomparison/`
    : 'http://localhost:3003'
};
*/

const isProd = process.env.NODE_ENV === 'production';

// DO NOT use window.location.origin here

export const APP_URLS = {
  neuroaccess: isProd 
    ? `/`                       // Use relative path for production
    : 'http://localhost:3000',

  neurovault: isProd 
    ? `/neurovault/`            // Use relative path for production
    : 'http://localhost:3001',

  promptgallery: isProd 
    ? `/neuropromptgallery/`    // Use relative path for production
    : 'http://localhost:3002',

  aicomparison: isProd 
    ? `/neuroaicomparison/`     // Use relative path for production
    : 'http://localhost:3003'
};