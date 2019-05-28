import { queryAllTokenRuleList, queryTokenRulePage, queryTokenRule, saveTokenRule, updateTokenRule, deleteTokenRule, deleteTokenRules } from '@/services/tokenRule';

export default {
  namespace: 'tokenRule',

  state: {
    tokenRule: {},
    list:[],
    data: {
      list: [],
      pagination: {},
    },
  },

  effects: {
    * fetchAllTokenRuleList(_, { call, put }) {
      const response = yield call(queryAllTokenRuleList);
      yield put({
        type: 'saveTokenRuleList',
        payload: Array.isArray(response.data) ? response.data : [],
      });
    },
    * fetchTokenRulePage({ payload }, { call, put }) {
      const response = yield call(queryTokenRulePage, payload);
      yield put({
        type: 'saveList',
        payload: response.data,
      });
    },
    * fetchTokenRule({ payload }, { call, put }) {
      const response = yield call(queryTokenRule, payload);
      yield put({
        type: 'saveTokenRule',
        payload: response.data ? response.data : {},
      });
    },
    * save({ payload }, { call, put }) {
      yield call(saveTokenRule, payload);
      yield put({
        type: 'saveTokenRule',
        payload: {},
      });
      const response = yield call(queryTokenRulePage);
      yield put({
        type: 'saveList',
        payload: response.data,
      });
    },
    * update({ payload }, { call, put }) {
      yield call(updateTokenRule, payload);
      yield put({
        type: 'saveTokenRule',
        payload: {},
      });
      const response = yield call(queryTokenRulePage);
      yield put({
        type: 'saveList',
        payload: response.data,
      });
    },
    * delete({ payload }, { call, put}) {
      yield call(deleteTokenRule, payload);
      const response = yield call(queryTokenRulePage);
      yield put({
        type: 'saveList',
        payload: response.data,
      });
    },
    * deleteBatch({ payload }, { call, put}) {
      yield call(deleteTokenRules, payload);
      const response = yield call(queryTokenRulePage);
      yield put({
        type: 'saveList',
        payload: response.data,
      });
    },
    * clearTokenRule({ payload }, { put }) {
      yield put({
        type: 'saveTokenRule',
        payload: { ...payload },
      });
    },
  },

  reducers: {
    saveTokenRuleList(state, action) {
      return {
        ...state,
        list: action.payload,
      };
    },
    saveList(state, action) {
      return {
        ...state,
        data: { list: Array.isArray(action.payload.records) ? action.payload.records : [], pagination: { current: action.payload.current, pageSize: action.payload.size,total: action.payload.total } }
      };
    },
    saveTokenRule(state, action) {
      return {
        ...state,
        tokenRule: action.payload,
      };
    },
  },
};
