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
  Select,
} from 'antd';
import StandardTable from '@/components/StandardTable';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import { formatMessage } from 'umi/locale';
import styles from './Client.less';
import RenderAuthorized from '@/components/Authorized';
import { getAccess } from '@/utils/authority';

const { TextArea } = Input;
const FormItem = Form.Item;
const SelectOption = Select.Option;
@connect(({ client, product, tokenRule, loading }) => ({
  client,
  loading: loading.models.client,
  productList: product.list,
  tokenRuleList: tokenRule.list,
}))
@Form.create()
class Client extends PureComponent {
  state = {
    visible: false,
    isEdit: false,
    selectedRows: [],
  };

  formLayout = {
    labelCol: { span: 7 },
    wrapperCol: { span: 13 },
  };


  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'client/fetchClientPage',
    });
    dispatch({
      type: 'product/fetchAllProductList',
      payload: {},
    });
    dispatch({
      type: 'tokenRule/fetchAllTokenRuleList',
      payload: {},
    });
  }

  handleSubmit = e => {
    e.preventDefault();
    const { dispatch, form, client: { client } } = this.props;
    const id = client.clientId;
    form.validateFields((err, values) => {
      if (!err) {
        const grant = values.authorizedGrantTypes.map(type => type).join(',')
        if (id === undefined) {
          dispatch({
            type: 'client/save',
            payload: { ...values, authorizedGrantTypes: grant },
          }).then(() => {
            this.setState({
              visible: false,
            });
          })
        }
        else {
          dispatch({
            type: 'client/update',
            payload: { ...values, clientId: id, authorizedGrantTypes: grant },
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
          type: 'client/delete',
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
          type: 'client/deleteBatch',
          payload: selectedRows.length === 1 ? selectedRows[0].clientId : selectedRows.map(row => row.clientId).join(','),
        });
        this.setState({
          selectedRows: [],
        });
      },
    });
  };

  handleFormReset = () => {
    const { form, dispatch } = this.props;
    form.resetFields();
    dispatch({
      type: 'client/fetchClientPage',
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
    const values = {
      clientId: form.getFieldValue('clientIdSearch'),
      productId: form.getFieldValue('productIdSearch'),
    };
    dispatch({
      type: 'client/fetchClientPage',
      payload: values,
    });
  };

  showModal = () => {
    this.setState({
      visible: true,
      isEdit: true,
    });
  };

  showEditModal = (clientId) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'client/fetchClient',
      payload: clientId,
    });
    this.setState({
      visible: true,
      isEdit: true,
    });
  };

  showViewModal = (clientId) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'client/fetchClient',
      payload: clientId,
    });
    this.setState({
      visible: true,
      isEdit: false,
    });
  };

  handleCancel = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'client/clearClient',
      payload: {},
    });
    this.setState({
      visible: false,
    });
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
      type: 'client/fetchClientPage',
      payload: params,
    });
  };

  renderSimpleForm() {
    const {
      form: { getFieldDecorator }, productList
    } = this.props;
    const children = [];
    productList.forEach(product => {
      children.push(<SelectOption value={product.productId}>{product.productName}</SelectOption>);
    });
    return (
      <Form onSubmit={this.handleSearch}>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label={formatMessage({ id: 'assassin.client.clientId' })}>
              {getFieldDecorator('clientIdSearch')(<Input placeholder={formatMessage({ id: 'assassin.placeholder.input' })} />)}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label={formatMessage({ id: 'assassin.product.own' })}>
              {getFieldDecorator('productIdSearch')(
                <Select placeholder={formatMessage({ id: 'assassin.placeholder.select' })}>
                  {children}
                </Select>
              )}
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
      client: { data, client },
      loading,
      form: { getFieldDecorator },
      productList,
      tokenRuleList,
    } = this.props;
    const {
      selectedRows,
      visible,
      isEdit,
    } = this.state;
    const modalFooter = isEdit
      ? { onOk: this.handleSubmit, onCancel: this.handleCancel }
      : { okButtonProps: {disabled: true}, onCancel: this.handleCancel };
    const productChildren = [];
    const tokenRuleChildren = [];
    productList.forEach(product => {
      productChildren.push(<SelectOption value={product.productId}>{product.productName}</SelectOption>);
    });
    tokenRuleList.forEach(tokenRule => {
      tokenRuleChildren.push(<SelectOption value={tokenRule.ruleId}>{tokenRule.ruleName}</SelectOption>);
    });
    const getModalContent = () => {
      return (
        <Modal
          title={`${client.clientId ? `${isEdit ? formatMessage({ id: 'assassin.list.edit' }) : formatMessage({ id: 'assassin.list.view' })}` : formatMessage({ id: 'assassin.list.add' })}`}
          className={styles.standardListForm}
          width={640}
          bodyStyle={{ padding: '28px 0 0' }}
          destroyOnClose
          visible={visible}
          {...modalFooter}
        >
          <FormItem label={formatMessage({ id: 'assassin.client.clientId' })} {...this.formLayout}>
            {getFieldDecorator('clientId', {
              rules: [{ required: true, message: formatMessage({ id: 'assassin.client.modal.clientId.valid' }) }],
              initialValue: client.clientId,
            })(<Input placeholder={formatMessage({ id: 'assassin.placeholder.input' })} disabled={!isEdit} />)}
          </FormItem>
          <FormItem label={formatMessage({ id: 'assassin.client.secret' })} {...this.formLayout}>
            {getFieldDecorator('clientSecret', {
              rules: [{ required: true, message: formatMessage({ id: 'assassin.client.modal.secret.valid' }) }],
              initialValue: client.clientSecret,
            })(<Input placeholder={formatMessage({ id: 'assassin.placeholder.input' })} disabled={!isEdit} />)}
          </FormItem>
          {/* <FormItem label="作用域" {...this.formLayout}>
            {getFieldDecorator('scope', {
              rules: [{ required: true, message: '请输入作用域' }],
              initialValue: client.scope,
            })(<Input placeholder="请输入作用域" disabled={!isEdit} />)}
          </FormItem> */}
          <FormItem label={formatMessage({ id: 'assassin.client.authorizedGrantTypes' })} {...this.formLayout}>
            {getFieldDecorator('authorizedGrantTypes', {
              rules: [{ required: true, message: formatMessage({ id: 'assassin.client.modal.authorizedGrantTypes.valid' }) }],
              initialValue: (client.authorizedGrantTypes ? client.authorizedGrantTypes.split(',') : undefined)
            })(
              <Select placeholder={formatMessage({ id: 'assassin.placeholder.select' })} mode="multiple" disabled={!isEdit} className={styles.noFormSelect}>
                <SelectOption value="authorization_code">authorization_code</SelectOption>
                <SelectOption value="implicit">implicit</SelectOption>
                <SelectOption value="password">password</SelectOption>
                <SelectOption value="client_credentials">client_credentials</SelectOption>
                <SelectOption value="refresh_token">refresh_token</SelectOption>
              </Select>
            )}
          </FormItem>
          <FormItem label={formatMessage({ id: 'assassin.product.own' })} {...this.formLayout}>
            {getFieldDecorator('productId', {
              rules: [{ required: true, message: formatMessage({ id: 'assassin.client.modal.own.valid' }) }],
              initialValue: client.productId,
            })(
              <Select placeholder={formatMessage({ id: 'assassin.placeholder.select' })} disabled={!isEdit} className={styles.noFormSelect}>
                {productChildren}
              </Select>
            )}
          </FormItem>
          <FormItem label={formatMessage({ id: 'assassin.tokenRule' })} {...this.formLayout}>
            {getFieldDecorator('tokenRuleId', {
              rules: [{ required: true, message: formatMessage({ id: 'assassin.client.modal.tokenRule.valid' }) }],
              initialValue: client.tokenRuleId,
            })(
              <Select placeholder={formatMessage({ id: 'assassin.placeholder.select' })} disabled={!isEdit} className={styles.noFormSelect}>
                {tokenRuleChildren}
              </Select>
            )}
          </FormItem>
          <FormItem {...this.formLayout} label={formatMessage({ id: 'assassin.client.descrption' })}>
            {getFieldDecorator('remark', {
              initialValue: client.remark,
            })(<TextArea rows={4} placeholder={formatMessage({ id: 'assassin.placeholder.input' })} disabled={!isEdit} />)}
          </FormItem>
        </Modal>
      );
    };

    const Authorized = RenderAuthorized(getAccess());

    const columns = [
      {
        title: formatMessage({ id: 'assassin.client.clientId' }),
        dataIndex: 'clientId',
        render: (text, record) => <Authorized authority='client_view' noMatch={text}><a onClick={() => this.showViewModal(record.clientId)}>{text}</a></Authorized>,
      },
      // {
      //   title: '访问范围',
      //   dataIndex: 'scope',
      // },
      {
        title: formatMessage({ id: 'assassin.client.authorizedGrantTypes' }),
        dataIndex: 'authorizedGrantTypes',
      },
      {
        title: formatMessage({ id: 'assassin.client.descrption' }),
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
            <Authorized authority='client_edit'>
              <a onClick={() => this.showEditModal(record.clientId)}>{formatMessage({ id: 'assassin.list.edit' })}</a>
            </Authorized>
            <Divider type="vertical" />
            <Authorized authority='client_delete'>
              <a onClick={() => this.deleteItem(record.clientId)}>{formatMessage({ id: 'assassin.list.delete' })}</a>
            </Authorized>
          </Fragment>
        ),
      },
    ];
    return (
      <PageHeaderWrapper title={formatMessage({ id: 'assassin.client.list' })}>
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>{this.renderSimpleForm()}</div>
            <div className={styles.tableListOperator}>
              <Authorized authority='client_add'>
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
                  <Authorized authority='client_delete'>
                    <Button
                      onClick={this.deleteItems}
                    >{formatMessage({ id: 'assassin.list.delete' })}
                    </Button>
                  </Authorized>
                </span>
              )}
            </div>
            <StandardTable
              rowKey={record => record.clientId}
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
      </PageHeaderWrapper>
    );
  }
}
export default Client;
