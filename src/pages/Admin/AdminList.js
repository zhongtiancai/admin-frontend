import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import Link from 'umi/link';
import {
  Row,
  Col,
  Card,
  Form,
  Input,
  Select,
  Icon,
  Button,
  Dropdown,
  Menu,
  InputNumber,
  DatePicker,
  Modal,
  message,
  Badge,
  Divider,
  Steps,
  Radio,
  Checkbox,
} from 'antd';
import StandardTable from '@/components/StandardTable';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';

import styles from '@/pages/List/TableList.less';

const FormItem = Form.Item;
const { Step } = Steps;
const { TextArea } = Input;
const { Option } = Select;
const RadioGroup = Radio.Group;
const getValue = obj =>
  Object.keys(obj)
    .map(key => obj[key])
    .join(',');
const statusMap = ['error','success', ];
const status = ['禁用','启用'];



const CreateForm = Form.create()(props => {
  const { modalVisible, form, handleAdd, handleModalVisible,editColumn,roles} = props;
  const okHandle = function(){
      handleAdd(form);
  };
  return (
    <Modal
      destroyOnClose
      title="添加用户"
      visible={modalVisible}
      width={700}
      onOk={okHandle}
      onCancel={() => handleModalVisible()}
    >
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="用户名">
        {form.getFieldDecorator('username', {
          initialValue: editColumn.username,
          rules: [{ required: true, message: '请输入用户名！'}],
        })(<Input placeholder="请输入用户名" disabled = {editColumn.id}/>)}
      </FormItem>

      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="姓名">
        {form.getFieldDecorator('nickName', {
          initialValue: editColumn.nickName,
          rules: [{ required: true, message: '请输入姓名！'}],
        })(<Input placeholder="请输入姓名" />)}
      </FormItem>

      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="邮件">
        {form.getFieldDecorator('email', {
          initialValue: editColumn.email,
          rules: [{ required: true, message: '请输入邮件！'}],
        })(<Input placeholder="请输入邮件" />)}
      </FormItem>

      { editColumn.id?"":
        <FormItem labelCol={{span: 5}} wrapperCol={{span: 15}} label="密码">
          {form.getFieldDecorator('password', {
            initialValue: editColumn.password,
            rules: [{required: true, message: '请输入密码！'}],
          })(<Input.Password placeholder="请输入密码"/>)}
        </FormItem>
      }
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="选择角色">
        {form.getFieldDecorator('roles', {
          initialValue: editColumn.roles,
          rules: [{ required: true, message: '请选择角色！'}],
        })(<Checkbox.Group style={{ width: '100%' }}>
            {roles.map(role=>{
             return  <Col span={8}>
                <Checkbox value={role.id}>{role.name}</Checkbox>
              </Col>
            })}
        </Checkbox.Group>)}
      </FormItem>
    </Modal>
  );
});


/* eslint react/no-multi-comp:0 */
@connect(({ admin,role, loading }) => ({
  admin,
  role,
  loading: loading.models.admin,
}))
@Form.create()
class AdminList extends PureComponent {
  state = {
    modalVisible: false,
    expandForm: false,
    selectedRows: [],
    editColumn: {},
    roles:[],
    formValues:{}
  };

  columns = [


    {
      title: '用户名',
      dataIndex: 'username',
    },
    {
      title: '用户名字',
      dataIndex: 'nickName',
    }
    ,
    {
      title: '邮件',
      dataIndex: 'email',
    },
    {
      title: '状态',
      dataIndex: 'status',
      render(val) {
        return <Badge status={statusMap[val]} text={status[val]} />;
      },
    },
    {
      title: '操作',
      render: (text, record) => (
        <Fragment>
          <a onClick={() => this.handleUpdateModalVisible(record)}>编辑</a>
          <Divider type="vertical" />
        </Fragment>
      ),
    },
  ];

  componentDidMount() {
    const { dispatch } = this.props;
    this.doSearch();
    dispatch({
      type: 'role/all',
    })
  }

  doSearch=()=>{
    const { dispatch } = this.props;
    dispatch({
      type: 'admin/fetch',
    });
  }

  afterAdd=()=>{
    this.doSearch();
    this.handleModalVisible(false);
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
      type: 'admin/fetch',
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
      type: 'admin/fetch',
      payload: {},
    });
  };



  handleMenuClick = e => {
    const { dispatch } = this.props;
    const { selectedRows } = this.state;

    if (selectedRows.length === 0) return;
    switch (e.key) {
      case 'approval':
        dispatch({
          type: 'admin/approval',
          payload: {
            key: selectedRows.map(row => row.key),
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
  };

  handleSelectRows = rows => {
    this.setState({
      selectedRows: rows,
    });
  };

  handleSearch = e => {
    e.preventDefault();

    const { dispatch, form } = this.props;

    form.validateFields((err, fieldsValue) => {
      if (err) return;
      const values = {
        ...fieldsValue,
      };

      this.setState({
        formValues: values,
      });

      dispatch({
        type: 'admin/fetch',
        payload: values,
      });
    });
  };


  handleModalVisible = flag => {
    this.setState({
      modalVisible: !!flag,
      editColumn:{}
    });
  };

  handleUpdateModalVisible = (record) => {
      const roles = record.roleList.map(role=>role.id);
      record.roles = roles;
      this.setState({
        modalVisible: true,
        editColumn: record,
    });
  };

  handleAdd=(form)=>{
    const { dispatch } = this.props;
    const {editColumn} = this.state;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      form.resetFields();
      const data = Object.assign(editColumn,fieldsValue);
      dispatch({
        type: 'admin/add',
        payload: data,
        callback: this.afterAdd,
      });
    });
  }





  renderAdvancedForm() {
    const {
      form: { getFieldDecorator },
    } = this.props;
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label="用户姓名">
              {getFieldDecorator('nickName')(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          {/**
          <Col md={8} sm={24}>
            <FormItem label="状态">
              {getFieldDecorator('status')(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  <Option value="0">禁用</Option>
                  <Option value="1">有效</Option>
                </Select>
              )}
            </FormItem>
          </Col>
           **/}
        </Row>
        <div style={{ overflow: 'hidden' }}>
          <div style={{ marginBottom: 24 }}>
            <Button type="primary" htmlType="submit">
              查询
            </Button>
            <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
              重置
            </Button>


          </div>
        </div>
      </Form>
    );
  }

  renderForm() {
    return this.renderAdvancedForm();
  }

  render() {
    const {
      admin: { data },
      role:{list},
      loading,
    } = this.props;
    const roleList = list;
    const { selectedRows, modalVisible,editColumn,roles} = this.state;
    const menu = (
      <Menu onClick={this.handleMenuClick} selectedKeys={[]}>
        <Menu.Item key="approval">批量审批</Menu.Item>
      </Menu>
    );

    const parentMethods = {
      handleAdd: this.handleAdd,
      handleModalVisible: this.handleModalVisible,
    };

    return (
      <div>
        <PageHeaderWrapper title="用户列表">
          <Card bordered={false}>
            <div className={styles.tableList}>
              <div className={styles.tableListForm}>{this.renderForm()}</div>
              <div className={styles.tableListOperator}>
                <Button icon="plus" type="primary" onClick={() => this.handleModalVisible(true)}>
                  新建
                </Button>
                {selectedRows.length > 0 && (
                  <span>
                    <Button>批量操作</Button>
                    <Dropdown overlay={menu}>
                      <Button>
                        更多操作 <Icon type="down" />
                      </Button>
                    </Dropdown>
                  </span>
                )}
              </div>
              <StandardTable
                selectedRows={selectedRows}
                loading={loading}
                data={data}
                columns={this.columns}
                onSelectRow={this.handleSelectRows}
                onChange={this.handleStandardTableChange}
              />
            </div>
          </Card>
        </PageHeaderWrapper>
        <CreateForm modalVisible={modalVisible} editColumn={editColumn} roles={roleList} {...parentMethods}/>
      </div>
    );
  }
}

export default AdminList;
