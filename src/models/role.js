import { queryCheckedList,queryRolePage, queryRole, saveRole, updateRole, deleteRole, deleteRoles ,saveRoleAccess} from '@/services/role';

export default {
  namespace: 'role',

  state: {
    role: {},
    checkedList: [],
    data: {
      list: [],
      pagination: {},
    },
  },

  effects: {
    * fetchRolePage({ payload }, { call, put }) {
      const response = yield call(queryRolePage, payload);
      yield put({
        type: 'saveList',
        payload: response.data,
      });
    },
    * fetchRole({ payload }, { call, put }) {
      const response = yield call(queryRole, payload);
      yield put({
        type: 'saveRole',
        payload: response.data ? response.data : {},
      });
    },
    * fetchCheckedKeys({ payload }, { call, put }) {
      const response = yield call(queryCheckedList, payload);
      yield put({
        type: 'saveCheckedList',
        payload: response.data ? response.data : [],
      });
    },
    * save({ payload }, { call, put }) {
      yield call(saveRole, payload);
      yield put({
        type: 'saveRole',
        payload: {},
      });
      const response = yield call(queryRolePage);
      yield put({
        type: 'saveList',
        payload: response.data,
      });
    },
    * saveRoleAccess({ payload }, { call }) {
      yield call(saveRoleAccess, payload);
    },
    * update({ payload }, { call, put }) {
      yield call(updateRole, payload);
      yield put({
        type: 'saveRole',
        payload: {},
      });
      const response = yield call(queryRolePage);
      yield put({
        type: 'saveList',
        payload: response.data,
      });
    },
    * delete({ payload }, { call, put}) {
      yield call(deleteRole, payload);
      const response = yield call(queryRolePage);
      yield put({
        type: 'saveList',
        payload: response.data,
      });
    },
    * deleteBatch({ payload }, { call, put}) {
      yield call(deleteRoles, payload);
      const response = yield call(queryRolePage);
      yield put({
        type: 'saveList',
        payload: response.data,
      });
    },
    * clearRole({ payload }, { put }) {
      yield put({
        type: 'saveRole',
        payload: { ...payload },
      });
    },
    * clearCheckedList(_, { put }) {
      yield put({
        type: 'saveCheckedList',
        payload: [],
      });
    },
    * setCheckedList({ payload }, { put }) {
      yield put({
        type: 'saveCheckedList',
        payload: payload.checkedKeys,
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
    saveCheckedList(state, action) {
      return {
        ...state,
        checkedList: action.payload,
      };
    },
    saveRole(state, action) {
      return {
        ...state,
        role: action.payload,
      };
    },
  },
};
