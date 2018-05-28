import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import Moment from 'moment';
import { Row, Col, Card, Form, Input, Select, Icon,
   Button, Dropdown, Menu, InputNumber, Switch,
    DatePicker, Modal, message, Badge, Divider,List } from 'antd';

import styles from './TagReaderList.less';
const { TextArea } = Input;

const FormItem = Form.Item;
@Form.create()
export default class TagReaderEdit extends PureComponent{
  state = {
    disabled:false,
  }

  render() {
    const {data, record, editModalVisible, form, handleEdit, handleEditModalVisible } = this.props;

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
const inputNumStyle = {
    width:'100%'
};
  return (
    <Modal
      title="编辑读卡器信息"
      visible={editModalVisible}
      onOk={okHandle}
      onCancel={() => this.props.handleEditModalVisible()}
    >
    <FormItem {...formItemLayout} label="读卡器名称">
    {
      getFieldDecorator('name', {
          rules: [{
              required: true,
              message: '必须输入读卡器名称'
          }, {
              validator: record.name
          }],
      })( <Input placeholder = "请输入读卡器名称" / >
      )
    }
    </FormItem>

    <FormItem {...formItemLayout} label="基站">
    {
      getFieldDecorator('siteId', 
         {
              validator: record.siteId
      })( <Input placeholder = "请输入基站" / >
      )
    }
    </FormItem>

    <FormItem {...formItemLayout}
            label = "在线时长"> {
                form.getFieldDecorator('onSiteTime',{                  
                    initialValue:record.onSiteTime
                })(<InputNumber placeholder = "请输入时长" style={inputNumStyle}/>
            )
            }
    </FormItem>

    <FormItem {...formItemLayout} label="类型">
    {
      getFieldDecorator('assetId', {
          rules: [{
              required: true,
              message: '必须输入类型'
          }, {
              validator: record.type
          }],
      })( <Input placeholder = "请输入类型" / >
      )
    }
    </FormItem>

    <FormItem {...formItemLayout }
    label = "备注" > {
        getFieldDecorator('memo', {
            rules: [{}],
            initialValue:record.memo
        })( <
            TextArea style = {
                { minHeight: 32 }
            }
            placeholder = "请输入备注"
            rows = { 4 }
            />
        )
    } 
    </FormItem> 

    </Modal>
  );
  }
}
