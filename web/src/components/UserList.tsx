import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, Checkbox, message } from 'antd';
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
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isPermModalOpen, setIsPermModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [checkedClusters, setCheckedClusters] = useState<number[]>([]);
  const [form] = Form.useForm();

  const fetchUsers = async () => {
    const res = await api.get('/users');
    setUsers(res.data);
  };

  useEffect(() => {
    fetchUsers();
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

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Username', dataIndex: 'username', key: 'username' },
    { title: 'Role', dataIndex: 'role', key: 'role' },
    {
      title: 'Action',
      key: 'action',
      render: (_, record: User) => (
        <Button onClick={() => openPermModal(record)}>Permissions</Button>
      ),
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
    </div>
  );
};

export default UserList;
