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
import styles from './Template.less';
import RenderAuthorized from '@/components/Authorized';
import { getAccess } from '@/utils/authority';

const { TextArea } = Input;
const FormItem = Form.Item;
const SelectOption = Select.Option;
const { TreeNode } = Tree;
@connect(({ template, product, access, loading }) => ({
  template,
  loading: loading.models.template,
  productList: product.multiList,
  selectList: access.selectList,
}))
@Form.create()
class Template extends PureComponent {
  state = {
    visible: false,
    accessVisible: false,
    isEdit: false,
    selectedRows: [],
    currentTemplateId: undefined,
  };

  formLayout = {
    labelCol: { span: 7 },
    wrapperCol: { span: 13 },
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'template/fetchTemplatePage',
    });
    dispatch({
      type: 'product/fetchMultiProductList',
    });
  }

  handleSubmit = e => {
    e.preventDefault();
    const { dispatch, form, template: { template } } = this.props;
    const id = template.templateId;
    form.validateFields((err, values) => {
      if (!err) {
        if (id === undefined) {
          dispatch({
            type: 'template/save',
            payload: { ...values },
          }).then(() => {
            this.setState({
              visible: false,
            });
          })
        }
        else {
          dispatch({
            type: 'template/update',
            payload: { templateId: id, ...values },
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
          type: 'template/delete',
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
          type: 'template/deleteBatch',
          payload: selectedRows.length === 1 ? selectedRows[0].templateId : selectedRows.map(row => row.templateId).join(','),
        }).then();
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
      type: 'template/fetchTemplatePage',
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
      templateName: form.getFieldValue('templateNameSearch'),
      productId: form.getFieldValue('productIdSearch'),
    };
    dispatch({
      type: 'template/fetchTemplatePage',
      payload: values,
    });
  };

  showModal = () => {
    this.setState({
      visible: true,
      isEdit: true,
    });
  };

  showAccessModal = (templateId, productId) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'access/fetchTreeSelect',
      payload: { productId },
    });
    dispatch({
      type: 'template/fetchCheckedKeys',
      payload: templateId,
    });
    this.setState({
      currentTemplateId: templateId,
      accessVisible: true,
    });
  };

  showEditModal = (templateId) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'template/fetchTemplate',
      payload: templateId,
    });
    this.setState({
      visible: true,
      isEdit: true,
    });
  };


  showViewModal = (templateId) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'template/fetchTemplate',
      payload: templateId,
    });
    this.setState({
      visible: true,
      isEdit: false,
    });
  };

  handleCancel = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'template/clearTemplate',
      payload: {},
    });
    this.setState({
      visible: false,
    });
  };

  handleAccessCancel = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'template/clearCheckedList',
    });
    this.setState({
      currentTemplateId: undefined,
      accessVisible: false,
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
      type: 'template/fetchTemplatePage',
      payload: params,
    });
  };

  handleAccessSubmit = () => {
    const { dispatch,
      template: { checkedList },
    } = this.props;
    const { currentTemplateId } = this.state;
    dispatch({
      type: 'template/saveTemplateAccess',
      payload: { templateId: currentTemplateId, accessIds: checkedList }
    }).then(() => {
      this.setState({
        accessVisible: false,
      });
    })
  };


  onCheck = checkedTreeKeys => {
    const { dispatch } = this.props;
    dispatch({
      type: 'template/setCheckedList',
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
            <FormItem label={formatMessage({ id: 'assassin.template.name' })}>
              {getFieldDecorator('templateNameSearch')(<Input placeholder={formatMessage({ id: 'assassin.placeholder.input' })} />)}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label={formatMessage({ id: 'assassin.product.own.mutli' })}>
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
      template: { data, template, checkedList },
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
        title: formatMessage({ id: 'assassin.template.name' }),
        dataIndex: 'templateName',
        render: (text, record) => <Authorized authority='template_view' noMatch={text}><a onClick={() => this.showViewModal(record.templateId)}>{text}</a></Authorized>,
      },
      {
        title: formatMessage({ id: 'assassin.product.own.mutli' }),
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
            <Authorized authority='template_edit'>
              <a onClick={() => this.showEditModal(record.templateId)}>{formatMessage({ id: 'assassin.list.edit' })}</a>
            </Authorized>
            <Divider type="vertical" />
            <Authorized authority='template_access'>
              <a onClick={() => this.showAccessModal(record.templateId, record.productId)}>{formatMessage({ id: 'assassin.template.access' })}</a>
            </Authorized>
            <Divider type="vertical" />
            <Authorized authority='template_delete'>
              <a onClick={() => this.deleteItem(record.templateId)}>{formatMessage({ id: 'assassin.list.delete' })}</a>
            </Authorized>
          </Fragment>
        ),
      },
    ];
    const getModalContent = () => {
      return (
        <Modal
          title={`${template.templateId ? `${isEdit ? formatMessage({ id: 'assassin.list.edit' }) : formatMessage({ id: 'assassin.list.view' })}` : formatMessage({ id: 'assassin.list.add' })}`}
          className={styles.standardListForm}
          width={640}
          bodyStyle={{ padding: '28px 0 0' }}
          destroyOnClose
          visible={visible}
          {...modalFooter}
        >
          <FormItem label={formatMessage({ id: 'assassin.template.name' })} {...this.formLayout}>
            {getFieldDecorator('templateName', {
              rules: [{ required: true, message: formatMessage({ id: 'assassin.template.modal.name.valid' }) }],
              initialValue: template.templateName,
            })(<Input placeholder={formatMessage({ id: 'assassin.placeholder.input' })} disabled={!isEdit} />)}
          </FormItem>
          <FormItem label={formatMessage({ id: 'assassin.product.own.mutli' })} {...this.formLayout}>
            {getFieldDecorator('productId', {
              rules: [{ required: true, message: formatMessage({ id: 'assassin.product.modal.own.mutli.valid' }) }],
              initialValue: template.productId,
            })(
              <Select placeholder={formatMessage({ id: 'assassin.placeholder.select' })} disabled={!isEdit} className={styles.noFormSelect}>
                {productChildren}
              </Select>
            )}
          </FormItem>
          <FormItem {...this.formLayout} label={formatMessage({ id: 'assassin.list.remark' })}>
            {getFieldDecorator('remark', {
              initialValue: template.remark,
            })(<TextArea rows={4} placeholder={formatMessage({ id: 'assassin.placeholder.input' })} disabled={!isEdit} />)}
          </FormItem>
        </Modal>
      );
    };

    const getAccessModalContent = () => {
      return (
        <Modal
          title={formatMessage({ id: 'assassin.template.access' })}
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
      <PageHeaderWrapper title={formatMessage({ id: 'assassin.template.list' })}>
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>{this.renderSimpleForm()}</div>
            <div className={styles.tableListOperator}>
              <Authorized authority='template_add'>
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
                  <Authorized authority='template_delete'>
                    <Button
                      onClick={this.deleteItems}
                    >{formatMessage({ id: 'assassin.list.delete' })}
                    </Button>
                  </Authorized>
                </span>
              )}
            </div>
            <StandardTable
              rowKey={record => record.templateId}
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
export default Template;
