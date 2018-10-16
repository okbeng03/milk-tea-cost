const csvtojson = require('csvtojson')

module.exports = function (path) {
  return new Promise((resolve, reject) => {
    csvtojson()
      .fromFile(path)
      .then(data => {
        resolve(data)
      })
      .catch(err => {
        reject(err)
      })
  })
}
