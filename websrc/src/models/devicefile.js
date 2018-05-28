import { queryDeviceFile, downloadDeviceFile} from '../services/api';

export default {
  namespace: 'devicefile',

  state: {
    data: {
      list: [],
      pagination: {},
    },
  },

  effects: {
    *fetch({ payload }, { call, put }) {
      const response = yield call(queryDeviceFile, payload);
      yield put({
        type: 'save',
        payload: response,
      });
    },

   *download({ payload }, { call, put }) {
       yield call(downloadDeviceFile, payload);
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
