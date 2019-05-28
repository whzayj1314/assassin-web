import { queryCheckedList,queryTemplatePage, queryTemplate, saveTemplate, updateTemplate, deleteTemplate, deleteTemplates ,saveTemplateAccess} from '@/services/template';

export default {
  namespace: 'template',

  state: {
    template: {},
    checkedList: [],
    data: {
      list: [],
      pagination: {},
    },
  },

  effects: {
    * fetchTemplatePage({ payload }, { call, put }) {
      const response = yield call(queryTemplatePage, payload);
      yield put({
        type: 'saveList',
        payload: response.data,
      });
    },
    * fetchTemplate({ payload }, { call, put }) {
      const response = yield call(queryTemplate, payload);
      yield put({
        type: 'saveTemplate',
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
      yield call(saveTemplate, payload);
      yield put({
        type: 'saveTemplate',
        payload: {},
      });
      const response = yield call(queryTemplatePage);
      yield put({
        type: 'saveList',
        payload: response.data,
      });
    },
    * saveTemplateAccess({ payload }, { call }) {
      yield call(saveTemplateAccess, payload);
    },
    * update({ payload }, { call, put }) {
      yield call(updateTemplate, payload);
      yield put({
        type: 'saveTemplate',
        payload: {},
      });
      const response = yield call(queryTemplatePage);
      yield put({
        type: 'saveList',
        payload: response.data,
      });
    },
    * delete({ payload }, { call, put}) {
      yield call(deleteTemplate, payload);
      const response = yield call(queryTemplatePage);
      yield put({
        type: 'saveList',
        payload: response.data,
      });
    },
    * deleteBatch({ payload }, { call, put}) {
      yield call(deleteTemplates, payload);
      const response = yield call(queryTemplatePage);
      yield put({
        type: 'saveList',
        payload: response.data,
      });
    },
    * clearTemplate({ payload }, { put }) {
      yield put({
        type: 'saveTemplate',
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
    saveTemplate(state, action) {
      return {
        ...state,
        template: action.payload,
      };
    },
  },
};
