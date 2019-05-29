import { stringify } from 'qs';
import request from '@/utils/request';

export async function accountLogin(params) {
  return request('/server/api/login', {
    method: 'POST',
    body: params,
  });
}


export async function queryRole(params) {
  return request(`/server/api/role/findPage?${stringify(params)}`);
}

export async function queryRoleAll() {
  return request(`/server/api/role/all`);
}


