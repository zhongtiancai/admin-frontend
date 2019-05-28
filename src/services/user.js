import request from '@/utils/request';
import { stringify } from 'qs';
export async function query(params) {
  return request(`/server/api/admin/findPage?${stringify(params)}`);
}

export async function queryCurrent() {
  return request('/server/api/currentUser');
}
