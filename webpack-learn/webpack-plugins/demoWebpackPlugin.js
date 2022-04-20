class DemoWebpackPlugin{
  constructor() {
    console.log('初始化...')
  }
  apply(compiler) {
    // 同步
    compiler.hooks.compile.tap('aaa', compilation => {
      console.log(compilation)
    })
    // 异步
    compiler.hooks.emit.tapAsync('bbb', (compilation, next) => {
      compilation.assets['README.md'] = {
        source: _ => '> 我是小白龙',
        size: _ => 25
      }
      next()
    })
  }
}

module.exports = DemoWebpackPlugin