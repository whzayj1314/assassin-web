import { queryAllAppsList,queryAppPage, queryApp, saveApp, updateApp, deleteApp, deleteApps } from '@/services/app';

export default {
  namespace: 'app',

  state: {
    app: {},
    allApps:[],
    data: {
      list: [],
      pagination: {},
    },
  },

  effects: {
    * fetchAllAppsList(_, { call, put }) {
      const response = yield call(queryAllAppsList);
      yield put({
        type: 'saveAllApps',
        payload: Array.isArray(response.data) ? response.data : [],
      });
    },
    * fetchAppPage({ payload }, { call, put }) {
      const response = yield call(queryAppPage, payload);
      yield put({
        type: 'saveList',
        payload: response.data,
      });
    },
    * fetchApp({ payload }, { call, put }) {
      const response = yield call(queryApp, payload);
      yield put({
        type: 'saveApp',
        payload: response.data ? response.data : {},
      });
    },
    * save({ payload }, { call, put }) {
      yield call(saveApp, payload);
      yield put({
        type: 'saveApp',
        payload: {},
      });
      const response = yield call(queryAppPage);
      yield put({
        type: 'saveList',
        payload: response.data,
      });
    },
    * update({ payload }, { call, put }) {
      yield call(updateApp, payload);
      yield put({
        type: 'saveApp',
        payload: {},
      });
      const response = yield call(queryAppPage);
      yield put({
        type: 'saveList',
        payload: response.data,
      });
    },
    * delete({ payload }, { call, put}) {
      yield call(deleteApp, payload);
      const response = yield call(queryAppPage);
      yield put({
        type: 'saveList',
        payload: response.data,
      });
    },
    * deleteBatch({ payload }, { call, put}) {
      yield call(deleteApps, payload);
      const response = yield call(queryAppPage);
      yield put({
        type: 'saveList',
        payload: response.data,
      });
    },
    * clearApp({ payload }, { put }) {
      yield put({
        type: 'saveApp',
        payload: { ...payload },
      });
    },
  },

  reducers: {
    saveList(state, action) {
      return {
        ...state,
        data: { list: Array.isArray(action.payload.records) ? action.payload.records : [], pagination: { current: action.payload.current, pageSize: action.payload.size ,total: action.payload.total} }
      };
    },
    saveApp(state, action) {
      return {
        ...state,
        app: action.payload,
      };
    },
    saveAllApps(state, action) {
      return {
        ...state,
        allApps: action.payload,
      };
    },
  },
};
