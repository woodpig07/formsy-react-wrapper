var path = require('path')
var webpack = require('webpack')
var HtmlWebpackPlugin = require('html-webpack-plugin')
var ProgressBar = require('progress-bar-webpack-plugin')

module.exports = {
  debug: true,
  devtool: 'source-map',
  context: path.resolve(__dirname),
  entry: {
    app: [
      path.resolve(__dirname, 'main.js')
    ],
    vendors: [
      'es5-shim',
      'es5-shim/es5-sham',
      'es6-shim',
      'babel-polyfill',
      'react',
      'react-dom'
    ]
  },
  output: {
    filename: '[name].js',
    chunkFilename: '[id].js',
    path: path.resolve(__dirname, 'dev'),
    publicPath: '/'
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin('vendors', 'vendors.js'),
    new HtmlWebpackPlugin({
      inject: false,
      template: 'index.html'
    }),
    new ProgressBar()
  ],
  resolve: {
    modulesDirectories: [
      '../src',
      '../node_modules'
    ],
    extensions: ['', '.js']
  },
  module: {
    loaders: [{
      test: /\.html$/,
      loader: 'underscore-template-loader',
      query: {
        attributes: ['img:src', 'link:href']
      }
    }, {
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'babel'
    }, {
      test: /\.css$/,
      loader: 'style-loader!css-loader'
    }, {
      test: /\.styl$/,
      loader: 'style-loader!css-loader!stylus-loader'
    }, {
      test: /\.(png|jpg|gif|ico|ttf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
      loader: 'file?name=[path][name].[ext]?[hash:6]'
    }]
  },
  stylus: {
    use: [require('nib')()],
    import: path.join(__dirname, '../node_modules/nib/index.styl')
  }
}
