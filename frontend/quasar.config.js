import { config } from 'dotenv';
import { configure } from 'quasar/wrappers';

config();

export default configure(() => {
  return {
    css: ['app.scss'],

    build: {
      vueRouterMode: 'history'
    },

    devServer: {
      open: true,
      proxy: {
        '/api': {
          target: process.env.API_URL || 'http://localhost:3000',
          changeOrigin: true
        }
      }
    },

    env: {
      API_URL: process.env.API_URL || 'http://localhost:3000'
    },

    framework: {
      plugins: []
    }
  };
});
