const path = require('path')
const webpack = require('webpack')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin');

const outpath = {
  TEST_ASSETS_PUBLIC_PATH: '/dist/test/',
  BASE_TV_ASSETS_PUBLIC_PATH: '/tpl/assets/videoplayer/',
  BASE_LIVE_ASSETS_PUBLIC_PATH: '/tpl_pc/assets/videoplayer/',
  LIVE_ASSETS_PUBLIC_PATH: '//image.huaren.tv/live/tpl_pc/assets/videoplayer/',
  CLIENT_ASSETS_PUBLIC_PATH: '/static/player/',
  SYDNEY_ASSETS_PUBLIC_PATH: '/tpl_h5/live/assets/videoplayer2'
}

let args = process.argv.splice(2)
let name = args[2] || './'
let assetsPublicPath = '/'
// let productionGzip = true

console.log('name', name)

switch (name) {
  case 'test':
    assetsPublicPath = outpath.TEST_ASSETS_PUBLIC_PATH
    break
  case 'base-tv':
    assetsPublicPath = outpath.BASE_TV_ASSETS_PUBLIC_PATH
    break
  case 'tv':
    assetsPublicPath = outpath.TEST_ASSETS_PUBLIC_PATH
    break
  case 'tv2':
    assetsPublicPath = outpath.TEST_ASSETS_PUBLIC_PATH
    // productionGzip = false
    break
  case 'base-live':
      assetsPublicPath = outpath.BASE_LIVE_ASSETS_PUBLIC_PATH
    break
  case 'live':
    assetsPublicPath = outpath.LIVE_ASSETS_PUBLIC_PATH
    break
  case 'client':
    assetsPublicPath = outpath.CLIENT_ASSETS_PUBLIC_PATH
    // productionGzip = false
    break
  case 'sydney':
    assetsPublicPath = outpath.SYDNEY_ASSETS_PUBLIC_PATH
    break
}

console.log(`cdn path: ${assetsPublicPath}`)

module.exports = {
  outputDir: path.resolve(__dirname, './dist', name),
  publicPath: assetsPublicPath,

  filenameHashing: false,
  configureWebpack: {
    output: {
      library: 'kanPlayer',
      libraryTarget: 'umd',
      umdNamedDefine: true
    },
    resolve: {
      extensions: ['.js', '.vue', '.json'],
      alias: {
        '@': path.join(__dirname, 'src'),
        'vue$': 'vue/dist/vue.esm.js',
        'assets': path.join(__dirname, 'src/assets'),
        'components': path.join(__dirname, 'src/components'),
        'utils': path.join(__dirname, 'src/utils/utils.js'),
        'test': path.join(__dirname, 'test')
      }
    }
  },

  // devServer: {
  //   sockHost: '192.168.2.243'
  // },

  chainWebpack: config => {
    config.plugin('ignore')
      .use(new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)); // 忽略 /moment/locale 下的所有文件
    // config.plugin('analyzer')
    //   .use(new BundleAnalyzerPlugin()) // 使用 webpack-bundle-analyzer 生成报表
    config.plugin("loadshReplace")
      .use(new LodashModuleReplacementPlugin()); // 优化lodash

    if (process.env.NODE_ENV === 'production') {
      config.merge({
        optimization: {
          minimize: true,
          splitChunks: {
            chunks: 'all',
            minSize: 30000,
            minChunks: 2,
            automaticNameDelimiter: '.',
            cacheGroups: {
              vendor: {
                name: 'app'
              },
            },
          },
        }
      });
    }
  }
}
