import request from '@/utils/request';
import { stringify } from 'qs';

export async function queryAllAppsList() {
  return request('/api/app/list/all');
}

export async function queryAppPage(params) {
  return request(`/api/app/page?${stringify(params)}`);
}

export async function queryApp(appId) {
  return request(`/api/app/${appId}`);
}

export async function saveApp(params) {
  return request('/api/app', {
    method: 'POST',
    body: params,
  });
}

export async function updateApp(params) {
  return request('/api/app', {
    method: 'PUT',
    body: params,
  });
}

export async function deleteApp(appId) {
  return request(`/api/app/${appId}`, {
    method: 'DELETE',
  });
}

export async function deleteApps(appIds) {
  return request(`/api/app/batch/${appIds}`, {
    method: 'DELETE',
  });
}
