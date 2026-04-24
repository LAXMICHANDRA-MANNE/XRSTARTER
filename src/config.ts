const isProd = import.meta.env.PROD;

export const API_URLS = {
  NODE_BACKEND: isProd ? 'https://xrstarter-node-backend.onrender.com' : 'http://localhost:4000',
  PYTHON_ENGINE: isProd ? 'https://xrstarter-python2-engine.onrender.com' : 'http://localhost:5000',
};
