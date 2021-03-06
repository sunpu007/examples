/**
 * Watcher
 */
function Watcher(vm, exp, cb) {
  this.cb = cb;
  this.vm = vm;
  this.exp = exp;
  this.value = this.get();
}
Watcher.prototype = {
  update() {
    this.run();
  },
  run() {
    var value = this.vm.data[this.exp];
    var oldVal = this.value;
    if (value !== oldVal) {
      this.value = value;
      this.cb.call(this.vm, value, oldVal);
    }
  },
  get() {
    Dep.target = this;  // 缓存自己
    var value = this.vm.data[this.exp]  // 强制执行监听器里的get函数
    Dep.target = null;  // 释放自己
    return value;
  }
};

/**
 * 订阅者
 */
function Dep () {
  this.subs = [];
}
Dep.prototype = {
  addSub(sub) {
    this.subs.push(sub);
  },
  notify() {
    this.subs.forEach(sub => {
      sub.update();
    });
  }
};

/**
 * 核心
 */
function defineReactive(data, key, val) {
  observer(val)
  var dep = new Dep(); 
  Object.defineProperty(data, key, {
    enumerable: true,
    configurable :true,
    get() {
      if (Dep.target) {
        dep.addSub(Dep.target)
      }
      return val;
    },
    set(newVal) {
      val = newVal;
      console.log('属性' + key + '已经被监听了，现在值为：“' + newVal.toString() + '”');
      dep.notify();
    }
  })
}
Dep.target = null;

function observer(data) {
  if (!data || typeof data !== 'object') return;
  Object.keys(data).forEach(key => {
    defineReactive(data, key, data[key]);
  })
}

/**
 * Compile
 */
function Compile(el, vm) {
  this.vm = vm;
  this.el = document.querySelector(el);
  this.fragment = null;
  this.init();
}

Compile.prototype = {
  init () {
    if (this.el) {
      this.fragment = this.nodeToFragment(this.el);
      this.compileElement(this.fragment);
      this.el.appendChild(this.fragment);
    } else {
      console.log('Dom元素不存在');
    }
  },
  nodeToFragment (el) {
    var fragment = document.createDocumentFragment();
    var child = el.firstChild;
    while (child) {
      // 将Dom元素移入fragment中
      fragment.appendChild(child);
      child = el.firstChild
    }
    return fragment;
  },
  compileElement (el) {
    var childNodes = el.childNodes;
    var self = this;
    [].slice.call(childNodes).forEach(node => {
      var reg = /\{\{(.*)\}\}/;
      var text = node.textContent;
      
      if (self.isElementNode(node)) {
        self.compile(node);
      } else if (self.isTextNode(node) && reg.test(text)) {
        self.compileText(node, reg.exec(text)[1]);
      }

      if (node.childNodes && node.childNodes.length) {
        self.compileElement(node);
      }
    });
  },
  compile(node) {
    var nodeAttrs = node.attributes;
    var self = this;
    Array.prototype.forEach.call(nodeAttrs, attr => {
      var attrName = attr.name.replace('@', 'v-on:');
      if (self.isDirective(attrName)) {
        var exp = attr.value;
        var dir = attrName.substring(2);
        if (self.isEventDirective(dir)) {  // 事件指令
          self.compileEvent(node, self.vm, exp, dir);
        } else {  // v-model 指令
          self.compileModel(node, self.vm, exp, dir);
        }
        node.removeAttribute(attrName);
      }
    });
  },
  compileText: function(node, exp) {
    var self = this;
    var initText = this.vm[exp];
    this.updateText(node, initText);
    new Watcher(this.vm, exp, function (value) {
      self.updateText(node, value);
    });
  },
  compileEvent: function (node, vm, exp, dir) {
    var eventType = dir.split(':')[1];
    var cb = vm.methods && vm.methods[exp];

    if (eventType && cb) {
      node.addEventListener(eventType, cb.bind(vm), false);
    }
  },
  compileModel: function (node, vm, exp, dir) {
    var self = this;
    var val = this.vm[exp];
    this.modelUpdater(node, val);
    new Watcher(this.vm, exp, function (value) {
      self.modelUpdater(node, value);
    });

    node.addEventListener('input', function(e) {
      var newValue = e.target.value;
      if (val === newValue) {
        return;
      }
      self.vm[exp] = newValue;
      val = newValue;
    });
  },
  updateText: function (node, value) {
    node.textContent = typeof value == 'undefined' ? '' : value;
  },
  modelUpdater: function(node, value, oldValue) {
    node.value = typeof value == 'undefined' ? '' : value;
  },
  isDirective: function(attr) {
    return attr.indexOf('v-') == 0 || attr.indexOf('@') == 0;
  },
  isEventDirective: function(dir) {
    return dir.indexOf('on:') === 0 || dir.indexOf('@') === 0;
  },
  isElementNode: function (node) {
    return node.nodeType == 1;
  },
  isTextNode: function(node) {
    return node.nodeType == 3;
  }
}

/**
 * 入口
 */
function SelfVue (options) {
  var self = this;
  this.vm = this;
  this.data = options.data
  this.methods = options.methods;

  Object.keys(this.data).forEach(function(key) {
    self.proxyKeys(key);
  });
  observer(this.data);
  new Compile(options.el, this.vm);
  options.mounted.call(this);
}

SelfVue.prototype = {
  proxyKeys(key) {
    var self = this;
    Object.defineProperty(this, key, {
      enumerable: false,
      configurable: true,
      get() {
        return self.data[key];
      },
      set(newVal) {
        self.data[key] = newVal;
      }
    });
  }
}
