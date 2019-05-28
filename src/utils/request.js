import fetch from 'dva/fetch';
import { notification, message } from 'antd';
import router from 'umi/router';
import { getLocale, formatMessage } from 'umi/locale';
import hash from 'hash.js';
import { isAntdPro } from './utils';
import { getToken, removeAll } from './authority';

const codeMessage = {
  200: '服务器成功返回请求的数据。',
  201: '新建或修改数据成功。',
  202: '一个请求已经进入后台排队（异步任务）。',
  204: '删除数据成功。',
  400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
  401: '用户没有权限（用户名、密码错误）。',
  403: '没有权限的操作。',
  404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
  406: '请求的格式不可得。',
  410: '请求的资源被永久删除，且不会再得到的。',
  422: '当创建一个对象时，发生一个验证错误。',
  500: '服务器发生错误，请检查服务器。',
  502: '网关错误。',
  503: '服务不可用，服务器暂时过载或维护。',
  504: '网关超时。',
};

const checkStatus = response => {
  const errortext = codeMessage[response.status] || response.statusText;
  const error = new Error(errortext);
  error.name = response.status;
  error.response = response;
  if (response.status <= 504 && response.status >= 500) {
    router.push('/exception/500');
  }
  if (response.status >= 404 && response.status < 422) {
    router.push('/exception/404');
  }
  return response;
};

const cachedSave = (response, hashcode) => {
  /**
   * Clone a response data and store it in sessionStorage
   * Does not support data other than json, Cache only json
   */
  const contentType = response.headers.get('Content-Type');
  if (contentType && contentType.match(/application\/json/i)) {
    // All data is saved as text
    response
      .clone()
      .text()
      .then(content => {
        sessionStorage.setItem(hashcode, content);
        sessionStorage.setItem(`${hashcode}:timestamp`, Date.now());
      });
  }
  return response;
};

/**
 * Requests a URL, returning a promise.
 *
 * @param  {string} url       The URL we want to request
 * @param  {object} [option] The options we want to pass to "fetch"
 * @return {object}           An object containing either "data" or "err"
 */
export default function request(url, option) {
  const options = {
    expirys: isAntdPro(),
    ...option,
  };
  /**
   * Produce fingerprints based on url and parameters
   * Maybe url has the same parameters
   */
  const fingerprint = url + (options.body ? JSON.stringify(options.body) : '');
  const hashcode = hash
    .sha256()
    .update(fingerprint)
    .digest('hex');

  const defaultOptions = {
    credentials: 'include',
  };
  const newOptions = { ...defaultOptions, ...options };

  const lang = getLocale();
  newOptions.headers = {
    ...newOptions.headers,
    'Lang': lang,
  };
  const token = getToken();
  if (token) {
    newOptions.headers = {
      ...newOptions.headers,
      'Authorization': token,
    };
  }

  if (
    newOptions.method === 'POST' ||
    newOptions.method === 'PUT' ||
    newOptions.method === 'DELETE'
  ) {
    if (!(newOptions.body instanceof FormData)) {
      newOptions.headers = {
        Accept: 'application/json',
        'Content-Type': 'application/json; charset=utf-8',
        ...newOptions.headers,
      };
      newOptions.body = JSON.stringify(newOptions.body);
    } else {
      // newOptions.body is FormData
      newOptions.headers = {
        Accept: 'application/json',
        ...newOptions.headers,
      };
    }
  }

  const expirys = options.expirys && 60;
  // options.expirys !== false, return the cache,
  if (options.expirys !== false) {
    const cached = sessionStorage.getItem(hashcode);
    const whenCached = sessionStorage.getItem(`${hashcode}:timestamp`);
    if (cached !== null && whenCached !== null) {
      const age = (Date.now() - whenCached) / 1000;
      if (age < expirys) {
        const response = new Response(new Blob([cached]));
        return response.json();
      }
      sessionStorage.removeItem(hashcode);
      sessionStorage.removeItem(`${hashcode}:timestamp`);
    }
  }

  return fetch(url, newOptions)
    .then(response => checkStatus(response, newOptions.method))
    .then(response => cachedSave(response, hashcode))
    .then(response => {
      // DELETE and 204 do not return data by default
      // using .json will report an error.
      // if (newOptions.method === 'DELETE' || response.status === 204) {
      //   return response.text();
      // }
      if (response.status === 200) {
        if (newOptions.method === 'POST') {
          message.success(formatMessage({ id: 'assassin.method.post.success' }));
        }
        if (newOptions.method === 'PUT') {
          message.success(formatMessage({ id: 'assassin.method.put.success' }));
        }
        if (newOptions.method === 'DELETE') {
          message.success(formatMessage({ id: 'assassin.method.delete.success' }));
        }
      }
      return response.json();
    })
    .then(response => {
      if (response.access_token) {
        return response
      }
      if (response.code === 0) {
        return response
      }
      const status = response.code;
      if (status === 401) {
        removeAll();
        notification.error({
          message: response.message,
        });
        // @HACK
        /* eslint-disable no-underscore-dangle */
        window.g_app._store.dispatch({
          type: 'login/logout',
        });
      }
      if (status === 403) {
        notification.error({
          message: response.message,
        });
      }
      if (status === 400) {
        message.error(response.message);
      }
      throw response
    })
}
