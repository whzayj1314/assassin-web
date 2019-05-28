import request from '@/utils/request';
import { stringify } from 'qs';

export async function queryTenantPage(params) {
  return request(`/api/tenant/page?${stringify(params)}`);
}

export async function queryTenant(tenantId) {
  return request(`/api/tenant/${tenantId}`);
}

export async function saveTenant(params) {
  return request('/api/tenant', {
    method: 'POST',
    body: params,
  });
}

export async function updateTenant(params) {
  return request('/api/tenant', {
    method: 'PUT',
    body: params,
  });
}

export async function deleteTenant(tenantId) {
  return request(`/api/tenant/${tenantId}`, {
    method: 'DELETE',
  });
}

export async function deleteTenants(tenantIds) {
  return request(`/api/tenant/batch/${tenantIds}`, {
    method: 'DELETE',
  });
}

export async function queryTemplateTransferList() {
  return request('/api/tenant/transfer');
}

export async function queryTargetKeys(tenantId) {
  return request(`/api/tenant/target/${tenantId}`);
}

export async function saveTenantTemplate(params) {
  return request('/api/tenant/tenantTemplate', {
    method: 'POST',
    body: params,
  });
}