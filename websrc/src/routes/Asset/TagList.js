import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Row, Col, Card, Form, Input, Select, Icon, Button, Dropdown, Menu, InputNumber, DatePicker, Modal, message, Badge, Divider } from 'antd';
import StandardTable from 'components/StandardTable';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import TagImport from './TagImport';
import TagEdit from './TagEdit';

import styles from './TagList.less';

const FormItem = Form.Item;
const { Option } = Select;
const getValue = obj => Object.keys(obj).map(key => obj[key]).join(',');

@connect(({ tag, loading }) => ({
  tag,
  loading: loading.models.tag,
}))
@Form.create()
export default class TableList extends PureComponent {
  state = {
    addModalVisible: false,
    editModalVisible:false,
    expandForm: false,
    selectedRows: [],
    formValues: {},
    record:[]
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'tag/fetch',
    });
  }

  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    const { dispatch } = this.props;
    const { formValues } = this.state;

    const filters = Object.keys(filtersArg).reduce((obj, key) => {
      const newObj = { ...obj };
      newObj[key] = getValue(filtersArg[key]);
      return newObj;
    }, {});

    const params = {
      currentPage: pagination.current,
      pageSize: pagination.pageSize,
      ...formValues,
      ...filters,
    };
    if (sorter.field) {
      params.sorter = `${sorter.field}_${sorter.order}`;
    }

    dispatch({
      type: 'tag/fetch',
      payload: params,
    });
  }

  handleFormReset = () => {
    const { form, dispatch } = this.props;
    form.resetFields();
    this.setState({
      formValues: {},
    });
    dispatch({
      type: 'tag/fetch',
      payload: {},
    });
  }

  toggleForm = () => {
    this.setState({
      expandForm: !this.state.expandForm,
    });
  }

  handleMenuClick = (e) => {
    const { dispatch } = this.props;
    const { selectedRows } = this.state;

    if (!selectedRows) return;

    switch (e.key) {
      case 'remove':
        dispatch({
          type: 'tag/remove',
          payload: {
            no: selectedRows.map(row => row.no).join(','),
          },
          callback: () => {
            this.setState({
              selectedRows: [],
            });
          },
        });
        break;
      default:
        break;
    }
  }

  handleSelectRows = (rows) => {
    this.setState({
      selectedRows: rows,
    });
  }

  handleSearch = (e) => {
    e.preventDefault();

    const { dispatch, form } = this.props;

    form.validateFields((err, fieldsValue) => {
      if (err) return;

      const values = {
        ...fieldsValue,
        updatedAt: fieldsValue.updatedAt && fieldsValue.updatedAt.valueOf(),
      };

      this.setState({
        formValues: values,
      });

      dispatch({
        type: 'tag/fetch',
        payload: values,
      });
    });
  }

  handleAddModalVisible = (flag) => {
    this.setState({
      addModalVisible: !!flag,
    });
  }

  handleEditModalVisible = (flag) => {
    this.setState({
      editModalVisible: !!flag
    });
  }

  handleEdit = (id,fields) => {
    this.props.dispatch({
      type:'tag/update',
      payload:{
        key:id,
        description:fields
      }
    });

    message.success('修改成功');
    this.setState({
      editModalVisible:false
    });
  }

  handleAdd = (fields) => {
    this.props.dispatch({
      type: 'tag/add',
      payload: {
        description: fields.desc,
      },
    });

    message.success('添加成功');
    this.setState({
      addModalVisible: false,
    });
  }

  handleItemEdit = (record) => {
    this.handleEditModalVisible(true);

    this.setState({
      record:record
    });
  }

  handleDelete = (selectedRows) => {
    const { dispatch } = this.props;
    const confirm = Modal.confirm;
    confirm({
      title: '确定删除选中的数据吗',
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      onOk()  {
        dispatch({
          type:'tag/remove',
          payload:{
            ids: selectedRows.map(row => row.id).join(','),
          },
        });       
      },
      onCancel() {
        //console.log('Cancel');
      },
    });    
  }

  renderSimpleForm() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label="EPC位置">
              {getFieldDecorator('EPCCode')(
                <Input placeholder="请输入" />
              )}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="位置">
              {getFieldDecorator('siteId')(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  <Option value="0">位置1</Option>
                  <Option value="1">位置2</Option>
                </Select>
              )}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <span className={styles.submitButtons}>
              <Button type="primary" htmlType="submit">查询</Button>
              <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>重置</Button>
            </span>
          </Col>
        </Row>
      </Form>
    );
  }

  renderForm() {
    return this.state.expandForm ? this.renderAdvancedForm() : this.renderSimpleForm();
  }

  render() {
    const { tag: { data }, loading } = this.props;
    const { selectedRows, addModalVisible, record, editModalVisible } = this.state;

    const columns = [
      {
        title: '编号',
        dataIndex: 'id',
      },
      {
        title: 'EPC编码',
        dataIndex: 'EPCCode',
      },{
        title:'资产编号',
        dataIndex:'assetId',
      },{
        title:'读写设备',
        dataIndex:'tagReaderId'
      },{
        title:'位置',
        dataIndex:'siteId'
      },
      {
        title: '更新时间',
        dataIndex: 'updatedAt',
        sorter: true,
        render: val => <span>{moment(val).format('YYYY-MM-DD HH:mm:ss')}</span>,
      },
      {
        title: '操作',
        render: (index,record) => (
          <Fragment>
            <a name="edit" onClick={() => this.handleItemEdit(record)}>编辑</a>
           
          </Fragment>
        ),
      },
    ];
    
    const  dataList = [
      {
        title: 'EPC编码',
        dataIndex: 'EPCCode',
        value:record.EPCCode
      },{
        title:'资产编号',
        dataIndex:'assetId',
      },{
        title:'读写设备',
        dataIndex:'tagReaderId',
        value:record.tagReaderId
      },{
        title:'位置',
        dataIndex:'siteId',
        value:record.siteId
      },
      {
        title: '更新时间',
        dataIndex: 'updatedAt',
        value:record.updatedAt
      }
    ];

    const parentMethods = {
      handleAdd: this.handleAdd,
      handleEdit:this.handleEdit,
      handleAddModalVisible: this.handleAddModalVisible,
      handleEditModalVisible:this.handleEditModalVisible,
    };

    return (
      <PageHeaderLayout>
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>
              {this.renderForm()}
            </div>
            <div className={styles.tableListOperator}>
              <Button icon="plus" type="primary" onClick={() => this.handleAddModalVisible(true)}>
                导入
              </Button>
              {
                selectedRows.length > 0 && (
                  <span>
                    <Button icon="delete" type="primary" onClick={() =>
                    this.handleDelete(selectedRows)}>删除</Button>                  
                  </span>
                )
              }
            </div>
            <StandardTable
              selectedRows={selectedRows}
              loading={loading}
              data={data}
              columns={columns}
              onSelectRow={this.handleSelectRows}
              onChange={this.handleStandardTableChange}
            />
          </div>
        </Card>
        <TagImport
          {...parentMethods}
          modalVisible={addModalVisible}
        />
        <TagEdit
          {...parentMethods}
          modalVisible={editModalVisible}
          record={record}
          data={dataList}
        />
      </PageHeaderLayout>
    );
  }
}
