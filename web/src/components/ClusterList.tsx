import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Checkbox, message, Space, Upload } from 'antd';
import { EyeOutlined, CopyOutlined, DownloadOutlined, UploadOutlined, InboxOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
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

  // Kubeconfig Modal State
  const [isKubeconfigModalOpen, setIsKubeconfigModalOpen] = useState(false);
  const [kubeconfigContent, setKubeconfigContent] = useState('');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const [form] = Form.useForm();
  const [importForm] = Form.useForm();

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

  // Kubeconfig related functions
  const handleViewKubeconfig = async (cluster: Cluster) => {
    try {
      const res = await api.get(`/clusters/${cluster.id}/config`);
      setKubeconfigContent(res.data.kubeconfig);
      setSelectedCluster(cluster);
      setIsKubeconfigModalOpen(true);
    } catch (err) {
      message.error('Failed to fetch kubeconfig');
    }
  };

  const handleCopyKubeconfig = async (cluster: Cluster) => {
    try {
      const res = await api.get(`/clusters/${cluster.id}/config`);
      await navigator.clipboard.writeText(res.data.kubeconfig);
      message.success('Kubeconfig copied to clipboard');
    } catch (err) {
      message.error('Failed to copy kubeconfig');
    }
  };

  const handleExportKubeconfig = async (cluster: Cluster) => {
    try {
      const res = await api.get(`/clusters/${cluster.id}/config`);
      const blob = new Blob([res.data.kubeconfig], { type: 'text/yaml' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${cluster.name}-kubeconfig.yaml`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      message.success('Kubeconfig exported');
    } catch (err) {
      message.error('Failed to export kubeconfig');
    }
  };

  const handleImportKubeconfig = (cluster: Cluster) => {
    setSelectedCluster(cluster);
    setIsImportModalOpen(true);
  };

  const handleImportSubmit = async (values: any) => {
    if (!selectedCluster) return;
    try {
      await api.post(`/clusters/${selectedCluster.id}/import`, { kubeconfig: values.kubeconfig });
      message.success('Kubeconfig imported successfully');
      setIsImportModalOpen(false);
      importForm.resetFields();
    } catch (err) {
      message.error('Failed to import kubeconfig');
    }
  };

  // File upload handlers
  const handleFileUpload: UploadProps['customRequest'] = ({ file, onSuccess, onError }) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      form.setFieldsValue({ kubeconfig: content });
      onSuccess?.(content);
      message.success('File uploaded successfully');
    };
    reader.onerror = () => {
      onError?.(new Error('Failed to read file'));
      message.error('Failed to read file');
    };
    reader.readAsText(file as File);
  };

  const uploadProps: UploadProps = {
    name: 'kubeconfig',
    multiple: false,
    accept: '.yaml,.yml,.txt',
    customRequest: handleFileUpload,
    showUploadList: false,
    beforeUpload: (file) => {
      const isValidType = file.type === 'text/yaml' || file.type === 'text/plain' || 
                         file.name.endsWith('.yaml') || file.name.endsWith('.yml') || file.name.endsWith('.txt');
      if (!isValidType) {
        message.error('Please upload a valid kubeconfig file (.yaml, .yml, or .txt)');
        return false;
      }
      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        message.error('File must be smaller than 10MB');
        return false;
      }
      return true;
    },
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Description', dataIndex: 'description', key: 'description' },
    {
      title: 'Kubeconfig Actions',
      key: 'kubeconfig',
      render: (_: any, record: Cluster) => (
        <Space>
          <Button 
            type="primary" 
            icon={<EyeOutlined />} 
            size="small"
            onClick={() => handleViewKubeconfig(record)}
          >
            View
          </Button>
          <Button 
            type="default" 
            icon={<CopyOutlined />} 
            size="small"
            style={{ backgroundColor: '#52c41a', borderColor: '#52c41a', color: 'white' }}
            onClick={() => handleCopyKubeconfig(record)}
          >
            Copy
          </Button>
          <Button 
            type="default" 
            icon={<DownloadOutlined />} 
            size="small"
            style={{ backgroundColor: '#1890ff', borderColor: '#1890ff', color: 'white' }}
            onClick={() => handleExportKubeconfig(record)}
          >
            Export
          </Button>
          {role === 'admin' && (
            <Button 
              type="default" 
              icon={<UploadOutlined />} 
              size="small"
              style={{ backgroundColor: '#fa8c16', borderColor: '#fa8c16', color: 'white' }}
              onClick={() => handleImportKubeconfig(record)}
            >
              Import
            </Button>
          )}
        </Space>
      ),
    },
  ];

  if (role === 'admin') {
    columns.push({
      title: 'Admin Actions',
      key: 'admin_action',
      render: (_: any, record: Cluster) => (
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
            <Input.TextArea 
              rows={6} 
              placeholder="Paste kubeconfig content here or upload a file below..."
            />
          </Form.Item>
          <Form.Item label="Or Upload Kubeconfig File">
            <Upload.Dragger {...uploadProps}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">Click or drag kubeconfig file to this area to upload</p>
              <p className="ant-upload-hint">
                Support for .yaml, .yml, or .txt files. File size should be less than 10MB.
              </p>
            </Upload.Dragger>
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

      {/* Kubeconfig View Modal */}
      <Modal 
        title={`Kubeconfig for Cluster: ${selectedCluster?.name}`} 
        open={isKubeconfigModalOpen} 
        onCancel={() => setIsKubeconfigModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsKubeconfigModalOpen(false)}>
            Close
          </Button>,
          <Button 
            key="copy" 
            type="primary" 
            onClick={() => {
              navigator.clipboard.writeText(kubeconfigContent);
              message.success('Kubeconfig copied to clipboard');
            }}
          >
            Copy to Clipboard
          </Button>,
        ]}
        width={800}
      >
        <Input.TextArea 
          value={kubeconfigContent} 
          rows={20} 
          readOnly 
          style={{ fontFamily: 'monospace', fontSize: '12px' }}
        />
      </Modal>

      {/* Import Kubeconfig Modal */}
      <Modal 
        title={`Import Kubeconfig for Cluster: ${selectedCluster?.name}`} 
        open={isImportModalOpen} 
        onCancel={() => setIsImportModalOpen(false)} 
        onOk={() => importForm.submit()}
      >
        <Form form={importForm} onFinish={handleImportSubmit} layout="vertical">
          <Form.Item 
            name="kubeconfig" 
            label="Kubeconfig Content" 
            rules={[{ required: true, message: 'Please input kubeconfig content' }]}
          >
            <Input.TextArea 
              rows={15} 
              placeholder="Paste your kubeconfig YAML content here..."
              style={{ fontFamily: 'monospace', fontSize: '12px' }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ClusterList;
