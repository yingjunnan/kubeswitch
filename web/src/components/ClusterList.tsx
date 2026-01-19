import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Checkbox, message, Space } from 'antd';
import api from '../api/client';

interface Cluster {
  id: number;
  name: string;
  description: string;
}

interface User {
  id: number;
  username: string;
}

const ClusterList: React.FC<{ role: string }> = ({ role }) => {
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Permissions Modal State
  const [isPermModalOpen, setIsPermModalOpen] = useState(false);
  const [selectedCluster, setSelectedCluster] = useState<Cluster | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [checkedUsers, setCheckedUsers] = useState<number[]>([]);

  const [form] = Form.useForm();

  const fetchClusters = async () => {
    const res = await api.get('/clusters');
    setClusters(res.data);
  };

  useEffect(() => {
    fetchClusters();
  }, []);

  const handleCreate = async (values: any) => {
    try {
      await api.post('/clusters', values);
      message.success('Cluster created');
      setIsModalOpen(false);
      form.resetFields();
      fetchClusters();
    } catch (err) {
      message.error('Failed to create cluster');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/clusters/${id}`);
      message.success('Cluster deleted');
      fetchClusters();
    } catch (err) {
      message.error('Failed to delete cluster');
    }
  };

  const openPermModal = async (cluster: Cluster) => {
    setSelectedCluster(cluster);
    // Fetch all users
    const uRes = await api.get('/users');
    setUsers(uRes.data);
    
    // Fetch cluster permissions (which users have access)
    const pRes = await api.get(`/clusters/${cluster.id}/permissions`);
    setCheckedUsers(pRes.data.user_ids || []);
    
    setIsPermModalOpen(true);
  };

  const handleSavePerms = async () => {
    if (!selectedCluster) return;
    try {
      await api.post(`/clusters/${selectedCluster.id}/permissions`, { user_ids: checkedUsers });
      message.success('Permissions updated');
      setIsPermModalOpen(false);
    } catch (err) {
      message.error('Failed to update permissions');
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Description', dataIndex: 'description', key: 'description' },
  ];

  if (role === 'admin') {
    columns.push({
      title: 'Action',
      key: 'action',
      render: (_, record: Cluster) => (
        <Space>
          <Button onClick={() => openPermModal(record)}>Permissions</Button>
          <Button danger onClick={() => handleDelete(record.id)}>Delete</Button>
        </Space>
      ),
    } as any);
  }

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        {role === 'admin' && (
          <Button type="primary" onClick={() => setIsModalOpen(true)}>
            Add Cluster
          </Button>
        )}
      </div>
      <Table dataSource={clusters} columns={columns} rowKey="id" />

      <Modal title="Add Cluster" open={isModalOpen} onCancel={() => setIsModalOpen(false)} onOk={() => form.submit()}>
        <Form form={form} onFinish={handleCreate} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input />
          </Form.Item>
          <Form.Item name="kubeconfig" label="Kubeconfig (YAML Content)" rules={[{ required: true }]}>
            <Input.TextArea rows={6} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal 
        title={`Permissions for Cluster: ${selectedCluster?.name}`} 
        open={isPermModalOpen} 
        onCancel={() => setIsPermModalOpen(false)} 
        onOk={handleSavePerms}
      >
        <div style={{ marginBottom: 8 }}>Select users who can access this cluster:</div>
        <Checkbox.Group 
          style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
          value={checkedUsers} 
          onChange={(vals) => setCheckedUsers(vals as number[])}
        >
          {users.map(u => (
            <Checkbox key={u.id} value={u.id}>{u.username}</Checkbox>
          ))}
        </Checkbox.Group>
      </Modal>
    </div>
  );
};

export default ClusterList;
