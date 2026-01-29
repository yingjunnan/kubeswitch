import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, Checkbox, message, Space, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined, KeyOutlined, UserOutlined } from '@ant-design/icons';
import api from '../api/client';

interface User {
  id: number;
  username: string;
  role: string;
}

interface Cluster {
  id: number;
  name: string;
}

const UserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<{ username: string; role: string } | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isPermModalOpen, setIsPermModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isAdminPasswordModalOpen, setIsAdminPasswordModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [checkedClusters, setCheckedClusters] = useState<number[]>([]);
  
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [adminPasswordForm] = Form.useForm();
  const [roleForm] = Form.useForm();

  const fetchUsers = async () => {
    const res = await api.get('/users');
    setUsers(res.data);
  };

  const fetchCurrentUser = async () => {
    try {
      const res = await api.get('/my/user');
      setCurrentUser(res.data);
    } catch (err) {
      message.error('Failed to fetch current user info');
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchCurrentUser();
  }, []);

  const handleCreate = async (values: any) => {
    try {
      await api.post('/users', values);
      message.success('User created');
      setIsCreateModalOpen(false);
      form.resetFields();
      fetchUsers();
    } catch (err) {
      message.error('Failed to create user');
    }
  };

  const openPermModal = async (user: User) => {
    setSelectedUser(user);
    // Fetch all clusters
    const cRes = await api.get('/clusters'); // Admin gets all
    setClusters(cRes.data);
    
    // Fetch user permissions
    const pRes = await api.get(`/users/${user.id}/permissions`);
    setCheckedClusters(pRes.data.cluster_ids || []);
    
    setIsPermModalOpen(true);
  };

  const handleSavePerms = async () => {
    if (!selectedUser) return;
    try {
      await api.post(`/users/${selectedUser.id}/permissions`, { cluster_ids: checkedClusters });
      message.success('Permissions updated');
      setIsPermModalOpen(false);
    } catch (err) {
      message.error('Failed to update permissions');
    }
  };

  // Password change handlers
  const handleChangePassword = async (values: any) => {
    try {
      await api.post('/my/password', values);
      message.success('Password changed successfully');
      setIsPasswordModalOpen(false);
      passwordForm.resetFields();
    } catch (err) {
      message.error('Failed to change password');
    }
  };

  const handleAdminChangePassword = async (values: any) => {
    if (!selectedUser) return;
    try {
      await api.post(`/users/${selectedUser.id}/password`, { new_password: values.new_password });
      message.success('Password changed successfully');
      setIsAdminPasswordModalOpen(false);
      adminPasswordForm.resetFields();
    } catch (err) {
      message.error('Failed to change password');
    }
  };

  const handleDeleteUser = async (user: User) => {
    try {
      await api.delete(`/users/${user.id}`);
      message.success('User deleted successfully');
      fetchUsers();
    } catch (err) {
      message.error('Failed to delete user');
    }
  };

  const handleUpdateRole = async (values: any) => {
    if (!selectedUser) return;
    try {
      await api.post(`/users/${selectedUser.id}/role`, values);
      message.success('User role updated successfully');
      setIsRoleModalOpen(false);
      roleForm.resetFields();
      fetchUsers();
    } catch (err) {
      message.error('Failed to update user role');
    }
  };

  // Modal handlers
  const openPasswordModal = () => {
    setIsPasswordModalOpen(true);
  };

  const openAdminPasswordModal = (user: User) => {
    setSelectedUser(user);
    setIsAdminPasswordModalOpen(true);
  };

  const openRoleModal = (user: User) => {
    setSelectedUser(user);
    roleForm.setFieldsValue({ role: user.role });
    setIsRoleModalOpen(true);
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Username', dataIndex: 'username', key: 'username' },
    { title: 'Role', dataIndex: 'role', key: 'role' },
    {
      title: 'Actions',
      key: 'action',
      render: (_: any, record: User) => {
        const isCurrentUser = currentUser?.username === record.username;
        const isAdmin = currentUser?.role === 'admin';
        
        return (
          <Space>
            <Button 
              size="small" 
              onClick={() => openPermModal(record)}
              icon={<UserOutlined />}
            >
              Permissions
            </Button>
            
            {isCurrentUser && (
              <Button 
                size="small" 
                type="primary"
                onClick={openPasswordModal}
                icon={<KeyOutlined />}
              >
                Change Password
              </Button>
            )}
            
            {isAdmin && !isCurrentUser && (
              <>
                <Button 
                  size="small" 
                  onClick={() => openAdminPasswordModal(record)}
                  icon={<KeyOutlined />}
                  style={{ backgroundColor: '#fa8c16', borderColor: '#fa8c16', color: 'white' }}
                >
                  Reset Password
                </Button>
                
                <Button 
                  size="small" 
                  onClick={() => openRoleModal(record)}
                  icon={<EditOutlined />}
                  style={{ backgroundColor: '#722ed1', borderColor: '#722ed1', color: 'white' }}
                >
                  Change Role
                </Button>
                
                {record.role !== 'admin' && (
                  <Popconfirm
                    title="Delete User"
                    description="Are you sure you want to delete this user?"
                    onConfirm={() => handleDeleteUser(record)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button 
                      size="small" 
                      danger
                      icon={<DeleteOutlined />}
                    >
                      Delete
                    </Button>
                  </Popconfirm>
                )}
              </>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={() => setIsCreateModalOpen(true)}>Create User</Button>
      </div>
      <Table dataSource={users} columns={columns} rowKey="id" />

      <Modal title="Create User" open={isCreateModalOpen} onCancel={() => setIsCreateModalOpen(false)} onOk={() => form.submit()}>
        <Form form={form} onFinish={handleCreate} layout="vertical">
          <Form.Item name="username" label="Username" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="password" label="Password" rules={[{ required: true }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item name="role" label="Role" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="user">User</Select.Option>
              <Select.Option value="admin">Admin</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Modal title={`Permissions for ${selectedUser?.username}`} open={isPermModalOpen} onCancel={() => setIsPermModalOpen(false)} onOk={handleSavePerms}>
        <Checkbox.Group 
          style={{ display: 'flex', flexDirection: 'column' }}
          value={checkedClusters} 
          onChange={(vals) => setCheckedClusters(vals as number[])}
        >
          {clusters.map(c => (
            <Checkbox key={c.id} value={c.id}>{c.name}</Checkbox>
          ))}
        </Checkbox.Group>
      </Modal>

      {/* Change Password Modal (for current user) */}
      <Modal 
        title="Change Password" 
        open={isPasswordModalOpen} 
        onCancel={() => setIsPasswordModalOpen(false)} 
        onOk={() => passwordForm.submit()}
      >
        <Form form={passwordForm} onFinish={handleChangePassword} layout="vertical">
          <Form.Item 
            name="old_password" 
            label="Current Password" 
            rules={[{ required: true, message: 'Please input your current password' }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item 
            name="new_password" 
            label="New Password" 
            rules={[
              { required: true, message: 'Please input your new password' },
              { min: 6, message: 'Password must be at least 6 characters' }
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item 
            name="confirm_password" 
            label="Confirm New Password"
            dependencies={['new_password']}
            rules={[
              { required: true, message: 'Please confirm your new password' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('new_password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords do not match'));
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal>

      {/* Admin Change Password Modal */}
      <Modal 
        title={`Reset Password for ${selectedUser?.username}`} 
        open={isAdminPasswordModalOpen} 
        onCancel={() => setIsAdminPasswordModalOpen(false)} 
        onOk={() => adminPasswordForm.submit()}
      >
        <Form form={adminPasswordForm} onFinish={handleAdminChangePassword} layout="vertical">
          <Form.Item 
            name="new_password" 
            label="New Password" 
            rules={[
              { required: true, message: 'Please input the new password' },
              { min: 6, message: 'Password must be at least 6 characters' }
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item 
            name="confirm_password" 
            label="Confirm New Password"
            dependencies={['new_password']}
            rules={[
              { required: true, message: 'Please confirm the new password' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('new_password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords do not match'));
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal>

      {/* Change Role Modal */}
      <Modal 
        title={`Change Role for ${selectedUser?.username}`} 
        open={isRoleModalOpen} 
        onCancel={() => setIsRoleModalOpen(false)} 
        onOk={() => roleForm.submit()}
      >
        <Form form={roleForm} onFinish={handleUpdateRole} layout="vertical">
          <Form.Item 
            name="role" 
            label="Role" 
            rules={[{ required: true, message: 'Please select a role' }]}
          >
            <Select>
              <Select.Option value="user">User</Select.Option>
              <Select.Option value="admin">Admin</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserList;
