/* eslint-disable no-undef */
import {
  isFunction, getGlobal, noop, getLog
} from '@sniperjs/utils';

import centralTry from './centralTry';
// 忽略错误上报本身的 url;
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
      const configCopy = { ...config };
      const originFail = config.fail || noop;
      const originSuc = config.success || noop;
      // 搜集wx.request所有除callback的配置。
      const collectConfigProp = Object
        .keys(config)
        .reduce((accu, curKey) => {
          const accuCopy = { ...accu };
          if (!isFunction(config[curKey])) {
            accuCopy[curKey] = config[curKey];
          }
          return accuCopy;
        }, {});

      collectConfigProp.method = collectConfigProp.method || 'get';

      configCopy.fail = function fail(err) {
        centralTry(() => {
          if (!isRorterRequest.call(core, configCopy.url)) {
            const errMsg = err.errMsg || '';
            if (/fail interrupted/.test(errMsg)) {
              return;
            }
            const log = getLog({
              errMsg: err.errMsg || '',
              type: 'RequestError',
              ...collectConfigProp
            });
            core.addLog(log);
            core.report();
          }
        });
        return originFail.call(this, err);
       
      };
      configCopy.success = function success(res) {
      
        const { statusCode } = res;
        centralTry(() => {
          if (
            !isRorterRequest.call(core, configCopy.url) 
            && !((statusCode >= 200 && statusCode < 300) || [304].includes(statusCode))
          )
           {
            const log = getLog({
              statusCode,
              type: 'RequestError',
              ...collectConfigProp,
              errMsg: res.errMsg || ''
            });
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

export default pluginHookRq;
