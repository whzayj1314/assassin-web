import { queryClientPage, queryClient, saveClient, updateClient, deleteClient, deleteClients } from '@/services/client';

export default {
  namespace: 'client',

  state: {
    client: {},
    data: {
      list: [],
      pagination: {},
    },
  },

  effects: {
    * fetchClientPage({ payload }, { call, put }) {
      const response = yield call(queryClientPage, payload);
      yield put({
        type: 'saveList',
        payload: response.data,
      });
    },
    * fetchClient({ payload }, { call, put }) {
      const response = yield call(queryClient, payload);
      yield put({
        type: 'saveClient',
        payload: response.data ? response.data : {},
      });
    },
    * save({ payload }, { call, put }) {
      yield call(saveClient, payload);
      yield put({
        type: 'saveClient',
        payload: {},
      });
      const response = yield call(queryClientPage);
      yield put({
        type: 'saveList',
        payload: response.data,
      });
    },
    * update({ payload }, { call, put }) {
      yield call(updateClient, payload);
      yield put({
        type: 'saveClient',
        payload: {},
      });
      const response = yield call(queryClientPage);
      yield put({
        type: 'saveList',
        payload: response.data,
      });
    },
    * delete({ payload }, { call, put}) {
      yield call(deleteClient, payload);
      const response = yield call(queryClientPage);
      yield put({
        type: 'saveList',
        payload: response.data,
      });
    },
    * deleteBatch({ payload }, { call, put}) {
      yield call(deleteClients, payload);
      const response = yield call(queryClientPage);
      yield put({
        type: 'saveList',
        payload: response.data,
      });
    },
    * clearClient({ payload }, { put }) {
      yield put({
        type: 'saveClient',
        payload: { ...payload },
      });
    },
  },

  reducers: {
    saveList(state, action) {
      return {
        ...state,
        data: { list: Array.isArray(action.payload.records) ? action.payload.records : [], pagination: { current: action.payload.current, pageSize: action.payload.size,total: action.payload.total} }
      };
    },
    saveClient(state, action) {
      return {
        ...state,
        client: action.payload,
      };
    },
  },
};
