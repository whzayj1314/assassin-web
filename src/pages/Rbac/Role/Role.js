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
  Tree
} from 'antd';
import StandardTable from '@/components/StandardTable';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import { formatMessage } from 'umi/locale';
import styles from './Role.less';
import RenderAuthorized from '@/components/Authorized';
import { getAccess } from '@/utils/authority';

const { TextArea } = Input;
const FormItem = Form.Item;
const SelectOption = Select.Option;
const { TreeNode } = Tree;
@connect(({ role, product, access, loading }) => ({
  role,
  loading: loading.models.role,
  productList: product.inList,
  selectList: access.selectList,
}))
@Form.create()
class Role extends PureComponent {
  state = {
    visible: false,
    accessVisible: false,
    isEdit: false,
    selectedRows: [],
    currentRoleId: undefined,
  };

  formLayout = {
    labelCol: { span: 7 },
    wrapperCol: { span: 13 },
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'role/fetchRolePage',
    });
    dispatch({
      type: 'product/fetchInnerProductList',
    });
  }

  handleSubmit = e => {
    e.preventDefault();
    const { dispatch, form, role: { role } } = this.props;
    const id = role.roleId;
    form.validateFields((err, values) => {
      if (!err) {
        if (id === undefined) {
          dispatch({
            type: 'role/save',
            payload: { ...values },
          }).then(() => {
            this.setState({
              visible: false,
            });
          })
        }
        else {
          dispatch({
            type: 'role/update',
            payload: { roleId: id, ...values },
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
          type: 'role/delete',
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
          type: 'role/deleteBatch',
          payload: selectedRows.length === 1 ? selectedRows[0].roleId : selectedRows.map(row => row.roleId).join(','),
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
      type: 'role/fetchRolePage',
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
      roleName: form.getFieldValue('roleNameSearch'),
      productId: form.getFieldValue('productIdSearch'),
    };
    dispatch({
      type: 'role/fetchRolePage',
      payload: values,
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
      type: 'role/fetchRolePage',
      payload: params,
    });
  };

  showModal = () => {
    this.setState({
      visible: true,
      isEdit: true,
    });
  };

  showAccessModal = (roleId, productId) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'access/fetchTreeSelect',
      payload: { productId },
    });
    dispatch({
      type: 'role/fetchCheckedKeys',
      payload: roleId,
    });
    this.setState({
      currentRoleId: roleId,
      accessVisible: true,
    });
  };

  showEditModal = (roleId) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'role/fetchRole',
      payload: roleId,
    });
    this.setState({
      visible: true,
      isEdit: true,
    });
  };


  showViewModal = (roleId) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'role/fetchRole',
      payload: roleId,
    });
    this.setState({
      visible: true,
      isEdit: false,
    });
  };

  handleCancel = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'role/clearRole',
      payload: {},
    });
    this.setState({
      visible: false,
    });
  };

  handleAccessCancel = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'role/clearCheckedList',
    });
    this.setState({
      currentRoleId: undefined,
      accessVisible: false,
    });
  };

  handleAccessSubmit = () => {
    const { dispatch,
      role: { checkedList },
    } = this.props;
    const { currentRoleId } = this.state;
    dispatch({
      type: 'role/saveRoleAccess',
      payload: { roleId: currentRoleId, accessIds: checkedList }
    }).then(() => {
      this.setState({
        accessVisible: false,
      });
    })
  };


  onCheck = checkedTreeKeys => {
    const { dispatch } = this.props;
    dispatch({
      type: 'role/setCheckedList',
      payload: { checkedKeys: checkedTreeKeys },
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
            <FormItem label={formatMessage({ id: 'assassin.role.name' })}>
              {getFieldDecorator('roleNameSearch')(<Input placeholder={formatMessage({ id: 'assassin.placeholder.input' })} />)}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label={formatMessage({ id: 'assassin.product.own.single' })}>
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

  renderTreeNodes = data => data.map((item) => {
    if (item.children) {
      return (
        <TreeNode title={item.title} key={item.key} dataRef={item}>
          {this.renderTreeNodes(item.children)}
        </TreeNode>
      );
    }
    return <TreeNode {...item} />;
  })

  render() {
    const {
      role: { data, role, checkedList },
      loading,
      form: { getFieldDecorator },
      productList,
      selectList,
    } = this.props;
    const {
      selectedRows,
      visible,
      accessVisible,
      isEdit,
    } = this.state;
    const modalFooter = isEdit
      ? { onOk: this.handleSubmit, onCancel: this.handleCancel }
      : { okButtonProps: {disabled: true}, onCancel: this.handleCancel };
    const productChildren = [];
    productList.forEach(product => {
      productChildren.push(<SelectOption value={product.productId}>{product.productName}</SelectOption>);
    });
    const Authorized = RenderAuthorized(getAccess());
    const columns = [
      {
        title: formatMessage({ id: 'assassin.role.name' }),
        dataIndex: 'roleName',
        render: (text, record) => <Authorized authority='role_view' noMatch={text}><a onClick={() => this.showViewModal(record.roleId)}>{text}</a></Authorized>,
      },
      {
        title: formatMessage({ id: 'assassin.product.own.single' }),
        dataIndex: 'productName',
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
            <Authorized authority='role_edit'>
              <a onClick={() => this.showEditModal(record.roleId)}>{formatMessage({ id: 'assassin.list.edit' })}</a>
            </Authorized>
            <Divider type="vertical" />
            <Authorized authority='role_access'>
              <a onClick={() => this.showAccessModal(record.roleId, record.productId)}>{formatMessage({ id: 'assassin.role.access' })}</a>
            </Authorized>
            <Divider type="vertical" />
            <Authorized authority='role_delete'>
              <a onClick={() => this.deleteItem(record.roleId)}>{formatMessage({ id: 'assassin.list.delete' })}</a>
            </Authorized>
          </Fragment>
        ),
      },
    ];
    const getModalContent = () => {
      return (
        <Modal
          title={`${role.roleId ? `${isEdit ? formatMessage({ id: 'assassin.list.edit' }) : formatMessage({ id: 'assassin.list.view' })}` : formatMessage({ id: 'assassin.list.add' })}`}
          className={styles.standardListForm}
          width={640}
          bodyStyle={{ padding: '28px 0 0' }}
          destroyOnClose
          visible={visible}
          {...modalFooter}
        >
          <FormItem label={formatMessage({ id: 'assassin.role.name' })} {...this.formLayout}>
            {getFieldDecorator('roleName', {
              rules: [{ required: true, message: formatMessage({ id: 'assassin.role.modal.name.valid' }) }],
              initialValue: role.roleName,
            })(<Input placeholder={formatMessage({ id: 'assassin.placeholder.input' })} disabled={!isEdit} />)}
          </FormItem>
          <FormItem label={formatMessage({ id: 'assassin.product.own.single' })} {...this.formLayout}>
            {getFieldDecorator('productId', {
              rules: [{ required: true, message: formatMessage({ id: 'assassin.product.modal.own.single.valid' }) }],
              initialValue: role.productId,
            })(
              <Select placeholder={formatMessage({ id: 'assassin.placeholder.select' })} disabled={!isEdit} className={styles.noFormSelect}>
                {productChildren}
              </Select>
            )}
          </FormItem>
          <FormItem {...this.formLayout} label={formatMessage({ id: 'assassin.list.remark' })}>
            {getFieldDecorator('remark', {
              initialValue: role.remark,
            })(<TextArea rows={4} placeholder={formatMessage({ id: 'assassin.placeholder.input' })} disabled={!isEdit} />)}
          </FormItem>
        </Modal>
      );
    };

    const getAccessModalContent = () => {
      return (
        <Modal
          title={formatMessage({ id: 'assassin.role.access' })}
          width={350}
          visible={accessVisible}
          onOk={this.handleAccessSubmit}
          onCancel={this.handleAccessCancel}
        >
          <Tree
            checkable
            checkedKeys={checkedList}
            onCheck={this.onCheck}
            autoExpandParent
            checkStrictly={false}
          >
            {this.renderTreeNodes(selectList)}
          </Tree>
        </Modal>
      );
    };
    return (
      <PageHeaderWrapper title={formatMessage({ id: 'assassin.role.list' })}>
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>{this.renderSimpleForm()}</div>
            <div className={styles.tableListOperator}>
              <Authorized authority='role_add'>
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
                  <Authorized authority='role_delete'>
                    <Button
                      onClick={this.deleteItems}
                    >{formatMessage({ id: 'assassin.list.delete' })}
                    </Button>
                  </Authorized>
                </span>
              )}
            </div>
            <StandardTable
              rowKey={record => record.roleId}
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
        {getAccessModalContent()}
      </PageHeaderWrapper>
    );
  }
}
export default Role;
