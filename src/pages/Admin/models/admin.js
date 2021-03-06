import { query,add} from '@/services/user';
import { getPageData} from '@/utils/utils';

export default {
  namespace: 'admin',

  state: {
    data: {
      list: [],
      pagination: {},
    },
  },

  effects: {
    *fetch({ payload }, { call, put }) {
      const response = yield call(query, payload);
      const data = getPageData(response);
      yield put({
        type: 'save',
        payload: data,
      });
    },
    *add({ payload,callback }, { call}) {
      yield call(add, payload);
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
  },
};
