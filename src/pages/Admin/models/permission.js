import { queryPermission,queryPermissionAll } from '@/services/serverApi';
import { getPageData} from '@/utils/utils';

export default {
  namespace: 'permission',
  state: {
    data: {
      list: [],
      pagination: {},
    },
    list:[]
  },

  effects: {
    *fetch({ payload }, { call, put }) {
      const response = yield call(queryPermission, payload);
      const data = getPageData(response);
      yield put({
        type: 'save',
        payload: data,
      });
    },
    *all({ payload }, { call, put }) {
      const response = yield call(queryPermissionAll, payload);
      yield put({
        type: 'saveList',
        payload: response,
      });
    },
  },

  reducers: {
    save(state, action) {
      return {
        ...state,
        data: action.payload,
      };
    },
    saveList(state, action) {
      return {
        ...state,
        list: action.payload,
      };
    },
  },
};
