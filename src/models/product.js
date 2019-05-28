import { queryMultiProductList,queryInnerProductList,queryAllProductList, queryPrpduct,saveProduct,updateProduct,deletePrpduct, queryInAmount, queryTenantAmount,queryMutexRule, updateMutexRule } from '@/services/product';

export default {
  namespace: 'product',

  state: {
    product: {},
    list: [],
    productAmount:{},
    inList: [],
    multiList: [],
    mutexRuleList: [],
    currentProductId: undefined
  },

  effects: {
    * fetchAllProductList(_, { call, put }) {
      const response = yield call(queryAllProductList);
      yield put({
        type: 'saveProductList',
        payload: Array.isArray(response.data) ? response.data : [],
      });
    },
    * fetchInnerProductList(_, { call, put }) {
      const response = yield call(queryInnerProductList);
      yield put({
        type: 'saveInList',
        payload: Array.isArray(response.data) ? response.data : [],
      });
    },
    * fetchMultiProductList(_, { call, put }) {
      const response = yield call(queryMultiProductList);
      yield put({
        type: 'saveMultiList',
        payload: Array.isArray(response.data) ? response.data : [],
      });
    },
    * fetchMutexRuleList({ payload }, { call, put }) {
      const response = yield call(queryMutexRule, payload);
      yield put({
        type: 'saveMutexRuleList',
        payload: Array.isArray(response.data) ? response.data : [],
      });
      yield put({
        type: 'saveCurrentProductId',
        payload,
      });
    },
    * clearMutexRuleList(_, { put }) {
       yield put({
        type: 'saveMutexRuleList',
        payload:[],
      });
      yield put({
        type: 'saveCurrentProductId',
        payload: undefined,
      });
    },
    * fetchProduct({ payload }, { call, put }) {
      const response = yield call(queryPrpduct, payload);
      yield put({
        type: 'saveProduct',
        payload: response.data ? response.data : {},
      });
    },
    * fetchInAmount(_, { call, put }) {
      const response = yield call(queryInAmount);
      yield put({
        type: 'saveInAmount',
        payload: response,
      });
    },
    * fetchTenantAmount(_, { call, put }) {
      const response = yield call(queryTenantAmount);
      yield put({
        type: 'saveTenantAmount',
        payload: response,
      });
    },
    * clearProduct({ payload }, { put }) {
      yield put({
        type: 'saveProduct',
        payload: { ...payload },
      });
    },
    * saveUrl({ payload }, { put }) {
      yield put({
        type: 'saveProduct',
        payload: {...payload},
      });
    },
    * save({ payload }, { call,put }) {
      yield call(saveProduct, payload);
      yield put({
        type: 'saveProduct',
        payload: {},
      });
      const response = yield call(queryAllProductList);
      yield put({
        type: 'saveProductList',
        payload: Array.isArray(response.data) ? response.data : [],
      });
    },
    * update({ payload }, { call, put }) {
      yield call(updateProduct, payload);
      yield put({
        type: 'saveProduct',
        payload: {},
      });
      const response = yield call(queryAllProductList);
      yield put({
        type: 'saveProductList',
        payload: Array.isArray(response.data) ? response.data : [],
      });
    },
    * delete({ payload }, { call, put }) {
      yield call(deletePrpduct, payload);
      const response = yield call(queryAllProductList);
      yield put({
        type: 'saveProductList',
        payload: Array.isArray(response.data) ? response.data : [],
      });
    },
    * updateMutexRule({ payload }, { call, put }) {
      yield call(updateMutexRule, payload);
      yield put({
        type: 'saveCurrentProductId',
        payload: undefined,
      });
    },
  },

  reducers: {
    saveProductList(state, action) {
      return {
        ...state,
        list: action.payload,
      };
    },
    saveProduct(state, action ) {
      return {
        ...state,
        product: action.payload,
      };
    },
    saveInAmount(state, action ) {
      return {
        ...state,
        productAmount: {...state.productAmount,inAmount:action.payload.data}
      };
    },
    saveInList(state, action ) {
      return {
        ...state,
        inList: action.payload,
      };
    },
    saveMultiList(state, action ) {
      return {
        ...state,
        multiList: action.payload,
      };
    },
    saveMutexRuleList(state, action ) {
      return {
        ...state,
        mutexRuleList: action.payload,
      };
    },
    saveTenantAmount(state, action ) {
      return {
        ...state,
        productAmount: {...state.productAmount,tenantAmount:action.payload.data}
      };
    },
    saveCurrentProductId(state, action){
      return {
        ...state,
        currentProductId: action.payload,
      };
    }
  },
};
