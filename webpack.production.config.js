var path = require('path')
var ProgressBar = require('progress-bar-webpack-plugin')

module.exports = {
  devtool: 'source-map',
  entry: path.resolve(__dirname, 'src/FormsyWrapper.js'),
  output: {
    filename: 'formsy-react-wrapper.js',
    path: path.resolve(__dirname, 'build'),
    library: 'FormsyWrapper',
    libraryTarget: 'umd'
  },
  plugins: [
    new ProgressBar()
  ],
  module: {
    loaders: [{
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'babel'
    }]
  }
}
