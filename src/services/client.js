import request from '@/utils/request';
import { stringify } from 'qs';

export async function queryClientPage(params) {
  return request(`/api/client/page?${stringify(params)}`);
}

export async function queryClient(clientId) {
  return request(`/api/client/${clientId}`);
}

export async function saveClient(params) {
  return request('/api/client', {
    method: 'POST',
    body: params,
  });
}

export async function updateClient(params) {
  return request('/api/client', {
    method: 'PUT',
    body: params,
  });
}

export async function deleteClient(clientId) {
  return request(`/api/client/${clientId}`, {
    method: 'DELETE',
  });
}

export async function deleteClients(clientIds) {
  return request(`/api/client/batch/${clientIds}`, {
    method: 'DELETE',
  });
}
