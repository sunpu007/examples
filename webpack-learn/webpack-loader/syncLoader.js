const { getOptions } = require('loader-utils')

module.exports = function (source) {
  // console.log(this.query)
  // console.log(getOptions(this))
  let result = source.replace('World', getOptions(this).massage)
  // return result
  this.callback(null, result)
}