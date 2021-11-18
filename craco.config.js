const webpack = require('webpack');
const Dotenv = require('dotenv-webpack');

module.exports = {
  reactScriptsVersion: 'webpack-5-react-scripts',
  style: {
    postcss: {
      plugins: [
        require('tailwindcss'),
        require('autoprefixer'),
      ],
    },
  },
  webpack: {
    plugins: {
      add: [
        new webpack.ProvidePlugin({ adapter: ['webrtc-adapter', 'default'] }),
        new Dotenv({ safe: true })
      ]
    },
    configure: {
      optimization: {
        splitChunks: false,
      },
      module: {
        rules: [
          {
            test: require.resolve('janus-gateway'),
            use: 'exports-loader?type=commonjs&exports=Janus'
          }
        ]
      }
    }
  },

}
