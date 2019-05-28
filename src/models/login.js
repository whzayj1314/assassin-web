import { routerRedux } from 'dva/router';
import { stringify } from 'qs';
import { getFakeCaptcha, accountLogin } from '@/services/api';
import { setAuthority, setToken, removeAll } from '@/utils/authority';
import { getPageQuery } from '@/utils/utils';
import { reloadAuthorized } from '@/utils/Authorized';

export default {
  namespace: 'login',

  state: {
    status: undefined,
  },

  effects: {
    * login({ payload }, { call, put }) {
      const response = yield call(accountLogin, payload);
      if (response.access_token) {
        yield put({
          type: 'changeLoginStatus',
          payload: {
            type: 'login',
            status: true,
            data: { ...response },
          },
        });
        reloadAuthorized();
        const urlParams = new URL(window.location.href);
        const params = getPageQuery();
        let { redirect } = params;
        if (redirect) {
          const redirectUrlParams = new URL(redirect);
          if (redirectUrlParams.origin === urlParams.origin) {
            redirect = redirect.substr(urlParams.origin.length);
            if (redirect.match(/^\/.*#/)) {
              redirect = redirect.substr(redirect.indexOf('#') + 1);
            }
          } else {
           redirect =null;
          }
        }
        yield put(routerRedux.replace(redirect || '/'));
      }
    },

    * getCaptcha({ payload }, { call }) {
      yield call(getFakeCaptcha, payload);
    },

    * logout(_, { put }) {
      yield put({
        type: 'changeLoginStatus',
        payload: {
          status: false,
          currentAuthority: 'guest',
          type: 'logout',
        },
      });
      reloadAuthorized();
      if(window.location.pathname !== "/user/login"){
        yield put(
          routerRedux.replace({
            pathname: '/user/login',
            search: stringify({
              redirect: window.location.href,
            }),
          }),
        );
      }
    },
  },

  reducers: {
    changeLoginStatus(state, { payload }) {
      const { type, data } = payload;
      if (type === 'login') {
        const token = `Bearer ${data.access_token}`;
        setToken(token);
        setAuthority(payload.currentAuthority);
      }
      else {
        removeAll();
      }
      return {
        ...state,
        status: payload.status,
        type: payload.type,
      };
    },
  },
};
