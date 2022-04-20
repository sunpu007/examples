const path = require('path')

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'main.js'
  },
  resolveLoader: {
    modules: [ 'node_modules', './' ]
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          {
            loader: 'syncLoader',
            options: {
              massage: 'Tom'
            }
          },
          {
            loader: 'asyncLoader'
          }
        ]
      }
    ]
  }
}