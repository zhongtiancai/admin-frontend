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
  Tree,
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

const {TreeNode} = Tree;

const FormItem = Form.Item;
const getValue = obj =>
  Object.keys(obj)
    .map(key => obj[key])
    .join(',');
const statusMap = ['error','success', ];
const status = ['禁用','启用'];



const CreateForm = Form.create()(props => {
  const { modalVisible, form, handleAdd, handleModalVisible,editColumn,permissions,onSelect,selectedKeys} = props;
  const okHandle = function(){
      handleAdd(form);
  };
  const renderTreeNodes = function(data){
    return data.map(item => {
      if (item.children) {
        return (
          <TreeNode title={item.name} key={item.id}>
            {renderTreeNodes(item.children)}
          </TreeNode>
        );
      }
      return <TreeNode title={item.name} key={item.id} />;
    });}

  return (
    <Modal
      destroyOnClose
      title="添加角色"
      visible={modalVisible}
      width={700}
      onOk={okHandle}
      onCancel={() => handleModalVisible()}
    >
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="角色名称">
        {form.getFieldDecorator('username', {
          initialValue: editColumn.username,
          rules: [{ required: true, message: '请输入角色名称！'}],
        })(<Input placeholder="请输入角色名称" disabled = {editColumn.id}/>)}
      </FormItem>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="权限">
        <Tree
          checkable
          onSelect={onSelect}
          selectedKeys={selectedKeys}
        >
          {renderTreeNodes(permissions)}
        </Tree>
      </FormItem>
    </Modal>
  );
});


/* eslint react/no-multi-comp:0 */
@connect(({ permission,role, loading }) => ({
  permission,
  role,
  loading: loading.models.permission,
}))
@Form.create()
class RoleList extends PureComponent {
  state = {
    modalVisible: false,
    selectedRows: [],
    editColumn: {},
    formValues:{},
    selectedKeys: [],
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
      type: 'permission/all',
    })
  }

  doSearch=()=>{
    const { dispatch } = this.props;
    dispatch({
      type: 'role/fetch',
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
      type: 'role/fetch',
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
      type: 'role/fetch',
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
        type: 'role/fetch',
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
      //const roles = record.roleList.map(role=>role.id);
      //record.roles = roles;
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

  onSelect = (selectedKeys, info) => {
    console.log('onSelect', info);
    this.setState({ selectedKeys });
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
      role: { data },
      permission:{list},
      loading,
    } = this.props;
    // 开始遍历
    const parents = list.filter(item=>!item.pid);

    parents.forEach(p=>{
      const children = list.filter(item=>item.pid === p.id);
      if(children.length){
        p.children = children;
      }
    });
    const permissionList = parents;
    console.log(permissionList);
    const { selectedRows, modalVisible,editColumn,selectedKeys} = this.state;
    const menu = (
      <Menu onClick={this.handleMenuClick} selectedKeys={[]}>
        <Menu.Item key="approval">批量审批</Menu.Item>
      </Menu>
    );

    const parentMethods = {
      handleAdd: this.handleAdd,
      handleModalVisible: this.handleModalVisible,
      onSelect:this.onSelect
    };

    return (
      <div>
        <PageHeaderWrapper title="角色列表">
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
        <CreateForm
          modalVisible={modalVisible}
          editColumn={editColumn}
          permissions={permissionList}
          selectedKeys={selectedKeys}
          {...parentMethods}
        />
      </div>
    );
  }
}

export default RoleList;
