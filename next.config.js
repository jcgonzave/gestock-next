/** @type {import('next').NextConfig} */

const withAntdLess = require('next-plugin-antd-less');

module.exports = withAntdLess({
  lessVarsFilePath: './src/styles/globals.less',
  lessVarsFilePathAppendToEndOfContent: false,
  cssLoaderOptions: {},

  reactStrictMode: true,
  swcMinify: true,
  i18n: {
    locales: ['es', 'en'],
    defaultLocale: 'es',
  },

  webpack(config) {
    return config;
  },
});
