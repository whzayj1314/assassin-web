import request from '@/utils/request';
import { stringify } from 'qs';

export async function queryRolePage(params) {
  return request(`/api/role/page?${stringify(params)}`);
}

export async function queryRole(roleId) {
  return request(`/api/role/${roleId}`);
}

export async function queryCheckedList(roleId) {
  return request(`/api/role/checked/${roleId}`);
}

export async function saveRole(params) {
  return request('/api/role', {
    method: 'POST',
    body: params,
  });
}

export async function saveRoleAccess(params) {
  return request('/api/role/roleAccess', {
    method: 'POST',
    body: params,
  });
}

export async function updateRole(params) {
  return request('/api/role', {
    method: 'PUT',
    body: params,
  });
}

export async function deleteRole(roleId) {
  return request(`/api/role/${roleId}`, {
    method: 'DELETE',
  });
}

export async function deleteRoles(roleIds) {
  return request(`/api/role/batch/${roleIds}`, {
    method: 'DELETE',
  });
}
