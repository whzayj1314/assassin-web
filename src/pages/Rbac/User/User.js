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
  Switch,
  Avatar,
  Select,
  Upload,
  Icon,
  Transfer,
} from 'antd';
import StandardTable from '@/components/StandardTable';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import { formatMessage } from 'umi/locale';
import styles from './User.less';
import { imgUrlPrefix } from '../../../defaultSettings';
import { getToken } from '../../../utils/authority';
import RenderAuthorized from '@/components/Authorized';
import { getAccess } from '@/utils/authority';

const FormItem = Form.Item;
const SelectOption = Select.Option;
/* eslint react/no-multi-comp:0 */
@connect(({ user, loading }) => ({
  user,
  loading: loading.models.user,
}))
@Form.create()
class User extends PureComponent {
  state = {
    visible: false,
    isEdit: false,
    isAdd: false,
    selectedRows: [],
    imageLoading: false,
    roleVisible: false,
    currentUserId: undefined,
    selectedKeys: [],
  };

  formLayout = {
    labelCol: { span: 7 },
    wrapperCol: { span: 13 },
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'user/fetchUserPage',
    });
  }

  handleSubmit = e => {
    e.preventDefault();
    const { dispatch, form, user: { user } } = this.props;
    const id = user.userId;

    form.validateFields((err, values) => {
      if (!err) {
        if (id === undefined) {
          dispatch({
            type: 'user/save',
            payload: values,
          }).then(() => {
            this.setState({
              visible: false,
            });
          })
        }
        else {
          dispatch({
            type: 'user/update',
            payload: { userId: id, ...values },
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
          type: 'user/delete',
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
          type: 'user/deleteBatch',
          payload: selectedRows.length === 1 ? selectedRows[0].userId : selectedRows.map(row => row.userId).join(','),
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
      type: 'user/fetchUserPage',
      payload: params,
    });
  };

  handleFormReset = () => {
    const { form, dispatch } = this.props;
    form.resetFields();
    dispatch({
      type: 'user/fetchUserPage',
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
      account: form.getFieldValue('accountSearch'),
      nickname: form.getFieldValue('nicknameSearch'),
      mobilePhoneNumber: form.getFieldValue('mobilePhoneNumberSearch'),
      lockFlag: form.getFieldValue('lockFlagSearch'),
    };
    form.validateFields(
      ['mobilePhoneNumberSearch'],
      (err) => {
        if (!err) {
          dispatch({
            type: 'user/fetchUserPage',
            payload: serachValues,
          });
        }
      })
  };

  showModal = () => {
    this.setState({
      visible: true,
      isEdit: true,
      isAdd: true,
    });
  };

  showEditModal = (userId) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'user/fetchUser',
      payload: userId,
    });
    this.setState({
      visible: true,
      isEdit: true,
    });
  };

  showTransferModal = (userId) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'user/fetchTransfer',
      payload: userId,
    });
    this.setState({
      currentUserId: userId,
      roleVisible: true,
    });
  };


  showViewModal = (userId) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'user/fetchUser',
      payload: userId,
    });
    this.setState({
      visible: true,
      isEdit: false,
    });
  };

  handleCancel = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'user/clearUser',
      payload: {},
    });
    this.setState({
      visible: false,
      isAdd: false,
    });
  };

  handleRoleCancel = () => {
    this.setState({
      selectedKeys: [],
      roleVisible: false,
    });
  };

  handleChange = (info) => {
    if (info.file.status === 'uploading') {
      this.setState({ imageLoading: true });
      return;
    }
    if (info.file.status === 'done') {
      const { dispatch, user: { user } } = this.props;
      dispatch({
        type: 'user/saveUrl',
        payload: { ...user, 'avatar': info.file.response },
      });
      this.setState({
        imageLoading: false,
      });
    }
  };

  handleRoleChange = (targetKeys) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'user/saveKeys',
      payload: targetKeys,
    });
  }

  handleSelectChange = (sourceSelectedKeys, targetSelectedKeys) => {
    this.setState({ selectedKeys: [...sourceSelectedKeys, ...targetSelectedKeys] });
  }

  handleRoleSubmit = () => {
    const { dispatch,
      user: { targetKeys },
    } = this.props;
    const { currentUserId } = this.state;
    dispatch({
      type: 'user/saveUserRole',
      payload: { userId: currentUserId, roleIds: targetKeys }
    }).then(() => {
      this.setState({
        selectedKeys: [],
        roleVisible: false,
      });
    })
  };

  renderSimpleForm() {
    const {
      form: { getFieldDecorator },
    } = this.props;
    return (
      <Form onSubmit={this.handleSearch}>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={4} sm={24}>
            <FormItem label={formatMessage({ id: 'assassin.user.account' })}>
              {getFieldDecorator('accountSearch')(<Input placeholder={formatMessage({ id: 'assassin.placeholder.input' })} />)}
            </FormItem>
          </Col>
          <Col md={4} sm={24}>
            <FormItem label={formatMessage({ id: 'assassin.user.nickname' })}>
              {getFieldDecorator('nicknameSearch')(<Input placeholder={formatMessage({ id: 'assassin.placeholder.input' })} />)}
            </FormItem>
          </Col>
          <Col md={4} sm={24}>
            <FormItem label={formatMessage({ id: 'assassin.user.phone' })}>
              {getFieldDecorator('mobilePhoneNumberSearch', {
                rules: [{ message: formatMessage({ id: 'assassin.user.search.phone.valid' }), pattern: /^[0-9]*$/ }],
              })(<Input placeholder={formatMessage({ id: 'assassin.placeholder.input' })} />)}
            </FormItem>
          </Col>
          <Col md={4} sm={24}>
            <FormItem label={formatMessage({ id: 'assassin.user.status' })}>
              {getFieldDecorator('lockFlagSearch')
                (
                  <Select placeholder={formatMessage({ id: 'assassin.placeholder.select' })}>
                    <SelectOption key="0">{formatMessage({ id: 'assassin.user.status.unlocked' })}</SelectOption>
                    <SelectOption key="1">{formatMessage({ id: 'assassin.user.status.locked' })}</SelectOption>
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
      user: { data, user, transferList, targetKeys },
      loading,
      form: { getFieldDecorator },
    } = this.props;
    const {
      selectedRows,
      visible,
      isEdit,
      isAdd,
      imageLoading,
      roleVisible,
      selectedKeys,
    } = this.state;
    const modalFooter = isEdit
      ? { onOk: this.handleSubmit, onCancel: this.handleCancel }
      : { okButtonProps: {disabled: true}, onCancel: this.handleCancel };
    const Authorized = RenderAuthorized(getAccess());
    const columns = [
      {
        title: formatMessage({ id: 'assassin.user.avatar' }),
        dataIndex: 'avatar',
        render: (text) => <Avatar src={`${imgUrlPrefix}${text}`} />,
      },
      {
        title: formatMessage({ id: 'assassin.user.account' }),
        dataIndex: 'account',
        render: (text, record) => <Authorized authority='user_view' noMatch={text}><a onClick={() => this.showViewModal(record.userId)}>{text}</a></Authorized>,
      },
      {
        title: formatMessage({ id: 'assassin.user.nickname' }),
        dataIndex: 'nickname',
      },
      {
        title: formatMessage({ id: 'assassin.user.phone' }),
        dataIndex: 'mobilePhoneNumber',
      },
      {
        title: formatMessage({ id: 'assassin.user.status' }),
        dataIndex: 'lockFlag',
        render: (text) => text === '0' ? formatMessage({ id: 'assassin.user.status.unlocked' }) : formatMessage({ id: 'assassin.user.status.locked' }),
      },
      {
        title: formatMessage({ id: 'assassin.list.option' }),
        render: (text, record) => (
          <Fragment>
            <Authorized authority='user_edit'>
              <a onClick={() => this.showEditModal(record.userId)}>{formatMessage({ id: 'assassin.list.edit' })}</a>
            </Authorized>
            <Divider type="vertical" />
            <Authorized authority='user_role'>
              <a onClick={() => this.showTransferModal(record.userId)}>{formatMessage({ id: 'assassin.user.role' })}</a>
            </Authorized>
            <Divider type="vertical" />
            <Authorized authority='user_delete'>
              <a onClick={() => this.deleteItem(record.userId)}>{formatMessage({ id: 'assassin.list.delete' })}</a>
            </Authorized>
          </Fragment>
        ),
      },
    ];
    const getModalContent = () => {
      const uploadButton = (
        <div>
          <Icon type={imageLoading ? 'loading' : 'plus'} />
          <div className="ant-upload-text">Upload</div>
        </div>
      );
      const token = getToken();
      return (
        <Modal
          title={`${user.userName ? `${isEdit ? formatMessage({ id: 'assassin.list.edit' }) : formatMessage({ id: 'assassin.list.view' })}` : formatMessage({ id: 'assassin.list.add' })}`}
          className={styles.standardListForm}
          width={640}
          bodyStyle={{ padding: '28px 0 0' }}
          destroyOnClose
          visible={visible}
          {...modalFooter}
        >
          <FormItem label={formatMessage({ id: 'assassin.user.account' })} {...this.formLayout}>
            {getFieldDecorator('account', {
              rules: [{ required: true, message: formatMessage({ id: 'assassin.user.modal.account.valid' }) }],
              initialValue: user.account,
            })(<Input placeholder={formatMessage({ id: 'assassin.placeholder.input' })} disabled={!isEdit} />)}
          </FormItem>
          <FormItem label={formatMessage({ id: 'assassin.user.password' })} {...this.formLayout}>
            {getFieldDecorator('password', {
              rules: [{ required: true, message: formatMessage({ id: 'assassin.user.modal.password.valid' }) }],
              initialValue: user.password,
            })(<Input type="password" placeholder={formatMessage({ id: 'assassin.placeholder.input' })} disabled={!isEdit || !isAdd} />)}
          </FormItem>
          <FormItem label={formatMessage({ id: 'assassin.user.nickname' })} {...this.formLayout}>
            {getFieldDecorator('nickname', {
              rules: [{ required: true, message: formatMessage({ id: 'assassin.user.modal.nickname.valid' }) }],
              initialValue: user.nickname,
            })(<Input placeholder={formatMessage({ id: 'assassin.placeholder.input' })} disabled={!isEdit} />)}
          </FormItem>
          <FormItem label={formatMessage({ id: 'assassin.user.phone' })} {...this.formLayout}>
            {getFieldDecorator('mobilePhoneNumber', {
              rules: [{ required: true, message: formatMessage({ id: 'assassin.user.modal.phone.valid' }), pattern: /^1[3456789]\d{9}$/ }],
              initialValue: user.mobilePhoneNumber,
            })(<Input placeholder={formatMessage({ id: 'assassin.placeholder.input' })} disabled={!isEdit} />)}
          </FormItem>
          <FormItem label={formatMessage({ id: 'assassin.user.status' })} {...this.formLayout}>
            {getFieldDecorator('lockFlag', {
              initialValue: user.lockFlag === '0', valuePropName: 'checked'
            })(<Switch checkedChildren={formatMessage({ id: 'assassin.user.status.unlocked' })} unCheckedChildren={formatMessage({ id: 'assassin.user.status.locked' })} disabled={!isEdit} />)}
          </FormItem>
          <FormItem {...this.formLayout} label={formatMessage({ id: 'assassin.user.avatar' })}>
            <Upload
              name="file"
              listType="picture-card"
              className="avatar-uploader"
              showUploadList={false}
              action="/api/minio/assassin"
              onChange={this.handleChange}
              headers={{ 'Authorization': token }}
              disabled={!isEdit}
            >
              {getFieldDecorator('avatar', {
                initialValue: user.avatar,
              })(user.avatar ? <img src={`${imgUrlPrefix}${user.avatar}`} alt="avatar" className={styles.userLogo} /> : uploadButton)}
            </Upload>
          </FormItem>
        </Modal>
      );
    };
    const getRoleModalContent = () => {
      return (
        <Modal
          title={formatMessage({ id: 'assassin.user.role' })}
          width={660}
          visible={roleVisible}
          onOk={this.handleRoleSubmit}
          onCancel={this.handleRoleCancel}
        >
          <Transfer
            dataSource={transferList}
            showSearch
            listStyle={{
              width: 250,
              height: 300,
            }}
            operations={[formatMessage({ id: 'assassin.user.role.add' }), formatMessage({ id: 'assassin.user.role.delete' })]}
            targetKeys={targetKeys}
            selectedKeys={selectedKeys}
            onSelectChange={this.handleSelectChange}
            onChange={this.handleRoleChange}
            render={item => `${item.title}-${item.description}`}
          />
        </Modal>
      );
    };
    return (
      <PageHeaderWrapper title={formatMessage({ id: 'assassin.user.list' })}>
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>{this.renderSimpleForm()}</div>
            <div className={styles.tableListOperator}>
              <Authorized authority='user_add'>
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
                  <Authorized authority='user_delete'>
                    <Button
                      onClick={this.deleteItems}
                    >{formatMessage({ id: 'assassin.list.delete' })}
                    </Button>
                  </Authorized>
                </span>
              )}
            </div>
            <StandardTable
              rowKey={record => record.userId}
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
        {getRoleModalContent()}
      </PageHeaderWrapper>
    );
  }
}
export default User;
