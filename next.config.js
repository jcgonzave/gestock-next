/** @type {import('next').NextConfig} */

const withAntdLess = require('next-plugin-antd-less');

module.exports = withAntdLess({
  lessVarsFilePath: './src/styles/globals.less',
  lessVarsFilePathAppendToEndOfContent: false,
  cssLoaderOptions: {},

  reactStrictMode: true,
  swcMinify: true,

  webpack(config) {
    return config;
  },
});
