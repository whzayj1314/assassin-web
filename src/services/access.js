import request from '@/utils/request';
import { stringify } from 'qs';

export async function queryAllAccesssList(params) {
  return request(`/api/access/tree?${stringify(params)}`);
}

export async function queryAccess(accessId) {
  return request(`/api/access/${accessId}`);
}

export async function saveAccess(params) {
  return request('/api/access', {
    method: 'POST',
    body: params,
  });
}

export async function updateAccess(params) {
  return request('/api/access', {
    method: 'PUT',
    body: params
  });
}

export async function deleteAccess(accessId) {
  return request(`/api/access/${accessId}`, {
    method: 'DELETE',
  });
}

export async function deleteAccesss(accessIds) {
  return request(`/api/access/batch/${accessIds}`, {
    method: 'DELETE',
  });
}
