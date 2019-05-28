import React, { PureComponent } from 'react';
import { connect } from 'dva';
import {
  List,
  Card,
  Input,
  Button,
  Icon,
  Form,
  Select,
  Modal,
  Upload,
  Switch,
} from 'antd';
import Ellipsis from '@/components/Ellipsis';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import { formatMessage } from 'umi/locale';
import styles from './Product.less';
import { getToken } from '../../../utils/authority';
import { imgUrlPrefix } from '../../../defaultSettings';
import RenderAuthorized from '@/components/Authorized';
import { getAccess } from '@/utils/authority';

const FormItem = Form.Item;
const SelectOption = Select.Option;
const { TextArea } = Input;

@connect(({ product, app, loading }) => ({
  product,
  allApps: app.allApps,
  loading: loading.models.product,
}))
@Form.create()
class Product extends PureComponent {
  state = { visible: false, isEdit: undefined, imageLoading: false, mutexRuleVisible: false };

  formLayout = {
    labelCol: { span: 7 },
    wrapperCol: { span: 13 },
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'product/fetchAllProductList',
      payload: {},
    });
    dispatch({
      type: 'app/fetchAllAppsList',
      payload: {},
    });
  };

  showModal = () => {
    this.setState({
      visible: true,
      isEdit: true,
    });
  };

  showMutexRuleModal = (productId) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'product/fetchMutexRuleList',
      payload: productId,
    });
    this.setState({
      mutexRuleVisible: true,
    });
  };

  showViewModal = (productId) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'product/fetchProduct',
      payload: productId,
    });
    this.setState({
      visible: true,
      isEdit: false,
    });
  };

  showEditModal = (productId) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'product/fetchProduct',
      payload: productId,
    });
    this.setState({
      visible: true,
      isEdit: true,
    });
  };

  handleCancel = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'product/clearProduct',
      payload: {},
    });
    this.setState({
      visible: false,
    });
  };

  handleMutexRuleCancel = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'product/clearMutexRuleList',
    });
    this.setState({
      mutexRuleVisible: false,
    });
  };

  handleSubmit = e => {
    e.preventDefault();
    const { dispatch, form, product: { product } } = this.props;
    const id = product.productId;

    form.validateFields((err, values) => {
      if (!err) {
        if (id === undefined) {
          dispatch({
            type: 'product/save',
            payload: values,
          }).then(() => {
            this.setState({
              visible: false,
            });
          })
        }
        else {
          dispatch({
            type: 'product/update',
            payload: { productId: id, ...values },
          }).then(() => {
            this.setState({
              visible: false,
            });
          })
        }
      }
    });
  };

  handleMutexRuleSubmit = e => {
    e.preventDefault();
    const { form, dispatch, product: { currentProductId } } = this.props;
    const values = form.getFieldsValue();
    const arr = Object.keys(values)
      .filter(key => key.indexOf("checked") !== -1 && values[key])
      .map(key => ({ rule: key.substring(7, key.length) }))
    dispatch({
      type: 'product/updateMutexRule',
      payload: { productId: currentProductId, mutexRules: JSON.stringify(arr) },
    }).then(() => {
      this.setState({
        mutexRuleVisible: false,
      });
    })
  }

  deleteItem = id => {
    Modal.confirm({
      title: formatMessage({ id: 'assassin.modal.confirm.title' }),
      content: formatMessage({ id: 'assassin.modal.confirm.content' }),
      onOk: () => {
        const { dispatch } = this.props;
        dispatch({
          type: 'product/delete',
          payload: id,
        });
      },
    });
  };

  handleChange = (info) => {
    if (info.file.status === 'uploading') {
      this.setState({ imageLoading: true });
      return;
    }
    if (info.file.status === 'done') {
      const { dispatch, product: { product } } = this.props;
      dispatch({
        type: 'product/saveUrl',
        payload: { ...product, 'avatar': info.file.response },
      });
      this.setState({
        imageLoading: false,
      });
    }
  };

  render() {
    const {
      product: { list, product, mutexRuleList },
      loading,
      allApps,
      form: { getFieldDecorator },
    } = this.props;
    const { visible, isEdit, imageLoading, mutexRuleVisible } = this.state;
    const modalFooter = isEdit
      ? { onOk: this.handleSubmit, onCancel: this.handleCancel }
      : { okButtonProps: {disabled: true}, onCancel: this.handleCancel };
    const modalMutexRuleFooter = mutexRuleList.length > 0
      ? { onOk: this.handleMutexRuleSubmit, onCancel: this.handleMutexRuleCancel }
      : { okButtonProps: {disabled: true}, onCancel: this.handleMutexRuleCancel };
    const children = [];
    allApps.forEach(app => {
      children.push(<SelectOption value={app.appId}>{app.appName}</SelectOption>);
    });
    const getModalContent = () => {
      const uploadButton = (
        <div>
          <Icon type={imageLoading ? 'loading' : 'plus'} />
          <div className="ant-upload-text">Upload</div>
        </div>
      );
      const token = getToken();
      return (
        <Form onSubmit={this.handleSubmit}>
          <FormItem label={formatMessage({ id: 'assassin.product.name' })} {...this.formLayout}>
            {getFieldDecorator('productName', {
              rules: [{ required: true, message: formatMessage({ id: 'assassin.product.modal.name.valid' }) }],
              initialValue: product.productName,
            })(<Input placeholder={formatMessage({ id: 'assassin.placeholder.input' })} disabled={!isEdit} />)}
          </FormItem>
          <FormItem label={formatMessage({ id: 'assassin.product.category' })} {...this.formLayout}>
            {getFieldDecorator('productType', {
              rules: [{ required: true, message: formatMessage({ id: 'assassin.product.modal.category.valid' }) }],
              initialValue: product.productType,
            })(
              <Select placeholder={formatMessage({ id: 'assassin.placeholder.select' })} disabled={!isEdit}>
                <SelectOption value="0">{formatMessage({ id: 'assassin.product.category.single' })}</SelectOption>
                <SelectOption value="1">{formatMessage({ id: 'assassin.product.category.mutli' })}</SelectOption>
              </Select>,
            )}
          </FormItem>
          <FormItem {...this.formLayout} label={formatMessage({ id: 'assassin.product.app' })}>
            {getFieldDecorator('appIds', {
              rules: [{ required: true, message: formatMessage({ id: 'assassin.product.modal.app.valid' }) }],
              initialValue: product.appIds,
            })(
              <Select placeholder={formatMessage({ id: 'assassin.placeholder.select' })} mode="multiple" disabled={!isEdit}>
                {children}
              </Select>
            )}
          </FormItem>
          <FormItem label={formatMessage({ id: 'assassin.product.authorization' })} {...this.formLayout}>
            {getFieldDecorator('accessRule', {
              rules: [{ required: true, message: formatMessage({ id: 'assassin.product.modal.authorization.valid' }) }],
              initialValue: product.accessRule,
            })(
              <Select placeholder={formatMessage({ id: 'assassin.placeholder.select' })} disabled={!isEdit}>
                <SelectOption value="0">{formatMessage({ id: 'assassin.product.authorization.user' })}</SelectOption>
                <SelectOption value="1">{formatMessage({ id: 'assassin.product.authorization.role' })}</SelectOption>
                <SelectOption value="2">{formatMessage({ id: 'assassin.product.authorization.access' })}</SelectOption>
              </Select>,
            )}
          </FormItem>
          <FormItem {...this.formLayout} label={formatMessage({ id: 'assassin.product.logo' })}>
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
                initialValue: product.avatar,
              })(product.avatar ? <img src={`${imgUrlPrefix}${product.avatar}`} alt="avatar" className={styles.productLogo} /> : uploadButton)}
            </Upload>
          </FormItem>
          <FormItem {...this.formLayout} label={formatMessage({ id: 'assassin.product.descrption' })}>
            {getFieldDecorator('remark', {
              initialValue: product.remark,
            })(<TextArea rows={4} placeholder={formatMessage({ id: 'assassin.placeholder.input' })} disabled={!isEdit} />)}
          </FormItem>
        </Form>
      );
    };
    const getMutexRuleModalContent = () => {
      return (
        <List
          header={<div>{formatMessage({ id: 'assassin.product.rule.set' })}</div>}
          dataSource={mutexRuleList}
          renderItem={item => (
            <List.Item
              actions={[
                <FormItem>
                  {getFieldDecorator(`checked${item.key}`, {
                    initialValue: item.checked === '1', valuePropName: 'checked'
                  })(<Switch checkedChildren={formatMessage({ id: 'assassin.product.rule.exclusive' })} unCheckedChildren={formatMessage({ id: 'assassin.product.rule.nonExclusive' })} />)}
                </FormItem>]}
            >
              <List.Item.Meta
                title={item.title}
              />
            </List.Item>
          )}
        />
      );
    };
    const Authorized = RenderAuthorized(getAccess());
    return (
      <PageHeaderWrapper title={formatMessage({ id: 'assassin.product.list' })}>
        <div className={styles.cardList}>
          <List
            rowKey="id"
            loading={loading}
            grid={{ gutter: 24, lg: 3, md: 2, sm: 1, xs: 1 }}
            dataSource={['', ...list]}
            renderItem={item =>
              item ? (
                <List.Item key={item.productId}>
                  <Card
                    hoverable
                    className={styles.card}
                    actions={[
                      <Authorized authority='product_view'>
                        <a onClick={e => {
                          e.preventDefault();
                          this.showViewModal(item.productId);
                        }}
                        >{formatMessage({ id: 'assassin.list.view' })}
                        </a>
                      </Authorized>,
                      <Authorized authority='product_edit'>
                        <a onClick={e => {
                          e.preventDefault();
                          this.showEditModal(item.productId);
                        }}
                        >{formatMessage({ id: 'assassin.list.edit' })}
                        </a>
                      </Authorized>,
                      <Authorized authority='product_rule'>
                        <a onClick={e => {
                          e.preventDefault();
                          this.showMutexRuleModal(item.productId);
                        }}
                        >{formatMessage({ id: 'assassin.product.rule' })}
                        </a>
                      </Authorized>,
                      <Authorized authority='product_delete'>
                        <a onClick={e => {
                          e.preventDefault();
                          this.deleteItem(item.productId);
                        }}
                        >{formatMessage({ id: 'assassin.list.delete' })}
                        </a>
                      </Authorized>
                    ]}
                  >
                    <Card.Meta
                      avatar={<img alt="" className={styles.cardAvatar} src={`${imgUrlPrefix}${item.avatar}`} />}
                      title={<a>{item.productName}</a>}
                      description={
                        <Ellipsis className={styles.item} lines={3}>
                          {item.remark}
                        </Ellipsis>
                      }
                    />
                  </Card>
                </List.Item>
              ) : (
                <List.Item>
                  <Authorized authority='product_delete'>
                    <Button
                      type="dashed"
                      className={styles.newButton}
                      onClick={e => {
                          e.preventDefault();
                          this.showModal();
                        }}
                    >
                      <Icon type="plus" /> {formatMessage({ id: 'assassin.product.add' })}
                    </Button>
                  </Authorized>
                </List.Item>
                )
            }
          />
        </div>
        <Modal
          title={`${product.productId ? `${isEdit ? formatMessage({ id: 'assassin.list.edit' }) : formatMessage({ id: 'assassin.list.view' })}` : formatMessage({ id: 'assassin.list.add' })}`}
          className={styles.standardListForm}
          width={640}
          bodyStyle={{ padding: '28px 0 0' }}
          destroyOnClose
          visible={visible}
          {...modalFooter}
        >
          {getModalContent()}
        </Modal>
        <Modal
          width={600}
          visible={mutexRuleVisible}
          onCancel={this.handleMutexRuleCancel}
          {...modalMutexRuleFooter}
        >
          {getMutexRuleModalContent()}
        </Modal>
      </PageHeaderWrapper>
    );
  }
}

export default Product;
