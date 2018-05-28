import request from '../utils/request';
import { stringify } from 'qs';

export async function queryAsset(params) {
  return request(`/api/assets?${stringify(params)}`);
}


export async function addAsset(params) {
  return request(`/api/assets`, {
    method: 'POST',
    body: {
      ...params,
      method: 'post',
    },
  });
}

export async function updateUsers(id,params){
  return request(`/api/users/${id}`,{
    method:'PUT',
    body: {
      ...params,
      method: 'put',
    },
  });
}

export async function removeAsset(params) {
  return request(`/api/assets/${id}`, {
    method: 'POST',
    body: {
      ...params,
      method: 'delete',
    },
  });
}
