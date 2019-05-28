import request from '@/utils/request';
import { stringify } from 'qs';

export async function query() {
  return request('/api/users');
}

export async function queryCurrent() {
  return request('/api/user/currentUser');
}

export async function queryUserAmount() {
  return request('/api/user/amount');
}

export async function queryUserPage(params) {
  return request(`/api/user/page?${stringify(params)}`);
}

export async function queryUser(userId) {
  return request(`/api/user/${userId}`);
}

export async function saveUser(params) {
  return request('/api/user', {
    method: 'POST',
    body: params,
  });
}

export async function updateUser(params) {
  return request('/api/user', {
    method: 'PUT',
    body: params,
  });
}

export async function deleteUser(userId) {
  return request(`/api/user/${userId}`, {
    method: 'DELETE',
  });
}

export async function deleteUsers(userIds) {
  return request(`/api/user/batch/${userIds}`, {
    method: 'DELETE',
  });
}

export async function queryRoleTransferList() {
  return request('/api/user/transfer');
}

export async function queryTargetKeys(userId) {
  return request(`/api/user/target/${userId}`);
}

export async function saveUserRole(params) {
  return request('/api/user/userRole', {
    method: 'POST',
    body: params,
  });
}

export async function queryMenu(){
  return request('/api/user/menu');
}

export async function queryAccess(){
  return request('/api/user/access');
}