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
  Table,
  Select,
  TreeSelect
} from 'antd';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import { formatMessage } from 'umi/locale';
import styles from './Access.less';
import RenderAuthorized from '@/components/Authorized';
import { getAccess } from '@/utils/authority';

const FormItem = Form.Item;
const SelectOption = Select.Option;
const accessType = ['', formatMessage({ id: 'assassin.access.menu' }), formatMessage({ id: 'assassin.access.button' }), formatMessage({ id: 'assassin.access.api' })];
/* eslint react/no-multi-comp:0 */
@connect(({ access, product, loading }) => ({
  access,
  productList: product.list,
  loading: loading.models.access,
}))
@Form.create()
class Access extends PureComponent {
  state = {
    visible: false,
    isEdit: false,
  };

  formLayout = {
    labelCol: { span: 7 },
    wrapperCol: { span: 13 },
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'access/fetchAllAccesssList',
    });
    dispatch({
      type: 'product/fetchAllProductList',
      payload: {},
    });
  }

  handleSubmit = e => {
    e.preventDefault();
    const { dispatch, form, access: { access } } = this.props;
    const id = access.accessId;

    form.validateFields((err, values) => {
      if (!err) {
        if (id === undefined) {
          dispatch({
            type: 'access/save',
            payload: values,
          }).then(() => {
            this.setState({
              visible: false,
            });
          })
        }
        else {
          dispatch({
            type: 'access/update',
            payload: { accessId: id, ...values },
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
          type: 'access/delete',
          payload: id,
        });
      },
    });
  };

  handleFormReset = () => {
    const { form, dispatch } = this.props;
    form.resetFields();
    dispatch({
      type: 'access/fetchAllAccesssList',
      payload: {},
    });
  };

  handleSearch = e => {
    e.preventDefault();
    const { dispatch, form } = this.props;
    const values = {
      accessName: form.getFieldValue('accessNameSearch'),
      productId: form.getFieldValue('productIdSearch'),
    };
    dispatch({
      type: 'access/fetchAllAccesssList',
      payload: values,
    });
  };

  showModal = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'access/clearTreeSelect',
      payload: {},
    });
    this.setState({
      visible: true,
      isEdit: true,
    });
  };

  showEditModal = (accessId) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'access/fetchAccess',
      payload: accessId,
    });
    this.setState({
      visible: true,
      isEdit: true,
    });
  };


  showViewModal = (accessId) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'access/fetchAccess',
      payload: accessId,
    });
    this.setState({
      visible: true,
      isEdit: false,
    });
  };

  handleCancel = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'access/clearAccess',
    });
    dispatch({
      type: 'access/clearTreeSelect',
    });
    this.setState({
      visible: false,
    });
  };

  onChange = (value) => {
    const { dispatch, form } = this.props;
    const values = {
      productId: value,
      accessType: 1
    };
    form.resetFields(['parentId']);
    dispatch({
      type: 'access/fetchTreeSelect',
      payload: values,
    });

  }

  renderSimpleForm() {
    const {
      form: { getFieldDecorator },
      productList
    } = this.props;
    const children = [];
    productList.forEach(product => {
      children.push(<SelectOption value={product.productId}>{product.productName}</SelectOption>);
    });
    return (
      <Form onSubmit={this.handleSearch}>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label={formatMessage({ id: 'assassin.access.name' })}>
              {getFieldDecorator('accessNameSearch')(<Input placeholder={formatMessage({ id: 'assassin.placeholder.input' })} />)}
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
      access: { list, access, selectList },
      loading,
      form: { getFieldDecorator },
      productList
    } = this.props;
    const {
      visible,
      isEdit,
    } = this.state;
    const modalFooter = isEdit
      ? { onOk: this.handleSubmit, onCancel: this.handleCancel }
      : { okButtonProps: { disabled: true }, onCancel: this.handleCancel };
    const children = [];
    productList.forEach(product => {
      children.push(<SelectOption value={product.productId}>{product.productName}</SelectOption>);
    });
    const Authorized = RenderAuthorized(getAccess());
    const columns = [
      {
        title: formatMessage({ id: 'assassin.access.name' }),
        dataIndex: 'title',
        render: (text, record) => <Authorized authority='access_view' noMatch={text}><a onClick={() => this.showViewModal(record.accessId)}>{text}</a></Authorized>,
      },
      {
        title: formatMessage({ id: 'assassin.access.alias' }),
        dataIndex: 'accessAlias',
      },
      {
        title: formatMessage({ id: 'assassin.access.uri' }),
        dataIndex: 'uri',
      },
      {
        title: formatMessage({ id: 'assassin.access.type' }),
        dataIndex: 'accessType',
        render: val => accessType[val]
      },
      {
        title: formatMessage({ id: 'assassin.product.own' }),
        dataIndex: 'productName',
      },
      {
        title: formatMessage({ id: 'assassin.list.option' }),
        render: (text, record) => (
          <Fragment>
            <Authorized authority='access_edit'>
              <a onClick={() => this.showEditModal(record.accessId)}>{formatMessage({ id: 'assassin.list.edit' })}</a>
            </Authorized>
            <Divider type="vertical" />
            <Authorized authority='access_delete'>
              <a onClick={() => this.deleteItem(record.accessId)}>{formatMessage({ id: 'assassin.list.delete' })}</a>
            </Authorized>
          </Fragment>
        ),
      },
    ];

    const getModalContent = () => {
      return (
        <Modal
          title={`${access.accessName ? `${isEdit ? formatMessage({ id: 'assassin.list.edit' }) : formatMessage({ id: 'assassin.list.view' })}` : formatMessage({ id: 'assassin.list.add' })}`}
          className={styles.standardListForm}
          width={640}
          bodyStyle={{ padding: '28px 0 0' }}
          destroyOnClose
          visible={visible}
          {...modalFooter}
        >
          <FormItem label={formatMessage({ id: 'assassin.product.own' })} {...this.formLayout}>
            {getFieldDecorator('productId', {
              rules: [{ required: true, message: formatMessage({ id: 'assassin.product.modal.own.valid' }) }],
              initialValue: access.productId,
            })(
              <Select placeholder={formatMessage({ id: 'assassin.placeholder.input' })} disabled={!isEdit} className={styles.noFormSelect} onChange={this.onChange}>
                {children}
              </Select>
            )}
          </FormItem>
          <FormItem label={formatMessage({ id: 'assassin.access.parent' })} {...this.formLayout}>
            {getFieldDecorator('parentId', {
              initialValue: access.parentId,
            })(
              <TreeSelect
                placeholder={formatMessage({ id: 'assassin.placeholder.select' })}
                disabled={!isEdit}
                className={styles.noFormSelect}
                treeData={selectList}
                allowClear
                showSearch
                treeNodeFilterProp="title"
              />
            )}
          </FormItem>
          <FormItem label={formatMessage({ id: 'assassin.access.name' })} {...this.formLayout}>
            {getFieldDecorator('accessName', {
              rules: [{ required: true, message: formatMessage({ id: 'assassin.access.modal.name.valid' }) }],
              initialValue: access.accessName,
            })(<Input placeholder={formatMessage({ id: 'assassin.placeholder.input' })} disabled={!isEdit} />)}
          </FormItem>
          <FormItem label={formatMessage({ id: 'assassin.access.alias' })} {...this.formLayout}>
            {getFieldDecorator('accessAlias', {
              rules: [{ required: true, message: formatMessage({ id: 'assassin.access.modal.alias.valid' }) }],
              initialValue: access.accessAlias,
            })(<Input placeholder={formatMessage({ id: 'assassin.placeholder.input' })} disabled={!isEdit} />)}
          </FormItem>
          <FormItem label={formatMessage({ id: 'assassin.access.type' })} {...this.formLayout}>
            {getFieldDecorator('accessType', {
              rules: [{ required: true, message: formatMessage({ id: 'assassin.access.modal.type.valid' }) }],
              initialValue: access.accessType,
            })(
              <Select placeholder={formatMessage({ id: 'assassin.placeholder.select' })} disabled={!isEdit} className={styles.noFormSelect}>
                <SelectOption value="1">{formatMessage({ id: 'assassin.access.menu' })}</SelectOption>
                <SelectOption value="2">{formatMessage({ id: 'assassin.access.button' })}</SelectOption>
                <SelectOption value="3">{formatMessage({ id: 'assassin.access.api' })}</SelectOption>
              </Select>
            )}
          </FormItem>
          <FormItem label={formatMessage({ id: 'assassin.access.uri' })} {...this.formLayout}>
            {getFieldDecorator('uri', {
              initialValue: access.uri,
            })(<Input placeholder={formatMessage({ id: 'assassin.placeholder.input' })} disabled={!isEdit} />)}
          </FormItem>

        </Modal>
      );
    };
    return (
      <PageHeaderWrapper title={formatMessage({ id: 'assassin.access.list' })}>
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>{this.renderSimpleForm()}</div>
            <div className={styles.tableListOperator}>
              <Authorized authority='access_add'>
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
            </div>
            <Table
              rowKey={record => record.accessId}
              loading={loading}
              dataSource={list}
              columns={columns}
              pagination={false}
            />
          </div>
        </Card>
        {getModalContent()}
      </PageHeaderWrapper>
    );
  }
}
export default Access;
