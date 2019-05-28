import { query as queryUsers, queryCurrent, queryUserAmount, queryUserPage, queryUser, saveUser, updateUser, deleteUser, deleteUsers, queryRoleTransferList, queryTargetKeys, saveUserRole } from '@/services/user';

export default {
  namespace: 'user',

  state: {
    transferList: [],
    targetKeys: [],
    currentUser: {},
    amount: {},
    user: {},
    data: {
      list: [],
      pagination: {},
    },
  },

  effects: {
    *fetch(_, { call, put }) {
      const response = yield call(queryUsers);
      yield put({
        type: 'save',
        payload: response,
      });
    },
    *fetchCurrent(_, { call, put }) {
      const response = yield call(queryCurrent);
      yield put({
        type: 'saveCurrentUser',
        payload: response,
      });
    },
    *fetchAmount(_, { call, put }) {
      const response = yield call(queryUserAmount);
      yield put({
        type: 'saveUserAmount',
        payload: response,
      });
    },
    * fetchUserPage({ payload }, { call, put }) {
      const response = yield call(queryUserPage, payload);
      yield put({
        type: 'saveList',
        payload: response.data,
      });
    },
    * fetchTransfer({ payload }, { call, put }) {
      const response = yield call(queryRoleTransferList);
      yield put({
        type: 'saveTransferList',
        payload: Array.isArray(response.data) ? response.data : [],
      });
      const response1 = yield call(queryTargetKeys, payload);
      yield put({
        type: 'saveTargetKeys',
        payload: Array.isArray(response1.data) ? response1.data : [],
      });
    },
    * fetchUser({ payload }, { call, put }) {
      const response = yield call(queryUser, payload);
      yield put({
        type: 'saveUser',
        payload: response.data ? response.data : {},
      });
    },
    * save({ payload }, { call, put }) {
      yield call(saveUser, payload);
      yield put({
        type: 'saveUser',
        payload: {},
      });
      const response = yield call(queryUserPage);
      yield put({
        type: 'saveList',
        payload: response.data,
      });
    },
    * update({ payload }, { call, put }) {
      yield call(updateUser, payload);
      yield put({
        type: 'saveUser',
        payload: {},
      });
      const response = yield call(queryUserPage);
      yield put({
        type: 'saveList',
        payload: response.data,
      });
    },
    * delete({ payload }, { call, put }) {
      yield call(deleteUser, payload);
      const response = yield call(queryUserPage);
      yield put({
        type: 'saveList',
        payload: response.data,
      });
    },
    * deleteBatch({ payload }, { call, put }) {
      yield call(deleteUsers, payload);
      const response = yield call(queryUserPage);
      yield put({
        type: 'saveList',
        payload: response.data,
      });
    },
    * clearUser({ payload }, { put }) {
      yield put({
        type: 'saveUser',
        payload: { ...payload },
      });
    },
    * saveUrl({ payload }, { put }) {
      yield put({
        type: 'saveUser',
        payload: { ...payload },
      });
    },
    * saveKeys({ payload }, { put }) {
      yield put({
        type: 'saveTargetKeys',
        payload,
      });
    },
    * saveUserRole({ payload }, { call }) {
      yield call(saveUserRole, payload);
    },
  },

  reducers: {
    save(state, action) {
      return {
        ...state,
        list: action.payload,
      };
    },
    saveCurrentUser(state, action) {
      return {
        ...state,
        currentUser: action.payload.data || {},
      };
    },
    saveUserAmount(state, action) {
      return {
        ...state,
        amount: { userAmount: action.payload.data, }
      };
    },
    changeNotifyCount(state, action) {
      return {
        ...state,
        currentUser: {
          ...state.currentUser,
          notifyCount: action.payload.totalCount,
          unreadCount: action.payload.unreadCount,
        },
      };
    },
    saveList(state, action) {
      return {
        ...state,
        data: { list: Array.isArray(action.payload.records) ? action.payload.records : [], pagination: { current: action.payload.current, pageSize: action.payload.size, total: action.payload.total } }
      };
    },
    saveUser(state, action) {
      return {
        ...state,
        user: action.payload,
      };
    },
    saveTransferList(state, action) {
      return {
        ...state,
        transferList: action.payload,
      };
    },
    saveTargetKeys(state, action) {
      return {
        ...state,
        targetKeys: action.payload,
      };
    },
  },
};
