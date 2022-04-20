const fs = require('fs')
const path = require('path')

const parser = require('@babel/parser')
const traverse = require('@babel/traverse').default
const babel = require('@babel/core')

const getModuleInfo = file => {
  const body = fs.readFileSync(file, 'utf-8')
  const ast = parser.parse(body, { sourceType: 'module' })
  const deps = {}
  traverse(ast, {
    ImportDeclaration({ node }) {
      const dirname = path.dirname(file)
      const abs = './' + path.join(dirname, node.source.value).replace('\\', '/');
      deps[node.source.value] = path.extname(node.source.value) === '' ? abs + '.js' : abs
    }
  })
  const { code } = babel.transformFromAst(ast, null, {
    presets: [ '@babel/preset-env' ]
  })
  const moduleInfo = { file, deps, code }
  return moduleInfo
}

const parseModules = file => {
  const depsGraph = {}

  const entry = getModuleInfo(file)
  const temp = [ entry ]
  
  for (const value of temp) {
    const deps = value.deps
    if (deps) {
      for (const key in deps) {
        if (deps.hasOwnProperty(key)) {
          temp.push(getModuleInfo(deps[key]))
        }
      }
    } 
  }

  temp.forEach(moduleInfo => {
    depsGraph[moduleInfo.file] = {
      deps: moduleInfo.deps,
      code: moduleInfo.code
    }
  })
  return depsGraph
}

const bundle = file => {
  const depsGraph = JSON.stringify(parseModules(file))
  return `(function (graph) {
      function require(file) {
        const exports = {}
        function absRequire(relPath) {
          return require(graph[file].deps[relPath])
        }
        (function (require, exports, code) {
          eval(code)
        })(absRequire, exports, graph[file].code)
        return exports
      }
      require('${file}')
    })(${depsGraph})`
}

const content = bundle('./src/index.js')

!fs.existsSync('./dist') && fs.mkdirSync('./dist')
fs.writeFileSync('./dist/main.js', content, { encoding: 'utf8' })