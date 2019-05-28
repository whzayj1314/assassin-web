import request from '@/utils/request';
import { stringify } from 'qs';

export async function queryAllTokenRuleList() {
  return request('/api/tokenRule/list/all');
}

export async function queryTokenRulePage(params) {
  return request(`/api/tokenRule/page?${stringify(params)}`);
}

export async function queryTokenRule(appId) {
  return request(`/api/tokenRule/${appId}`);
}

export async function saveTokenRule(params) {
  return request('/api/tokenRule', {
    method: 'POST',
    body: params,
  });
}

export async function updateTokenRule(params) {
  return request('/api/tokenRule', {
    method: 'PUT',
    body: params,
  });
}

export async function deleteTokenRule(appId) {
  return request(`/api/tokenRule/${appId}`, {
    method: 'DELETE',
  });
}

export async function deleteTokenRules(appIds) {
  return request(`/api/tokenRule/batch/${appIds}`, {
    method: 'DELETE',
  });
}
