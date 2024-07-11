const { merge } = require('webpack-merge')
const common = require('./webpack.common')

module.exports = merge(common, {
  devtool: false,
  mode: 'production',
  plugins: [],
  output: {},
  optimization: {
    splitChunks: {
      chunks: 'all',
      name: false,
      minSize: 0,
    },
    minimize: true,
    minimizer: [],
  },
})
