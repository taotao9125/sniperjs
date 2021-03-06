import ErrorReporter from '@sniperjs/error-reporter';
import { getLog, isPlainObject, getGlobal, noop, isFunction, getSystemInfo } from '@sniperjs/utils';

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

const errorTypeReg = new RegExp('(' + ['EvalError:', 'InternalError:', 'RangeError:', 'ReferenceError:', 'SyntaxError:', 'TypeError:', 'URIError:', 'Error:' // new Error
].join('|') + ')', 'mi');

/* eslint-disable key-spacing */

function parseScriptRuntimeError(stack = '') {
  try {
    let line = '',
        col = '',
        file = '';
    const errInfoList = stack.split(/\n\s+/);
    const errMsg = errInfoList[0];
    const errStack = errInfoList.slice(1);
    const type = errMsg.match(errorTypeReg)[0].replace(/:$/, '') || '';
    const value = errMsg.split(/\n/).pop().split(':')[1].trim(); // 有可能没有stack信息，如在app.js生命周期里面throw error

    if (errStack.length) {
      // :(\d+:\d+) =>  :29:13
      // eslint-disable-next-line
      [line = '', col = ''] = (/:(\d+:\d+)/.exec(errStack[0])[1] || '').split(':'); // \w+:\/\/+    => weapp:///
      // https?:\/\/  => http:// or https://
      // eslint-disable-next-line

      file = (/(\w+:\/\/+|https?:\/\/).+:\d+:\d+/.exec(errStack[0])[0] || '').replace(/:\d+:\d+$/, '') || '';
    }

    return {
      line,
      col,
      file,
      stack,
      type,
      value
    };
  } catch (err) {
    return {
      stack,
      type: 'Error'
    };
  }
}

function parseUnhandleRejectError(stack) {
  return parseScriptRuntimeError(stack);
}

function centraTry(cb) {
  try {
    return cb && cb();
  } catch (err) {
    console.log(err);
  }
}

const pluginHookApp = {
  init(core) {
    const originApp = App;

    App = function App(options) {
      // 主题 App.config在 options.__proto__上
      const config = Object.getPrototypeOf(options);
      const originOnError = config.onError;
      const originUnRj = config.onUnhandledRejection;

      const configCopy = _objectSpread2({}, config);

      configCopy.onError = function (originParam) {
        centraTry(() => {
          const log = getLog(parseScriptRuntimeError(originParam));
          core.addLog(log);
          core.report();
        });
        return originOnError && originOnError.call(this, originParam);
      };

      configCopy.onUnhandledRejection = function (originParam) {
        centraTry(() => {
          let log = {};
          const PromiseType = 'PromiseRejectedError';
          const PageNotFoundType = 'PageNotFound'; // reason 是 Error 的实例才上报, 其他类型逻辑上只是代表是拒绝状态而已。

          if (originParam.reason && originParam.reason instanceof Error) {
            // promise里的 js runtime 错误才上报，其他错误如包装request fail不用在这里上报 ，request劫持已经上报了。
            // 非request以及非js runtime的不用上报，微信底层又一些莫名奇妙的错误，上报了也没意义
            if (errorTypeReg.test(originParam.reason.stack)) {
              log = getLog(Object.assign(parseUnhandleRejectError(originParam.reason.stack), {
                type: PromiseType
              }));
              core.addLog(log);
              core.report();
            }
          } else {
            // TODO nanachi进行了一层包装，严格意义上这里应该去劫持navigate，后期处理
            if (isPlainObject(originParam.reason)) {
              const msg = originParam.reason.errMsg || '';

              if (/navigateTo:fail/.test(msg) && /is not found/.test(msg)) {
                log = getLog({
                  value: msg,
                  type: PageNotFoundType
                });
                core.addLog(log);
                core.report();
              }
            }
          }
        });
        return originUnRj && originUnRj.call(this, originParam);
      }; // 创建新对象，挂在config原型


      const newOptions = Object.create(configCopy); // 为新对象配置属性

      Object.assign(newOptions, options);
      return originApp(newOptions);
    };

    return App;
  }

};

function isRorterRequest(url) {
  const is = !(url.indexOf(this.config.url) === -1);
  return is;
}

const pluginHookRq = {
  init(core) {
    const globalObj = getGlobal();
    const originRequest = globalObj.request;
    Object.defineProperty(globalObj, 'request', {
      writable: true,
      enumerable: true,
      configurable: true,
      value: originRequest
    });

    globalObj.request = function request(config) {
      const configCopy = _objectSpread2({}, config);

      const originFail = config.fail || noop;
      const originSuc = config.success || noop; // 搜集wx.request所有除callback的配置。

      const collectConfigProp = Object.keys(config).reduce((accu, curKey) => {
        const accuCopy = _objectSpread2({}, accu);

        if (!isFunction(config[curKey])) {
          accuCopy[curKey] = config[curKey];
        }

        return accuCopy;
      }, {});
      collectConfigProp.method = collectConfigProp.method || 'get';

      configCopy.fail = function fail(err) {
        centraTry(() => {
          if (!isRorterRequest.call(core, configCopy.url)) {
            const errMsg = err.errMsg || '';

            if (/fail interrupted/.test(errMsg)) {
              return;
            }

            const log = getLog(_objectSpread2({
              errMsg: err.errMsg || '',
              type: 'RequestError'
            }, collectConfigProp));
            core.addLog(log);
            core.report();
          }
        });
        return originFail.call(this, err);
      };

      configCopy.success = function success(res) {
        const {
          statusCode
        } = res;
        centraTry(() => {
          if (!isRorterRequest.call(core, configCopy.url) && !(statusCode >= 200 && statusCode < 300 || [304].includes(statusCode))) {
            const log = getLog(_objectSpread2(_objectSpread2({
              statusCode,
              type: 'RequestError'
            }, collectConfigProp), {}, {
              errMsg: res.errMsg || ''
            }));
            core.addLog(log);
            core.report();
          }
        });
        return originSuc.call(this, res);
      };

      originRequest.call(globalObj, configCopy);
    };
  }

};

// 1: {errMsg: "navigateTo:xxx"}
// 2: Promise {<rejected>: {…}}
// 微信小程序安卓真机无法捕捉到 promise.reject, 在真机中的log是console.warn抛出, 劫持此方法

const pluginPatchPromise = {
  init(core) {
    const {
      brand,
      system
    } = getSystemInfo();

    if (brand !== 'devtools' && /android/.test(system.toLowerCase())) {
      const originWarn = console.warn;

      console.warn = function (...args) {
        if (/unhandledRejection/.test(args[0]) && args[1] instanceof Error) {
          if (errorTypeReg.test(args[1].stack)) {
            const log = getLog({
              value: args[1].stack,
              type: 'PromiseRejectedError'
            });
            core.addLog(log);
            core.report();
          }
        }

        originWarn.apply(null, args);
      };
    }
  }

};

/* eslint-disable no-undef */
function Request(config) {
  wx.request(config);
}

class Reportor extends ErrorReporter {
  constructor(opts = {}) {
    super(opts); // 合并参数

    this.mergeConfig(opts);
    this.init();
  }

  init() {
    // 劫持 App onError
    this.use(pluginHookApp); // 劫持 Request

    this.use(pluginHookRq);
    this.use(pluginPatchPromise);
    this.applyRequest(Request);
  }

}

export default Reportor;
