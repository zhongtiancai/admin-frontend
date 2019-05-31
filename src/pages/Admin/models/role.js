import { queryRole,queryRoleAll,addRole } from '@/services/serverApi';
import { getPageData} from '@/utils/utils';

export default {
  namespace: 'role',

  state: {
    data: {
      list: [],
      pagination: {},
    },
    list:[]
  },

  effects: {
    *fetch({ payload }, { call, put }) {
      const response = yield call(queryRole, payload);
      const data = getPageData(response);
      yield put({
        type: 'save',
        payload: data,
      });
    },
    *all({ payload }, { call, put }) {
      const response = yield call(queryRoleAll, payload);
      yield put({
        type: 'saveList',
        payload: response,
      });
    },
    *add({ payload,callback }, { call}) {
      yield call(addRole, payload);
      if(callback){
        callback();
      }
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
