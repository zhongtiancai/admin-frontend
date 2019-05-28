import { stringify } from 'qs';
import request from '@/utils/request';

export async function accountLogin(params) {
  return request('/server/api/login', {
    method: 'POST',
    body: params,
  });
}
