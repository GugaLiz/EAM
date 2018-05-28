import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import Moment from 'moment';
import { Row, Col, Card, Form, Input, Select, Icon,
   Button, Dropdown, Menu, InputNumber, Switch,
    DatePicker, Modal, message, Badge, Divider,List } from 'antd';

import styles from './TagList.less';
const { TextArea } = Input;

const FormItem = Form.Item;
@Form.create()
export default class TagEdit extends PureComponent{
  state = {
    disabled:false,
  }

  render() {
    const {data, record, modalVisible, form, handleEdit, handleModalVisible } = this.props;

    const { getFieldDecorator, getFieldValue } = form;
    const okHandle = () => {
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      form.resetFields();
      this.props.handleEdit(record.key,fieldsValue);
    });
  };

const formItemLayout = {
  labelCol: {
    xs: { span: 5 },
  },
  wrapperCol: {
    xs: { span: 15 },
  },
};
  return (
    <Modal
      title="编辑标签"
      visible={modalVisible}
      onOk={okHandle}
      onCancel={() => this.props.handleEditModalVisible()}
    >
    <FormItem {...formItemLayout} label="EPC编码">
    {
      getFieldDecorator('EPCCode', {
          rules: [{
              required: true,
              message: '必须输入EPC编码'
          }, {
              validator: record.EPCCode
          }],
      })( <Input placeholder = "请输入EPC编码" / >
      )
    }
    </FormItem>

    <FormItem {...formItemLayout} label="资产编号">
    {
      getFieldDecorator('assetId', {
          rules: [{
              required: true,
              message: '必须输入资产编号'
          }, {
              validator: record.assetId
          }],
      })( <Input placeholder = "请输入资产编号" / >
      )
    }
    </FormItem>

    <FormItem {...formItemLayout} label="读写设备">
    {
      getFieldDecorator('tagReaderId', {
          rules: [{
              required: true,
              message: '必须输入读写设备'
          }, {
              validator: record.tagReaderId
          }],
      })( <Input placeholder = "请输入读写设备" / >
      )
    }
    </FormItem>

    <FormItem {...formItemLayout} label="位置">
    {
      getFieldDecorator('siteId', {
          rules: [{
              required: true,
              message: '必须输入位置'
          }, {
              validator: record.siteId
          }],
      })( <Input placeholder = "请输入位置" / >
      )
    }
    </FormItem>

    <FormItem {...formItemLayout} label="更新时间">
       {getFieldDecorator('updatedAt', {
          validator: Moment(record.updatedAt)
       })(
          <DatePicker />
       )}
    </FormItem>

    </Modal>
  );
  }
}
