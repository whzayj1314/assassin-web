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
} from 'antd';
import StandardTable from '@/components/StandardTable';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import { formatMessage } from 'umi/locale';
import styles from './App.less';
import RenderAuthorized from '@/components/Authorized';
import { getAccess } from '@/utils/authority';

const { TextArea } = Input;
const FormItem = Form.Item;

/* eslint react/no-multi-comp:0 */
@connect(({ app, loading }) => ({
  app,
  loading: loading.models.app,
}))
@Form.create()
class App extends PureComponent {
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
      type: 'app/fetchAppPage',
    });
  }

  handleSubmit = e => {
    e.preventDefault();
    const { dispatch, form, app: { app } } = this.props;
    const id = app.appId;

    form.validateFields((err, values) => {
      if (!err) {
        if (id === undefined) {
          dispatch({
            type: 'app/save',
            payload: values,
          });
          this.setState({
            visible: false,
          });
        }
        else {
          dispatch({
            type: 'app/update',
            payload: { appId: id, ...values },
          });
          this.setState({
            visible: false,
          });
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
          type: 'app/delete',
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
          type: 'app/deleteBatch',
          payload: selectedRows.length === 1 ? selectedRows[0].appId : selectedRows.map(row => row.appId).join(','),
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
      type: 'app/fetchAppPage',
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
      type: 'app/fetchAppPage',
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
      appName: form.getFieldValue('appNameSearch'),
    };
    this.setState({
      formValues: values,
    });
    dispatch({
      type: 'app/fetchAppPage',
      payload: values,
    });
  };

  showModal = () => {
    this.setState({
      visible: true,
      isEdit: true,
    });
  };

  showEditModal = (appId) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'app/fetchApp',
      payload: appId,
    });
    this.setState({
      visible: true,
      isEdit: true,
    });
  };


  showViewModal = (appId) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'app/fetchApp',
      payload: appId,
    });
    this.setState({
      visible: true,
      isEdit: false,
    });
  };

  handleCancel = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'app/clearApp',
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
            <FormItem label={formatMessage({ id: 'assassin.app.name' })}>
              {getFieldDecorator('appNameSearch')(<Input placeholder={formatMessage({ id: 'assassin.placeholder.input' })} />)}
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
      app: { data, app },
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
      : { okButtonProps: {disabled: true}, onCancel: this.handleCancel };
    const Authorized = RenderAuthorized(getAccess());
    const columns = [
      {
        title: formatMessage({ id: 'assassin.app.name' }),
        dataIndex: 'appName',
        render: (text, record) => <Authorized authority='app_view' noMatch={text}><a onClick={() => this.showViewModal(record.appId)}>{text}</a></Authorized>,
      },
      {
        title: formatMessage({ id: 'assassin.app.descrption' }),
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
            <Authorized authority='app_edit'>
              <a onClick={() => this.showEditModal(record.appId)}>{formatMessage({ id: 'assassin.list.edit' })}</a>
            </Authorized>
            <Divider type="vertical" />
            <Authorized authority='app_delete'>
              <a onClick={() => this.deleteItem(record.appId)}>{formatMessage({ id: 'assassin.list.delete' })}</a>
            </Authorized>
          </Fragment>
        ),
      },
    ];
    const getModalContent = () => {
      return (
        <Modal
          title={`${app.appName ? `${isEdit ? formatMessage({ id: 'assassin.list.edit' }) : formatMessage({ id: 'assassin.list.view' })}` : formatMessage({ id: 'assassin.list.add' })}`}
          className={styles.standardListForm}
          width={640}
          bodyStyle={{ padding: '28px 0 0' }}
          destroyOnClose
          visible={visible}
          {...modalFooter}
        >
          <FormItem label={formatMessage({ id: 'assassin.app.name' })} {...this.formLayout}>
            {getFieldDecorator('appName', {
              rules: [{ required: true, message: formatMessage({ id: 'assassin.app.modal.name.valid' }) }],
              initialValue: app.appName,
            })(<Input placeholder="spring.application.name" disabled={!isEdit} />)}
          </FormItem>
          <FormItem {...this.formLayout} label={formatMessage({ id: 'assassin.app.descrption' })}>
            {getFieldDecorator('remark', {
              initialValue: app.remark,
            })(<TextArea rows={4} placeholder={formatMessage({ id: 'assassin.placeholder.input' })} disabled={!isEdit} />)}
          </FormItem>
        </Modal>

      );
    };
    return (
      <PageHeaderWrapper title={formatMessage({ id: 'assassin.app.list' })}>
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>{this.renderSimpleForm()}</div>
            <div className={styles.tableListOperator}>
              <Authorized authority='app_add'>
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
                  <Authorized authority='app_add'>
                    <Button
                      onClick={this.deleteItems}
                    >{formatMessage({ id: 'assassin.list.delete' })}
                    </Button>
                  </Authorized>
                </span>
              )}
            </div>
            <StandardTable
              rowKey={record => record.appName}
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
export default App;
