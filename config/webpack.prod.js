const { merge } = require('webpack-merge')
const common = require('./webpack.common')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const path = require('path')
const glob = require('glob')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const { PurgeCSSPlugin } = require('purgecss-webpack-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const { PROJECT_PATH } = require('./constant')

module.exports = merge(common, {
  devtool: false,
  mode: 'production',
  plugins: [
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: 'css/[name].[contenthash:8].css',
      chunkFilename: 'css/[name].[contenthash:8].css',
      ignoreOrder: false,
    }),
    new PurgeCSSPlugin({
      paths: glob.sync(`${path.resolve(PROJECT_PATH, './src')}/**/*.{tsx,less,css}`, { nodir: true }),
      whitelist: ['html', 'body'],
    }),
  ],
  output: {},
  optimization: {
    splitChunks: {
      chunks: 'all',
      name: false,
      minSize: 0,
    },
    minimize: true,
    minimizer: [
      new TerserPlugin({
        extractComments: false, // 去掉所有的注释，除了有特殊标记的注释
        terserOptions: {
          compress: { pure_funcs: ['console.log'] }, // 将代码的 console.log 去掉
        },
      }),
      new CssMinimizerPlugin(), // 下面压缩 css 的代码
    ],
  },
})
