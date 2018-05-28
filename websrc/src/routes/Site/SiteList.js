import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Row, Col, Card, Form, Input, Select, Icon, Button, Dropdown, Menu, InputNumber, DatePicker, Modal, message, Badge, Divider } from 'antd';
import StandardTable from 'components/StandardTable';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import SiteAdd from './SiteAdd';
import SiteEdit from './SiteEdit';

import styles from './SiteList.less';

const FormItem = Form.Item;
const { Option } = Select;
const getValue = obj => Object.keys(obj).map(key => obj[key]).join(',');
// const roleMap = ['admin', 'workers'];
// const role = ['管理员', '维护人员'];

@connect(({ site, loading }) => ({
  site,
  loading: loading.models.site,
}))
@Form.create()
export default class TableList extends PureComponent {
  state = {
    addModalVisible: false,
    editModalVisible:false,
    expandForm: false,
    selectedRows: [],
    formValues: {},
    record:{}
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'site/fetch',
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
      type: 'site/fetch',
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
      type: 'site/fetch',
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
          type: 'site/remove',
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
      console.log(values)

      dispatch({
        type: 'site/fetch',
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
      editModalVisible: !!flag,
    });
  }

  handleItemEdit = (record) =>{
    this.handleEditModalVisible(true);

    this.setState({
      record:record
    });
  }

  handleAdd = (fields) => {
    this.props.dispatch({
      //type: 'rule/add',
      type:'site/add',
      payload: {
        description: fields.desc,
      },     
    });

    message.success('添加成功');
    this.setState({
      addModalVisible: false,
    });   
  }

  handleEdit = (Id,fields) => {
    this.props.dispatch({
      type:'site/update',
      payload:{
        Id:Id,
        description:fields,
      },
    });
    message.success('修改成功');
    this.setState({
       editModalVisible:false,
     });
  }

  handleDelete = (selectedRows) => {
    const { dispatch } = this.props;
    const confirm = Modal.confirm;
    confirm({
      title: '确定删除选中的数据吗',
      //content: 'Some descriptions',
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      onOk()  {
        dispatch({
          type:'site/remove',
          payload:{
            ids: selectedRows.map(row => row.id).join(','),
          },
        });
        console.log(selectedRows.map(row => row.id).join(','))
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
            <FormItem label="基站名称">
              {getFieldDecorator('name')(
                <Input placeholder="请输入" />
              )}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="省份">
              {getFieldDecorator('role')(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  <Option value="0">广东</Option>
                  <Option value="1">江苏</Option>
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
    return this.renderSimpleForm();
  }

  render() {
    const { site: { data }, loading } = this.props;
    const { selectedRows, addModalVisible,editModalVisible, record } = this.state;
    const menu = (
      <Menu onClick={this.handleMenuClick} selectedKeys={[]}>
        <Menu.Item key="remove">禁用</Menu.Item>
      </Menu>
    );

    const parentMethods = {
      handleAdd: this.handleAdd,
      handleEdit:this.handleEdit,
      handleAddModalVisible: this.handleAddModalVisible,
      handleEditModalVisible: this.handleEditModalVisible,
    };
  const columns = [
  {
    title: '省份',
    dataIndex: 'province',
  },
  {
    title: '城市',
    dataIndex: 'city',
    render: text => {
      if(text==="ADMIN")
      {
        return "管理员"
      }
      return "用户"
    },
  },
  {
    title:'地区',
    dataIndex:'district'
  },
   {
    title: '基站名称',
    dataIndex: 'name',   
  },
  {
    title: '地址',
    dataIndex: 'address',
  },
  {
    title:'经度',
    dataIndex:'longitude',
  },
  {
    title:'纬度',
    dataIndex:'latitude'
  },
  {
    title:'创建时间',
    dataIndex:'createTime',
  },
  {
    title:'创建者',
    dataIndex:'createUserId'
  },
  {
    title: '操作', dataIndex: '', key: 'operation',
    render: (text, record, index) => 
    <a name="edit" onClick={() => this.handleItemEdit(record)}>编辑</a> },
];

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
              rowKey = {rec=>rec.Id}
              selectedRows={selectedRows}
              loading={loading}
              data={data}
              columns={columns}
              onSelectRow={this.handleSelectRows}
              onChange={this.handleStandardTableChange}
            />
          </div>
        </Card>
        <SiteAdd
          {...parentMethods}
          modalVisible={addModalVisible}
        />   
        <SiteEdit
        {...parentMethods}
        modalVisible={editModalVisible}
        record = {record}   
        />  
      </PageHeaderLayout>
    );
  }
}
