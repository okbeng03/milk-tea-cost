module.exports = appInfo => {
  const config = exports = {}

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1538922865971_4884'

  // add your config here
  config.middleware = []

  config.view = {
    defaultViewEngine: 'nunjucks',
    mapping: {
      '.njk': 'nunjucks'
    }
  }

  config.mongoose = {
    client: {
      url: 'mongodb://127.0.0.1:27017/milkTeaCost',
      options: {}
    }
  }

  return config
}
