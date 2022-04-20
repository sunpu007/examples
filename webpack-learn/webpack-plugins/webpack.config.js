const path = require('path')

const DemoWebpackPlugin = require('./demoWebpackPlugin')

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'main.js'
  },
  plugins: [
    new DemoWebpackPlugin()
  ]
}