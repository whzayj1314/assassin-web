import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import {
  Row,
  Col,
  Card,
  Form,
  Input,
  Button,
  Modal,
  Divider,
  Transfer,
} from 'antd';
import StandardTable from '@/components/StandardTable';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import { formatMessage } from 'umi/locale';
import styles from './Tenant.less';
import RenderAuthorized from '@/components/Authorized';
import { getAccess } from '@/utils/authority';


const FormItem = Form.Item;
const { TextArea } = Input;
/* eslint react/no-multi-comp:0 */
@connect(({ tenant, loading }) => ({
  tenant,
  loading: loading.models.tenant,
}))
@Form.create()
class Tenant extends PureComponent {
  state = {
    visible: false,
    isEdit: false,
    selectedRows: [],
    templateVisible: false,
    currentTenantId: undefined,
    selectedKeys: [],
  };

  formLayout = {
    labelCol: { span: 7 },
    wrapperCol: { span: 13 },
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'tenant/fetchTenantPage',
    });
  }

  handleSubmit = e => {
    e.preventDefault();
    const { dispatch, form, tenant: { tenant } } = this.props;
    const id = tenant.tenantId;

    form.validateFields((err, values) => {
      if (!err) {
        if (id === undefined) {
          dispatch({
            type: 'tenant/save',
            payload: values,
          }).then(() => {
            this.setState({
              visible: false,
            });
          })
        }
        else {
          dispatch({
            type: 'tenant/update',
            payload: { tenantId: id, ...values },
          }).then(() => {
            this.setState({
              visible: false,
            });
          })
        }
      }
    });
  };

  deleteItem = id => {
    Modal.confirm({
      title: formatMessage({ id: 'assassin.modal.confirm.title' }),
      content: formatMessage({ id: 'assassin.modal.confirm.content' }),
      onOk: () => {
        const { dispatch } = this.props;
        dispatch({
          type: 'tenant/delete',
          payload: id,
        });
      },
    });
  };

  deleteItems = () => {
    const { selectedRows } = this.state;
    if (selectedRows.length === 0) return;
    Modal.confirm({
      title: formatMessage({ id: 'assassin.modal.confirm.title' }),
      content: formatMessage({ id: 'assassin.modal.confirm.content' }),
      onOk: () => {
        const { dispatch } = this.props;
        dispatch({
          type: 'tenant/deleteBatch',
          payload: selectedRows.length === 1 ? selectedRows[0].tenantId : selectedRows.map(row => row.tenantId).join(','),
        });
        this.setState({
          selectedRows: [],
        });
      },
    });
  };

  handleStandardTableChange = (pagination) => {
    const { dispatch } = this.props;
    const params = {
      current: pagination.current,
      size: pagination.pageSize,
    };
    dispatch({
      type: 'tenant/fetchTenantPage',
      payload: params,
    });
  };

  handleFormReset = () => {
    const { form, dispatch } = this.props;
    form.resetFields();
    dispatch({
      type: 'tenant/fetchTenantPage',
      payload: {},
    });
  };

  handleSelectRows = rows => {
    this.setState({
      selectedRows: rows,
    });
  };

  handleSearch = e => {
    e.preventDefault();
    const { dispatch, form } = this.props;
    const serachValues = {
      tenantName: form.getFieldValue('tenantNameSearch'),
    };
    dispatch({
      type: 'tenant/fetchTenantPage',
      payload: serachValues,
    });
  };

  showModal = () => {
    this.setState({
      visible: true,
      isEdit: true,
    });
  };

  showEditModal = (tenantId) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'tenant/fetchTenant',
      payload: tenantId,
    });
    this.setState({
      visible: true,
      isEdit: true,
    });
  };

  showTransferModal = (tenantId) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'tenant/fetchTransfer',
      payload: tenantId,
    });
    this.setState({
      currentTenantId: tenantId,
      templateVisible: true,
    });
  };


  showViewModal = (tenantId) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'tenant/fetchTenant',
      payload: tenantId,
    });
    this.setState({
      visible: true,
      isEdit: false,
    });
  };

  handleCancel = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'tenant/clearTenant',
      payload: {},
    });
    this.setState({
      visible: false,
    });
  };

  handleTemplateCancel = () => {
    this.setState({
      selectedKeys: [],
      templateVisible: false,
    });
  };

  handleTemplateChange = (targetKeys) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'tenant/saveKeys',
      payload: targetKeys,
    });
  }

  handleSelectChange = (sourceSelectedKeys, targetSelectedKeys) => {
    this.setState({ selectedKeys: [...sourceSelectedKeys, ...targetSelectedKeys] });
  }

  handleTemplateSubmit = () => {
    const { dispatch,
      tenant: { targetKeys },
    } = this.props;
    const { currentTenantId } = this.state;
    dispatch({
      type: 'tenant/saveTenantTemplate',
      payload: { tenantId: currentTenantId, templateIds: targetKeys }
    }).then(() => {
      this.setState({
        selectedKeys: [],
        templateVisible: false,
      });
    })
  };

  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    const { dispatch } = this.props;
    const params = {
      current: pagination.current,
      size: pagination.pageSize,
    };
    if (sorter.field) {
      if (sorter.order === 'ascend') {
        if (sorter.field === 'createTime') {
          params.ascs = 'create_time';
        }
        else if (sorter.field === 'updateTime') {
          params.ascs = 'update_time';
        }
      }
      else if (sorter.order === 'descend') {
        if (sorter.field === 'createTime') {
          params.descs = 'create_time';
        }
        else if (sorter.field === 'updateTime') {
          params.descs = 'update_time';
        }
      }
    }
    dispatch({
      type: 'tenant/fetchTenantPage',
      payload: params,
    });
  };

  renderSimpleForm() {
    const {
      form: { getFieldDecorator },
    } = this.props;
    return (
      <Form onSubmit={this.handleSearch}>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={4} sm={24}>
            <FormItem label={formatMessage({ id: 'assassin.tenant.name' })}>
              {getFieldDecorator('tenantNameSearch')(<Input placeholder={formatMessage({ id: 'assassin.placeholder.input' })} />)}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <span className={styles.submitButtons}>
              <Button type="primary" htmlType="submit">
                {formatMessage({ id: 'assassin.search.search' })}
              </Button>
              <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
                {formatMessage({ id: 'assassin.search.reset' })}
              </Button>
            </span>
          </Col>
        </Row>
      </Form>
    );
  };

  render() {
    const {
      tenant: { data, tenant, transferList, targetKeys },
      loading,
      form: { getFieldDecorator },
    } = this.props;
    const {
      selectedRows,
      visible,
      isEdit,
      templateVisible,
      selectedKeys,
    } = this.state;
    const modalFooter = isEdit
      ? { onOk: this.handleSubmit, onCancel: this.handleCancel }
      : { okButtonProps: { disabled: true }, onCancel: this.handleCancel };
    const Authorized = RenderAuthorized(getAccess());
    const columns = [
      {
        title: formatMessage({ id: 'assassin.tenant.name' }),
        dataIndex: 'tenantName',
        render: (text, record) => <Authorized authority='tenant_view' noMatch={text}><a onClick={() => this.showViewModal(record.tenantId)}>{text}</a></Authorized>,
      },
      {
        title: formatMessage({ id: 'assassin.list.remark' }),
        dataIndex: 'remark',
      },
      {
        title: formatMessage({ id: 'assassin.list.createTime' }),
        dataIndex: 'createTime',
        sorter: true,
      },
      {
        title: formatMessage({ id: 'assassin.list.updateTime' }),
        dataIndex: 'updateTime',
        sorter: true,
      },
      {
        title: formatMessage({ id: 'assassin.list.option' }),
        render: (text, record) => (
          <Fragment>
            <Authorized authority='tenant_edit'>
              <a onClick={() => this.showEditModal(record.tenantId)}>{formatMessage({ id: 'assassin.list.edit' })}</a>
            </Authorized>
            <Divider type="vertical" />
            <Authorized authority='tenant_template'>
              <a onClick={() => this.showTransferModal(record.tenantId)}>{formatMessage({ id: 'assassin.tenant.template' })}</a>
            </Authorized>
            <Divider type="vertical" />
            <Authorized authority='tenant_delete'>
              <a onClick={() => this.deleteItem(record.tenantId)}>{formatMessage({ id: 'assassin.list.delete' })}</a>
            </Authorized>
          </Fragment>
        ),
      },
    ];
    const getModalContent = () => {
      return (
        <Modal
          title={`${tenant.tenantName ? `${isEdit ? formatMessage({ id: 'assassin.list.edit' }) : formatMessage({ id: 'assassin.list.view' })}` : formatMessage({ id: 'assassin.list.add' })}`}
          className={styles.standardListForm}
          width={640}
          bodyStyle={{ padding: '28px 0 0' }}
          destroyOnClose
          visible={visible}
          {...modalFooter}
        >
          <FormItem label={formatMessage({ id: 'assassin.tenant.name' })} {...this.formLayout}>
            {getFieldDecorator('tenantName', {
              rules: [{ required: true, message: formatMessage({ id: 'assassin.tenant.modal.name.valid' }) }],
              initialValue: tenant.tenantName,
            })(<Input placeholder={formatMessage({ id: 'assassin.placeholder.input' })} disabled={!isEdit} />)}
          </FormItem>
          <FormItem {...this.formLayout} label={formatMessage({ id: 'assassin.list.remark' })}>
            {getFieldDecorator('remark', {
              initialValue: tenant.remark,
            })(<TextArea rows={4} placeholder={formatMessage({ id: 'assassin.placeholder.input' })} disabled={!isEdit} />)}
          </FormItem>
        </Modal>
      );
    };
    const getTemplateModalContent = () => {
      return (
        <Modal
          title={formatMessage({ id: 'assassin.tenant.template' })}
          width={660}
          visible={templateVisible}
          onOk={this.handleTemplateSubmit}
          onCancel={this.handleTemplateCancel}
        >
          <Transfer
            dataSource={transferList}
            showSearch
            listStyle={{
              width: 250,
              height: 300,
            }}
            operations={[formatMessage({ id: 'assassin.tenant.template.add' }), formatMessage({ id: 'assassin.tenant.template.delete' })]}
            targetKeys={targetKeys}
            selectedKeys={selectedKeys}
            onSelectChange={this.handleSelectChange}
            onChange={this.handleTemplateChange}
            render={item => `${item.title}-${item.description}`}
          />
        </Modal>
      );
    };
    return (
      <PageHeaderWrapper title={formatMessage({ id: 'assassin.tenant.list' })}>
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>{this.renderSimpleForm()}</div>
            <div className={styles.tableListOperator}>
              <Authorized authority='tenant_add'>
                <Button
                  icon="plus"
                  type="primary"
                  onClick={e => {
                    e.preventDefault();
                    this.showModal();
                  }}
                >
                  {formatMessage({ id: 'assassin.list.add' })}
                </Button>
              </Authorized>
              {selectedRows.length > 0 && (
                <span>
                  <Authorized authority='tenant_delete'>
                    <Button
                      onClick={this.deleteItems}
                    >{formatMessage({ id: 'assassin.list.delete' })}
                    </Button>
                  </Authorized>
                </span>
              )}
            </div>
            <StandardTable
              rowKey={record => record.tenantId}
              selectedRows={selectedRows}
              loading={loading}
              data={data}
              columns={columns}
              onSelectRow={this.handleSelectRows}
              onChange={this.handleStandardTableChange}
            />
          </div>
        </Card>
        {getModalContent()}
        {getTemplateModalContent()}
      </PageHeaderWrapper>
    );
  }
}
export default Tenant;
