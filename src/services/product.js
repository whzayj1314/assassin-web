import request from '@/utils/request';

export async function queryAllProductList() {
  return request('/api/product/list/all');
}

export async function queryInnerProductList() {
  return request('/api/product/in/list');
}

export async function queryMultiProductList() {
  return request('/api/product/multi/list');
}

export async function queryPrpduct(productId) {
  return request(`/api/product/${productId}`);
}

export async function saveProduct(params) {
  return request('/api/product', {
    method: 'POST',
    body: params,
  });
}

export async function updateProduct(params) {
  return request('/api/product', {
    method: 'PUT',
    body: params,
  });
}

export async function deletePrpduct(productId) {
  return request(`/api/product/${productId}`, {
    method: 'DELETE',
  });
}

export async function queryInAmount() {
  return request('/api/product/in/amount');
}

export async function queryTenantAmount() {
  return request('/api/product/tenant/amount');
}

export async function queryMutexRule(productId) {
  return request(`/api/product/mutex/${productId}`);
}

export async function updateMutexRule(params) {
  return request('/api/product/mutex', {
    method: 'PUT',
    body: params,
  });
}