/* eslint-disable no-empty */
/* eslint-disable no-undef */
const { toString } = Object.prototype;

function isUndefined(target) {
  // eslint-disable-next-line
  return target === void 0;
}

function isRegExp(target) {
  return toString.call(target) === '[object RegExp]';
}

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

function isPromise(object){
  if(Promise && Promise.resolve){
    return Promise.resolve(object) == object;
  }
}

function isDev(env) {
  return /^dev/.test(env);
}

function getNow() {
  return +new Date();
}

function extend(target, source) {
  return { ...target, ...source };
}

function compose(...fns) {
  return function pipe(...args) {
    if (!fns.length) return args[0];
    let index = 0;
    let ret = fns[index].apply(this, args);
    // eslint-disable-next-line no-plusplus
    while (++index < fns.length) {
      ret = fns[index].call(this, ret);
    }
    return ret;
  };
}

function noop() {

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
  } catch(err) {
    return {};
  } 
}

function getSystemInfo() {
 // 这里做个缓存
 const globalObj = getGlobal();
 const key = '__sniper__internal__data__';
 if (
  globalObj[key]
  && !isEmptyObject(globalObj[key].systemInfo || {})
 ) {
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

function getRoutes() {
  // eslint-disable-next-line prefer-const
  let defaultRouteInfo = {
    path: '',
    query: {},
    routeStack: []
  };
  const pages = getCurrentPages();
  let curPage = {};
  if (pages.length) {
    curPage = pages[pages.length - 1];
    const { route = '', options = {} } = curPage;
    defaultRouteInfo.path = route;
    defaultRouteInfo.query = options;
    // https://developers.weixin.qq.com/miniprogram/dev/framework/app-service/route.html
    defaultRouteInfo.routeStack = pages.map((curPage) => {
      return curPage.route;
    });
  }
  return defaultRouteInfo;
}

function getLog(log) {
  const defaultLog = {
      stack: '',
      line: '',
      col: '',
      file: '',
      type: '',
      value: '',
      time: getNow(),
      pageRoute: getRoutes()
  };
  return Object.assign(defaultLog, log);
}

function getNet() {
  const globalObj = getGlobal();
  return new Promise(function(rel, rej) {
    globalObj.getNetworkType({
      success (res) {
        const networkType = res.networkType;
        rel(networkType);
      },
      fail(err) {
        rej(err);
      }
    });
  });
 
}


function getMeta() {
  return {
    agent: getAgent(),
    system: Object.assign({}, getSystemInfo())
  };
}

export {
  getNow,
  getAgent,
  getGlobal,
  getSystemInfo,
  getRoutes,
  getLog,
  getNet,
  getMeta,
  extend,
  noop,
  compose,
  isUndefined,
  isPlainObject,
  isString,
  isArray,
  isBoolean,
  isEmptyObject,
  isFunction,
  isRegExp,
  isDev,
  isNumber,
  isPromise
};
