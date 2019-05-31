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
  const { modalVisible, form, handleAdd, handleModalVisible,editColumn,permissions,onCheck,checkedKeys} = props;
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
        {form.getFieldDecorator('name', {
          initialValue: editColumn.name,
          rules: [{ required: true, message: '请输入角色名称！'}],
        })(<Input placeholder="请输入角色名称"/>)}
      </FormItem>

      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="描述">
        {form.getFieldDecorator('description', {
          initialValue: editColumn.description,
          rules: [{ required: true, message: '描述！'}],
        })(<Input placeholder="请输入描述"/>)}
      </FormItem>

      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="分配权限">
        <Tree
          defaultExpandAll
          checkable
          checkStrictly
          onCheck={onCheck}
          checkedKeys={checkedKeys}
        >
          {renderTreeNodes(permissions)}
        </Tree>
      </FormItem>
    </Modal>
  );
});

//构建子树，有100个对象就会构建100个树，可能性能有影响
const  sonTree = function(nodeList){
    for(let i = 0; i< nodeList.length; i++){
      const node = nodeList[i];
      for(let j =0; j<nodeList.length;j++){
        const node2 = nodeList[j];
        if(node.id == node2.pid){
           if(!node.children||!node.children.length){
             node.children = [];
           }
           node.children.push(node2);
        }
      }
    }
}

const getTree = function (nodeList){
  //不改变原来的列表结构
  const nodes = nodeList.map(node=> Object.assign({},node));
  sonTree(nodes);
  return nodes.filter(node=>!node.pid)
}

/* eslint react/no-multi-comp:0 */
@connect(({ permission,role, loading }) => ({
  permission,
  role,
  loading: loading.models.role,
}))
@Form.create()
class RoleList extends PureComponent {
  state = {
    modalVisible: false,
    selectedRows: [],
    editColumn: {},
    formValues:{},
    checkedKeys: [],
  };


  columns = [


    {
      title: '角色',
      dataIndex: 'name',
    },
    {
      title: '描述',
      dataIndex: 'description',
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
      editColumn:{},
      checkedKeys:[]
    });
  };

  handleUpdateModalVisible = (record) => {
      const permissionIds = record.permissionList.map(permission=>permission.id);
      this.setState({
        modalVisible: true,
        editColumn: record,
        checkedKeys: permissionIds
    });
  };

  handleAdd=(form)=>{
    const { dispatch } = this.props;
    const {editColumn} = this.state;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      form.resetFields();
      const data = Object.assign(editColumn,fieldsValue);
      const {checkedKeys} = this.state;
      data.permissions = checkedKeys;
      dispatch({
        type: 'role/add',
        payload: data,
        callback: this.afterAdd,
      });
    });
  }

  onCheck = (checkedInfo, info) => {
    console.log(checkedInfo);
    console.log(checkedInfo.checked);
    this.setState({checkedKeys: checkedInfo.checked});
  }



  renderAdvancedForm() {
    const {
      form: { getFieldDecorator },
    } = this.props;
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label="角色名">
              {getFieldDecorator('name')(<Input placeholder="请输入" />)}
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
    const permissionList = getTree(list);
    console.log(permissionList);
    //由于暂时不考虑多层结构，所有不写树结构方法

    const { selectedRows, modalVisible,editColumn,checkedKeys} = this.state;
    const menu = (
      <Menu onClick={this.handleMenuClick} selectedKeys={[]}>
        <Menu.Item key="approval">批量审批</Menu.Item>
      </Menu>
    );

    const parentMethods = {
      handleAdd: this.handleAdd,
      handleModalVisible: this.handleModalVisible,
      onCheck:this.onCheck
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
          checkedKeys={checkedKeys}
          {...parentMethods}
        />
      </div>
    );
  }
}

export default RoleList;
