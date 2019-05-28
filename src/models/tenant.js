import { queryTenantPage, queryTenant, saveTenant, updateTenant, deleteTenant, deleteTenants,queryTemplateTransferList,queryTargetKeys,saveTenantTemplate} from '@/services/tenant';

export default {
  namespace: 'tenant',

  state: {
    transferList: [],
    targetKeys: [],
    tenant: {},
    data: {
      list: [],
      pagination: {},
    },
  },

  effects: {
    * fetchTenantPage({ payload }, { call, put }) {
      const response = yield call(queryTenantPage, payload);
      yield put({
        type: 'saveList',
        payload: response.data,
      });
    },
    * fetchTransfer({ payload }, { call, put }) {
      const response = yield call(queryTemplateTransferList);
      yield put({
        type: 'saveTransferList',
        payload: Array.isArray(response.data) ? response.data : [],
      });
      const response1 = yield call(queryTargetKeys,payload);
      yield put({
        type: 'saveTargetKeys',
        payload: Array.isArray(response1.data) ? response1.data : [],
      });
    },
    * fetchTenant({ payload }, { call, put }) {
      const response = yield call(queryTenant, payload);
      yield put({
        type: 'saveTenant',
        payload: response.data ? response.data : {},
      });
    },
    * save({ payload }, { call, put }) {
      yield call(saveTenant, payload);
      yield put({
        type: 'saveTenant',
        payload: {},
      });
      const response = yield call(queryTenantPage);
      yield put({
        type: 'saveList',
        payload: response.data,
      });
    },
    * update({ payload }, { call, put }) {
      yield call(updateTenant, payload);
      yield put({
        type: 'saveTenant',
        payload: {},
      });
      const response = yield call(queryTenantPage);
      yield put({
        type: 'saveList',
        payload: response.data,
      });
    },
    * delete({ payload }, { call, put}) {
      yield call(deleteTenant, payload);
      const response = yield call(queryTenantPage);
      yield put({
        type: 'saveList',
        payload: response.data,
      });
    },
    * deleteBatch({ payload }, { call, put}) {
      yield call(deleteTenants, payload);
      const response = yield call(queryTenantPage);
      yield put({
        type: 'saveList',
        payload: response.data,
      });
    },
    * clearTenant({ payload }, { put }) {
      yield put({
        type: 'saveTenant',
        payload: { ...payload },
      });
    },
    * saveKeys({ payload }, { put }) {
      yield put({
        type: 'saveTargetKeys',
        payload,
      });
    },
    * saveTenantTemplate({ payload }, { call }) {
      yield call(saveTenantTemplate, payload);
    },
  },

  reducers: {
    save(state, action) {
      return {
        ...state,
        list: action.payload,
      };
    },
    saveList(state, action) {
      return {
        ...state,
        data: { list: Array.isArray(action.payload.records) ? action.payload.records : [], pagination: { current: action.payload.current, pageSize: action.payload.size ,total: action.payload.total} }
      };
    },
    saveTenant(state, action) {
      return {
        ...state,
        tenant: action.payload,
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
