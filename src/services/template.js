import request from '@/utils/request';
import { stringify } from 'qs';

export async function queryTemplatePage(params) {
  return request(`/api/template/page?${stringify(params)}`);
}

export async function queryTemplate(templateId) {
  return request(`/api/template/${templateId}`);
}

export async function queryCheckedList(templateId) {
  return request(`/api/template/checked/${templateId}`);
}

export async function saveTemplate(params) {
  return request('/api/template', {
    method: 'POST',
    body: params,
  });
}

export async function saveTemplateAccess(params) {
  return request('/api/template/templateAccess', {
    method: 'POST',
    body: params,
  });
}

export async function updateTemplate(params) {
  return request('/api/template', {
    method: 'PUT',
    body: params,
  });
}

export async function deleteTemplate(templateId) {
  return request(`/api/template/${templateId}`, {
    method: 'DELETE',
  });
}

export async function deleteTemplates(templateIds) {
  return request(`/api/template/batch/${templateIds}`, {
    method: 'DELETE',
  });
}
