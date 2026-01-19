import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, message } from 'antd';
import api from '../api/client';

interface Cluster {
  id: number;
  name: string;
  description: string;
}

const ClusterList: React.FC<{ role: string }> = ({ role }) => {
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Description', dataIndex: 'description', key: 'description' },
  ];

  if (role === 'admin') {
    columns.push({
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button danger onClick={() => handleDelete(record.id)}>Delete</Button>
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
    </div>
  );
};

export default ClusterList;
