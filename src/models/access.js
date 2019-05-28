import { queryAllAccesssList, queryAccess, saveAccess, updateAccess, deleteAccess, deleteAccesss } from '@/services/access';

export default {
  namespace: 'access',

  state: {
    access: {},
    list: [],
    selectList: [],
  },

  effects: {
    * fetchAllAccesssList({ payload }, { call, put }) {
      const response = yield call(queryAllAccesssList, payload);
      yield put({
        type: 'saveList',
        payload: Array.isArray(response.data) ? response.data : [],
      });
    },
    * fetchTreeSelect({ payload }, { call, put }) {
      const response = yield call(queryAllAccesssList, payload);
      yield put({
        type: 'saveSelectList',
        payload: Array.isArray(response.data) ? response.data : [],
      });
    },
    * fetchAccess({ payload }, { call, put }) {
      const response = yield call(queryAccess, payload);
      yield put({
        type: 'saveAccess',
        payload: response.data ? response.data : {},
      });
      const response1 = yield call(queryAllAccesssList, { productId: response.data.productId, accessId: response.data.accessId,accessType: '1' });
      yield put({
        type: 'saveSelectList',
        payload: Array.isArray(response1.data) ? response1.data : [],
      });
    },
    * save({ payload }, { call, put }) {
      yield call(saveAccess, payload);
      yield put({
        type: 'saveAccess',
        payload: {},
      });
      const response = yield call(queryAllAccesssList);
      yield put({
        type: 'saveList',
        payload: response.data,
      });
    },
    * update({ payload }, { call, put }) {
      yield call(updateAccess, payload);
      yield put({
        type: 'saveAccess',
        payload: {},
      });
      const response = yield call(queryAllAccesssList);
      yield put({
        type: 'saveList',
        payload: response.data,
      });
    },
    * delete({ payload }, { call, put }) {
      yield call(deleteAccess, payload);
      const response = yield call(queryAllAccesssList);
      yield put({
        type: 'saveList',
        payload: response.data,
      });
    },
    * deleteBatch({ payload }, { call, put }) {
      yield call(deleteAccesss, payload);
      const response = yield call(queryAllAccesssList);
      yield put({
        type: 'saveList',
        payload: response.data,
      });
    },
    * clearAccess(_, { put }) {
      yield put({
        type: 'saveAccess',
        payload: {},
      });
    },
    * clearTreeSelect(_, { put }) {
      yield put({
        type: 'saveSelectList',
        payload: [],
      });
    },
  },

  reducers: {
    saveList(state, action) {
      return {
        ...state,
        list: action.payload
      };
    },
    saveSelectList(state, action) {
      return {
        ...state,
        selectList: action.payload
      };
    },
    saveAccess(state, action) {
      return {
        ...state,
        access: action.payload,
      };
    },
  },
};
