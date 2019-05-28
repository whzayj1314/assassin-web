import React, { PureComponent } from 'react';
import moment from 'moment';
import { connect } from 'dva';
import Link from 'umi/link';
import { formatMessage, FormattedMessage } from 'umi/locale';
import { Row, Col, Card, List, Avatar } from 'antd';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import {imgUrlPrefix} from '../../defaultSettings';
import styles from './Desktop.less';

@connect(({ user, loading ,product }) => ({
  currentUser: user.currentUser,
  product,
  user,
  currentUserLoading: loading.effects['user/fetchCurrent'],
  productLoading: loading.effects['product/fetchAllProductList'],
}))
class Desktop extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'user/fetchCurrent',
    });
    dispatch({
      type: 'user/fetchAmount',
    });
    dispatch({
      type: 'product/fetchAllProductList',
      payload: {},
    });
    dispatch({
      type: 'product/fetchInAmount',
    });
    dispatch({
      type: 'product/fetchTenantAmount',
    });
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'chart/clear',
    });
  }

  renderActivities() {
    const {
      activities: { list },
    } = this.props;
    return list.map(item => {
      const events = item.template.split(/@\{([^{}]*)\}/gi).map(key => {
        if (item[key]) {
          return (
            <a href={item[key].link} key={item[key].name}>
              {item[key].name}
            </a>
          );
        }
        return key;
      });
      return (
        <List.Item key={item.id}>
          <List.Item.Meta
            avatar={<Avatar src={item.user.avatar} />}
            title={
              <span>
                <a className={styles.username}>{item.user.name}</a>
                &nbsp;
                <span className={styles.event}>{events}</span>
              </span>
            }
            description={
              <span className={styles.datetime} title={item.updatedAt}>
                {moment(item.updatedAt).fromNow()}
              </span>
            }
          />
        </List.Item>
      );
    });
  }

  render() {
    const {
      currentUser,
      currentUserLoading,
      productLoading,
      activitiesLoading,
      product: {list,productAmount},
      user: {amount},
    } = this.props;

    const pageHeaderContent =
      currentUser && Object.keys(currentUser).length ? (
        <div className={styles.pageHeaderContent}>
          <div className={styles.avatar}>
            <Avatar size="large" src={`${imgUrlPrefix}${currentUser.avatar}`} />
          </div>
          <div className={styles.content}>
            <div className={styles.contentTitle}>
              {formatMessage({ id: 'assassin.desktop.hello' })}，
              {currentUser.nickname}
              ，{formatMessage({ id: 'assassin.desktop.happy' })}！
            </div>
            <div>
              {currentUser.roleName}
            </div>
          </div>
        </div>
      ) : null;

    const extraContent = (
      <div className={styles.extraContent}>
        <div className={styles.statItem}>
          <p>{formatMessage({ id: 'assassin.desktop.internalProductAmount' })}</p>
          <p>{productAmount.inAmount}</p>
        </div>
        <div className={styles.statItem}>
          <p>{formatMessage({ id: 'assassin.desktop.mutliTenantProductAmount' })}</p>
          <p>{productAmount.tenantAmount}</p>
        </div>
        <div className={styles.statItem}>
          <p>{formatMessage({ id: 'assassin.desktop.userAmount' })}</p>
          <p>{amount.userAmount}</p>
        </div>
      </div>
    );

    return (
      <PageHeaderWrapper
        loading={currentUserLoading}
        content={pageHeaderContent}
        extraContent={extraContent}
      >
        <Row gutter={24}>
          <Col xl={24} lg={24} md={24} sm={24} xs={24}>
            <Card
              style={{ marginBottom: 24 }}
              bodyStyle={{ padding: 0 }}
              bordered={false}
              className={styles.activeCard}
              title={formatMessage({ id: 'assassin.desktop.introduction' })}
              loading={activitiesLoading}
            >
              <List loading={activitiesLoading} size="large">
                <div className={styles.activitiesList}>
                  <List.Item key="desc-1">
                    <List.Item.Meta
                      title={
                        <span>
                          <a className={styles.username}>Assassin </a>
                          <span className={styles.event}>
                            {formatMessage({ id: 'assassin.desktop.introduction.detail1' })}
                          </span>
                        </span>
                      }
                    />
                  </List.Item>
                  <List.Item key="desc-2">
                    <List.Item.Meta
                      title={
                        <span>
                          <a className={styles.username}>Assassin </a>
                          <span className={styles.event}>
                            {formatMessage({ id: 'assassin.desktop.introduction.detail2' })}
                          </span>
                        </span>
                      }
                    />
                  </List.Item>
                </div>
              </List>
            </Card>
            <Card
              className={styles.projectList}
              style={{ marginBottom: 24 }}
              title={formatMessage({ id: 'assassin.desktop.product' })}
              bordered={false}
              extra={<Link to="/system/product">{formatMessage({ id: 'assassin.desktop.allProduct' })}</Link>}
              loading={productLoading}
              bodyStyle={{ padding: 0 }}
            >
              {list.map(item => (
                <Card.Grid className={styles.projectGrid} key={item.productId}>
                  <Card bodyStyle={{ padding: 0 }} bordered={false}>
                    <Card.Meta
                      title={
                        <div className={styles.cardTitle}>
                          <Avatar size="small" src={`${imgUrlPrefix}${item.avatar}`} />
                          <Link to="/system/product">
                            {item.productName}
                          </Link>
                        </div>
                      }
                      description={item.remark}
                    />
                    <div className={styles.projectItemContent}>
                      {item.createTime && (
                        <span className={styles.datetime} title={item.updatedAt}>
                          {moment(item.createTime).fromNow()}
                        </span>
                      )}
                    </div>
                  </Card>
                </Card.Grid>
              ))}
            </Card>
          </Col>
        </Row>
      </PageHeaderWrapper>
    );
  }
}

export default Desktop;
