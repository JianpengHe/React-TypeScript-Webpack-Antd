const { merge } = require('webpack-merge')
const common = require('./webpack.common')

module.exports = merge(common, {
  devtool: 'cheap-module-source-map',
  mode: 'development',
  devServer: {
    host: 't.hejianpeng.com', // 指定 host，不设置的话默认是 localhost
    port: 65432, // 指定端口，默认是8080
    compress: true, // 是否启用 gzip 压缩
    open: true, // 打开默认浏览器
  },
})
