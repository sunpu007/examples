module.exports = function (source) {
  const asyncCallback = this.async()
  let result = source.replace('Hello', '你好')
  setTimeout(() => {
    asyncCallback(null, result)
  }, 1000)
}