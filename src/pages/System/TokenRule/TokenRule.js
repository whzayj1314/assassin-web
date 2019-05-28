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
import styles from './TokenRule.less';
import RenderAuthorized from '@/components/Authorized';
import { getAccess } from '@/utils/authority';


const { TextArea } = Input;
const FormItem = Form.Item;
const SelectOption = Select.Option;
const ruleType = [formatMessage({ id: 'assassin.tokenRule.type.point' }), formatMessage({ id: 'assassin.tokenRule.type.length' })];
@connect(({ tokenRule, loading }) => ({
  tokenRule,
  loading: loading.models.tokenRule,
}))
@Form.create()
class TokenRule extends PureComponent {
  state = {
    visible: false,
    isEdit: false,
    selectedRows: [],
    formValues: {},
  };

  formLayout = {
    labelCol: { span: 7 },
    wrapperCol: { span: 13 },
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'tokenRule/fetchTokenRulePage',
    });
  }

  handleSubmit = e => {
    e.preventDefault();
    const { dispatch, form, tokenRule: { tokenRule } } = this.props;
    const id = tokenRule.ruleId;

    form.validateFields((err, values) => {
      if (!err) {
        if (id === undefined) {
          dispatch({
            type: 'tokenRule/save',
            payload: values,
          }).then(() => {
            this.setState({
              visible: false,
            });
          })
        }
        else {
          dispatch({
            type: 'tokenRule/update',
            payload: { ruleId: id, ...values },
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
          type: 'tokenRule/delete',
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
          type: 'tokenRule/deleteBatch',
          payload: selectedRows.length === 1 ? selectedRows[0].ruleId : selectedRows.map(row => row.ruleId).join(','),
        });
        this.setState({
          selectedRows: [],
        });
      },
    });
  };

  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    const { dispatch } = this.props;
    const { formValues } = this.state;
    const params = {
      current: pagination.current,
      size: pagination.pageSize,
      ...formValues,
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
      type: 'tokenRule/fetchTokenRulePage',
      payload: params,
    });
  };

  handleFormReset = () => {
    const { form, dispatch } = this.props;
    form.resetFields();
    this.setState({
      formValues: {},
    });
    dispatch({
      type: 'tokenRule/fetchTokenRulePage',
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
      ruleName: form.getFieldValue('ruleNameSearch'),
      ruleType: form.getFieldValue('ruleTypeSearch'),
    };
    this.setState({
      formValues: values,
    });
    dispatch({
      type: 'tokenRule/fetchTokenRulePage',
      payload: values,
    });
  };

  showModal = () => {
    this.setState({
      visible: true,
      isEdit: true,
    });
  };

  showEditModal = (ruleId) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'tokenRule/fetchTokenRule',
      payload: ruleId,
    });
    this.setState({
      visible: true,
      isEdit: true,
    });
  };


  showViewModal = (ruleId) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'tokenRule/fetchTokenRule',
      payload: ruleId,
    });
    this.setState({
      visible: true,
      isEdit: false,
    });
  };

  handleCancel = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'tokenRule/clearTokenRule',
      payload: {},
    });
    this.setState({
      visible: false,
    });
  };

  renderSimpleForm() {
    const {
      form: { getFieldDecorator },
    } = this.props;
    return (
      <Form onSubmit={this.handleSearch}>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label={formatMessage({ id: 'assassin.tokenRule.name' })}>
              {getFieldDecorator('ruleNameSearch')(<Input placeholder={formatMessage({ id: 'assassin.placeholder.input' })} />)}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label={formatMessage({ id: 'assassin.tokenRule.type' })}>
              {getFieldDecorator('ruleTypeSearch')(
                <Select placeholder={formatMessage({ id: 'assassin.placeholder.select' })}>
                  <SelectOption value="0">{formatMessage({ id: 'assassin.tokenRule.type.point' })}</SelectOption>
                  <SelectOption value="1">{formatMessage({ id: 'assassin.tokenRule.type.length' })}</SelectOption>
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
      tokenRule: { data, tokenRule },
      loading,
      form: { getFieldDecorator },
    } = this.props;
    const {
      selectedRows,
      visible,
      isEdit,
    } = this.state;
    const modalFooter = isEdit
      ? { onOk: this.handleSubmit, onCancel: this.handleCancel }
      : { okButtonProps: { disabled: true }, onCancel: this.handleCancel };
    const Authorized = RenderAuthorized(getAccess());
    const columns = [
      {
        title: formatMessage({ id: 'assassin.tokenRule.name' }),
        dataIndex: 'ruleName',
        render: (text, record) => <Authorized authority='rule_view' noMatch={text}><a onClick={() => this.showViewModal(record.ruleId)}>{text}</a></Authorized>,
      },
      {
        title: formatMessage({ id: 'assassin.tokenRule.type' }),
        dataIndex: 'ruleType',
        render: val => ruleType[val],
      },
      {
        title: formatMessage({ id: 'assassin.tokenRule.validity' }),
        dataIndex: 'tokenValidity',
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
            <Authorized authority='rule_edit'>
              <a onClick={() => this.showEditModal(record.ruleId)}>{formatMessage({ id: 'assassin.list.edit' })}</a>
            </Authorized>
            <Authorized authority='rule_delete'>
              <Divider type="vertical" />
              <a onClick={() => this.deleteItem(record.ruleId)}>{formatMessage({ id: 'assassin.list.delete' })}</a>
            </Authorized>
          </Fragment>
        ),
      },
    ];
    const getModalContent = () => {
      return (
        <Modal
          title={`${tokenRule.ruleName ? `${isEdit ? formatMessage({ id: 'assassin.list.edit' }) : formatMessage({ id: 'assassin.list.view' })}` : formatMessage({ id: 'assassin.list.add' })}`}
          className={styles.standardListForm}
          width={640}
          bodyStyle={{ padding: '28px 0 0' }}
          destroyOnClose
          visible={visible}
          {...modalFooter}
        >
          <FormItem label={formatMessage({ id: 'assassin.tokenRule.name' })} {...this.formLayout}>
            {getFieldDecorator('ruleName', {
              rules: [{ required: true, message: formatMessage({ id: 'assassin.tokenRule.modal.name.valid' }) }],
              initialValue: tokenRule.ruleName,
            })(<Input placeholder={formatMessage({ id: 'assassin.placeholder.input' })} disabled={!isEdit} />)}
          </FormItem>
          <FormItem label={formatMessage({ id: 'assassin.tokenRule.type' })} {...this.formLayout}>
            {getFieldDecorator('ruleType', {
              rules: [{ required: true, message: formatMessage({ id: 'assassin.tokenRule.modal.type.valid' }) }],
              initialValue: tokenRule.ruleType,
            })(
              <Select placeholder={formatMessage({ id: 'assassin.placeholder.select' })} disabled={!isEdit} className={styles.noFormSelect}>
                <SelectOption value="0">{formatMessage({ id: 'assassin.tokenRule.type.point' })}</SelectOption>
                <SelectOption value="1">{formatMessage({ id: 'assassin.tokenRule.type.length' })}</SelectOption>
              </Select>
            )}
          </FormItem>
          <FormItem label={formatMessage({ id: 'assassin.tokenRule.validity' })} {...this.formLayout}>
            {getFieldDecorator('tokenValidity', {
              rules: [{ required: true, message: formatMessage({ id: 'assassin.tokenRule.modal.validity.valid' }) }],
              initialValue: tokenRule.tokenValidity,
            })(<Input placeholder="1,3,0,0(day,hour,min,sec) or 10000(ms)" disabled={!isEdit} />)}
          </FormItem>
          <FormItem label={formatMessage({ id: 'assassin.tokenRule.refresh.validity' })} {...this.formLayout}>
            {getFieldDecorator('refreshTokenValidity', {
              initialValue: tokenRule.refreshTokenValidity,
            })(<Input placeholder="1,3,0,0(day,hour,min,sec) or 10000(ms)" disabled={!isEdit} />)}
          </FormItem>
          <FormItem {...this.formLayout} label={formatMessage({ id: 'assassin.list.remark' })}>
            {getFieldDecorator('remark', {
              initialValue: tokenRule.remark,
            })(<TextArea rows={4} placeholder={formatMessage({ id: 'assassin.placeholder.input' })} disabled={!isEdit} />)}
          </FormItem>
        </Modal>
      );
    };
    return (
      <PageHeaderWrapper title={formatMessage({ id: 'assassin.tokenRule.list' })}>
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>{this.renderSimpleForm()}</div>
            <div className={styles.tableListOperator}>
              <Authorized authority='rule_add'>
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
                  <Authorized authority='rule_delete'>
                    <Button
                      onClick={this.deleteItems}
                    >{formatMessage({ id: 'assassin.list.delete' })}
                    </Button>
                  </Authorized>
                </span>
              )}
            </div>
            <StandardTable
              rowKey={record => record.ruleId}
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
export default TokenRule;
