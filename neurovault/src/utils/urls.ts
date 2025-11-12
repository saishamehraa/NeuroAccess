const isProd = process.env.NODE_ENV === 'production';

export const APP_URLS = {
  neurovault: isProd 
    ? '/neurovault/' // for production, adjust to real path later
    : 'http://localhost:3001/neurovault/',

  promptgallery: isProd 
    ? '/neuropromptgallery/' 
    : 'http://localhost:3002/neuropromptgallery/',

  aicomparison: isProd 
    ? '/neuroaicomparison/' 
    : 'http://localhost:3003/neuroaicomparison/'
};
