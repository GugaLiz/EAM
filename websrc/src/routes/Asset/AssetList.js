import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Row, Col, Card, Form, Input, Select, Icon, Button, Dropdown, Menu, InputNumber, DatePicker, Modal, message, Badge, Divider } from 'antd';
import StandardTable from 'components/StandardTable';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import AssetImport from './AssetImport';
import AssetEdit from './AssetEdit';
import AssetDetail from './AssetDetail';

import styles from './AssetList.less';

const FormItem = Form.Item;
const { Option } = Select;
const getValue = obj => Object.keys(obj).map(key => obj[key]).join(',');

@connect(({ asset, loading }) => ({
  asset,
  loading: loading.models.asset,
}))
@Form.create()
export default class TableList extends PureComponent {
  state = {
    addModalVisible: false,
    editModalVisible: false,
    detialModalVisible:false,
    expandForm: false,
    selectedRows: [],
    formValues: {},
    editingKey:'',
    record:{}
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'asset/fetch',   
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
      type: 'asset/fetch',
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
      type: 'asset/fetch',
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
          type: 'asset/remove',
          payload: {
            id: selectedRows.map(row => row.no).join(','),
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
        type: 'asset/fetch',
        payload: values,
      });
    });
  }

  handleDetialModalVisible = (flag) => {
    this.setState({
      detailModalVisible: !!flag
    });
  }

  handleEditModalVisible = (flag) => {
    this.setState({
      editModalVisible: !!flag,
    });
  }

  handleAddModalVisible = (flag) => {
    this.setState({
      addModalVisible: !!flag,
    });
  }

  handleAdd = (fields) => {
    this.props.dispatch({
      type: 'asset/add',
      payload: {
        description: fields.desc,
      },
    });

    message.success('添加成功');
    this.setState({
      addModalVisible: false,
    });
  }

  handleItemEdit = (record) =>{
    this.handleEditModalVisible(true);

    this.setState({
      record:record
    });
  }

  handleEdit = (key,fields) => {
    this.props.dispatch({
      type:'asset/update',
      payload:{
        key:key,
        description:fields
      },
    });

    message.success('修改成功');
    this.setState({
      editModalVisible:false,
    });
  }

  //详情操作
  handleDetial = (record) => {
    this.handleDetialModalVisible(true);

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
          type:'asset/remove',
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
            <FormItem label="资产名称">
              {getFieldDecorator('name')(
                <Input placeholder="请输入" />
              )}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="状态">
              {getFieldDecorator('userState')(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  <Option value="使用中">使用中</Option>
                  <Option value="未使用">未使用</Option>
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
    const { asset : {data} , loading } = this.props;
    const { selectedRows, addModalVisible, editModalVisible, detailModalVisible, record } = this.state;
    //console.info(data, this.props);

    const parentMethods = {
      handleAdd: this.handleAdd,
      handleEdit:this.handleEdit,
      handleDetial:this.handleDetial,
      handleAddModalVisible: this.handleAddModalVisible,
      handleEditModalVisible: this.handleEditModalVisible,  
      handleDetialModalVisible:this.handleDetialModalVisible,  
    };
  const columns = [
  {
    title: '资产编号',
    dataIndex: 'Id',
  },
  {
    title: '资产名称',
    dataIndex: 'Name',
  },
  {
    title:'资产分类',
    dataIndex:'ClassName',
  },
  {
    title:'品牌',
    dataIndex:'Brand',
  },
   {
    title: '资产状态',
    dataIndex: 'UseState',
  },
  {
    title: '当前价值',
    dataIndex:'CurrentValue'
  },{
    title: '存放地点',
    dataIndex:'StorageLocation'
  },{
    title: '购入日期',
    dataIndex: 'PurchaseDate',
    sorter: true,
    render: val => <span>{moment(val).format('YYYY-MM-DD HH:mm')}</span>,
  },
  {
     title: '操作', dataIndex: '', key: 'operation',
     render: (text, record, index) => 
     <Fragment>
     <a name="edit"  onClick={() => this.handleItemEdit(record)}>编辑</a> 
     <Divider type="vertical" />
     <a name="detial" onClick={() => this.handleDetial(record)}>详细</a>
     </Fragment>
    },
];

const dataList = [
  {
    title: '资产名称',
    dataIndex:'name',
    value:record.name
  },
  {
    title: '资产分类',
    dataIndex:'className',
    value:record.className
  },
  {
    title: '资产分类编码',
    dataIndex:'classCode',
    value:record.classCode
  },
  {
    title: '机身码',
    dataIndex:'Jc',
    value:''
  },
  {
    title: '品牌',
    dataIndex:'brand',
    value:record.brand
  },
  {
    title: '型号',
    dataIndex:'Jc',
    value:''
  },
  {
    title: '配置',
    dataIndex:'007',
    value:''
  },
  {
    title: '购置日期',
    dataIndex:'purchaseDate',
    value:record.purchaseDate,
    isDate:true
  },
  {
    title: '采购价值',
    dataIndex:'007',
    value:''
  },
  {
    title: '目前价值',
    dataIndex:'currentValue',
    value:record.currentValue
  },
  {
    title: '保修期（月）',
    dataIndex:'007',
    value:''
  },
  {
    title: '供应商',
    dataIndex:'Jc',
    value:''
  },
  {
    title: '资产来源',
    dataIndex:'007',
    value:''
  },
  {
    title: '当前基站',
    dataIndex:'Jc',
    value:''
  },
  {
    title: '入网时间',
    dataIndex:'007',
    value:record.purchaseDate,
    isDate:true
  },
  {
    title: '关联标签ID',
    dataIndex:'Jc',
    value:''
  },
  {
    title: 'EPC编码',
    dataIndex:'007',
    value:''
  },
  {
    title: '更新标签时间',
    dataIndex:'Jc',
    value:record.purchaseDate,
    isDate:true
  },
  {
    title: '存放地点',
    dataIndex:'storageLocation',
    value:record.storageLocation
  },
  {
    title: '使用状态',
    dataIndex:'userState',
    value:record.userState
  },
  {
    title: '维护人员',
    dataIndex:'007',
    value:''
  },
  {
    title: '使用人',
    dataIndex:'Jc',
    value:''
  },
  {
    title: '使用部门',
    dataIndex:'007',
    value:''
  },
  {
    title: '备注',
    dataIndex:'007',
    value:''
  }
];


    return (
      <PageHeaderLayout>
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>
              {this.renderForm()}
            </div>
            <div className={styles.tableListOperator}>
              <Button icon="plus-square" type="primary" onClick={() => this.handleAddModalVisible(true)}>
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
        <AssetImport
          {...parentMethods}
          modalVisible={addModalVisible}
        />
        <AssetEdit
          {...parentMethods}
          modalVisible={editModalVisible}
          record={record}
          data={dataList}
        />
        <AssetDetail
        {...parentMethods}
        modalVisible={detailModalVisible}
        record={record}
        data={dataList}
        />
      </PageHeaderLayout>
    );
  }
}
