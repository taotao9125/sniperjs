function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly) symbols = symbols.filter(function (sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    });
    keys.push.apply(keys, symbols);
  }

  return keys;
}

function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};

    if (i % 2) {
      ownKeys(Object(source), true).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(Object(source)).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }

  return target;
}

function _defineProperty$1(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function ownKeys$1(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly) symbols = symbols.filter(function (sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    });
    keys.push.apply(keys, symbols);
  }

  return keys;
}

function _objectSpread2$1(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};

    if (i % 2) {
      ownKeys$1(Object(source), true).forEach(function (key) {
        _defineProperty$1(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys$1(Object(source)).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }

  return target;
}
/* eslint-disable no-empty */

/* eslint-disable no-undef */


const {
  toString
} = Object.prototype;

function isPlainObject(target) {
  return toString.call(target) === '[object Object]';
}

function isString(target) {
  return toString.call(target) === '[object String]';
}

function isArray(target) {
  return toString.call(target) === '[object Array]';
}

function isEmptyObject(target) {
  if (!isPlainObject(target)) return false;
  return Object.keys(target).length > 0;
}

function isBoolean(target) {
  return toString.call(target) === '[object Boolean]';
}

function isFunction(target) {
  return typeof target === 'function';
}

function isNumber(target) {
  // eslint-disable-next-line no-restricted-globals
  return toString.call(target) === '[object Number]' && !isNaN(target);
}

function isPromise(object) {
  if (Promise && Promise.resolve) {
    return Promise.resolve(object) == object;
  }
}

function extend(target, source) {
  return _objectSpread2$1(_objectSpread2$1({}, target), source);
}

function getAgent() {
  try {
    if (window && window.history) {
      return 'WEB_APP';
    }

    if (wx) {
      return 'WX_MINI_APP';
    }

    if (swan) {
      return 'BAIDU_MINI_APP';
    }

    if (my) {
      return 'ALIPAY_MINI_APP';
    }

    if (tt) {
      return 'TT_MINI_APP';
    }

    if (qq) {
      return 'QQ_MINI_APP';
    }

    if (quick) {
      return 'QUICK_APP';
    }
  } catch (err) {
    return 'UNKNOWN_APP';
  }
}

function getGlobal() {
  try {
    if (window && window.history) {
      return window;
    }

    if (wx) {
      return wx;
    }

    if (swan) {
      return swan;
    }

    if (my) {
      return my;
    }

    if (tt) {
      return tt;
    }

    if (qq) {
      return qq;
    }
  } catch (err) {
    return {};
  }
}

function getSystemInfo() {
  // 这里做个缓存
  const globalObj = getGlobal();
  const key = '__sniper__internal__data__';

  if (globalObj[key] && !isEmptyObject(globalObj[key].systemInfo || {})) {
    return globalObj[key].systemInfo;
  }

  try {
    const systemInfo = globalObj.getSystemInfoSync();
    globalObj[key] = globalObj[key] || {};
    globalObj[key].systemInfo = systemInfo;
    return systemInfo;
  } catch (err) {
    return {};
  }
}

function getMeta() {
  let net = ''; // try {
  //   // eslint-disable-next-line
  //  net = getNet();
  // } catch(err) {
  //   // eslint-disable-next-line
  // }

  if (getAgent() === 'WEB_APP') {
    return _getWebMeta();
  }

  return {
    agent: getAgent(),
    system: Object.assign({}, getSystemInfo(), {
      net: net
    })
  };
}

function _getWebMeta() {
  const uType = !!(window['hysdk'] && window.hysdk.env === 'hy') ? 'appH5' : 'h5';
  const winSearch = window.location.search.replace('?', '');
  const versionSearch = winSearch.split('&').map(item => {
    const data = {},
          arr = item.split('=');
    data[arr[0]] = arr[1];
    return data;
  }).filter(d => {
    return d['version'];
  });
  return {
    p: uType,
    logType: 'ue',
    c: {
      ua: window.navigator.userAgent || '',
      send_time: +new Date(),
      cookie: document.cookie,
      user_type: uType,
      version: versionSearch.length ? versionSearch[0]['version'] : '1'
    }
  };
}

function throwErr(err) {
  throw new Error(err);
}

const strategies = {
  url: {
    validate(val) {
      if (!val) {
        throwErr(this.msgRequred);
      }
    },

    msgRequred: 'SNIPER ERROR: 配置中 url 字段必填.'
  },
  appVersion: {
    validate(val) {
      if (!val) return;

      if (!isString(val)) {
        throwErr(this.msgTypeErr);
      }
    },

    msgTypeErr: 'SNIPER ERROR: 配置中 appVersion 字段类型需为 String.'
  },
  env: {
    validate(val) {
      if (!val) return;

      if (!isString(val)) {
        throwErr(this.msgTypeErr);
      }
    },

    msgTypeErr: 'SNIPER ERROR: 配置中 env 字段类型需为 String.'
  },
  repeat: {
    validate(val) {
      if (!isNumber(val)) {
        throwErr(this.msgTypeErr);
      }
    },

    msgTypeErr: 'SNIPER ERROR: 配置中 repeat 字段类型需为 Number.'
  },
  ignoreErrors: {
    validate(val) {
      if (!isArray(val)) {
        throwErr(this.msgTypeErr);
      }
    },

    msgTypeErr: 'SNIPER ERROR: 配置中 ignoreErrors 字段类型需为 Array.'
  },
  autoBreadcrumbs: {
    validate(val) {
      if (!isBoolean(val)) {
        throwErr(this.msgTypeErr);
      }
    },

    msgTypeErr: 'SNIPER ERROR: 配置中 autoBreadcrumbs 字段类型需为 Array.'
  },
  breadcrumbsMax: {
    validate(val) {
      if (!isNumber(val)) {
        throwErr(this.msgTypeErr);
      }
    },

    msgTypeErr: 'SNIPER ERROR: 配置中 breadcrumbsMax 字段类型需为 Number.'
  },
  random: {
    validate(val) {
      if (!isNumber(val)) {
        throwErr(this.msgTypeErr);
      } else if (!(val > 0 && val <= 1)) {
        throwErr(this.msgRangeErr);
      }
    },

    msgTypeErr: 'SNIPER ERROR: 配置中 breadcrumbsMax 字段类型需为 Number.',
    msgRangeErr: 'SNIPER ERROR: 配置中 breadcrumbsMax 字段范围需满足 (0, 1]'
  },
  delay: {
    validate(val) {
      if (!isNumber(val)) {
        throwErr(this.msgTypeErr);
      }
    },

    msgTypeErr: 'SNIPER ERROR: 配置中 delay 字段类型需为 Number.'
  },
  beforeReport: {
    validate(val) {
      if (!isFunction(val)) {
        throwErr(this.msgTypeErr);
      }
    },

    msgTypeErr: 'SNIPER ERROR: 配置中 beforeReport 字段类型需为 Function.'
  }
};

function proxyValidate() {
  const proxyObj = {};
  return new Proxy(proxyObj, {
    set(target, key, val) {
      strategies[key].validate(val); // eslint-disable-next-line no-param-reassign

      target[key] = val;
      return true;
    }

  });
}

function validateConfig(config) {
  const proxy = proxyValidate();
  Object.keys(config).forEach(prop => {
    proxy[prop] = config[prop];
  });
}

class BehaviorReporter {
  constructor() {
    this.logQueue = [];
    this.config = {
      url: '',
      appkey: '',
      // 以后商业化要用到的
      delay: 1000,
      // 延迟, 合并上报
      appVersion: '',
      // 应用Version
      env: '',

      // 环境
      beforeReport(log) {
        // 1.可在这里劫持上报的数据, 比如添加userid, session等等
        // 2.如果return false, 则不用内置http上报, 此时可以在这里自定义自己的http上报方式
        //   比如以后浏览器端，可以自定义 ajax 上报还是用图片上报
        return log;
      }

    };
    this.applyRequested = false;
    this.delayTimer = -1;
  }

  mergeConfig(opts) {
    validateConfig(opts);
    this.config = extend(this.config, opts);
  }

  addLog(log) {
    this.logQueue.push(log);
    return this;
  }

  getLog() {
    return this.logQueue.slice();
  }

  clearLog() {
    this.logQueue = [];
    return this;
  }

  report() {
    const curLogQueue = this.getLog();

    if (this.config.delay > 0) {
      if (this.delayTimer) {
        clearTimeout(this.delayTimer);
      }

      this.delayTimer = setTimeout(() => {
        this.sendLog(curLogQueue);
      }, this.config.delay);
    } else {
      this.sendLog(curLogQueue);
    }
  }

  gLog(log) {
    const {
      appVersion,
      env
    } = this.config;
    return _objectSpread2(_objectSpread2({}, getMeta()), {}, {
      appVersion,
      env,
      logs: log
    });
  }

  sendLog(logQueue = []) {
    const log = logQueue.slice();
    if (!log.length) return;
    const data = this.gLog(log);
    const ret = isFunction(this.config.beforeReport) && this.config.beforeReport.call(this, data); // 异步回调

    if (isPromise(ret)) {
      ret.then(res => {
        if (isBoolean(res) && res === false) {
          // 用户阻止默认上报后，可在 beforeReport 可自定义 request 上报
          return;
        }

        this.startReport(res);
      });
    } else {
      if (isBoolean(ret) && ret === false) {
        // 用户阻止默认上报后，可在 beforeReport 可自定义 request 上报
        return;
      }

      this.startReport(ret);
    }
  }

  startReport(data) {
    this.clearLog(); // 默认上报

    this.request({
      url: this.config.url,
      method: 'POST',
      data
    });
  }

  use(plugin, ...args) {
    plugin.init(this, ...args);
  }

  applyRequest(request) {
    if (this.applyRequested) return false;
    this.request = request;
    this.applyRequested = true;
    return true;
  }

}

export default BehaviorReporter;