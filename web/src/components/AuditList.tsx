import React, { useEffect, useState } from 'react';
import { Table } from 'antd';
import api from '../api/client';
import dayjs from 'dayjs';

interface AuditLog {
  id: number;
  user: { username: string };
  action: string;
  detail: string;
  ip_address: string;
  created_at: string;
}

const AuditList: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    const fetchLogs = async () => {
      const res = await api.get('/audit');
      setLogs(res.data);
    };
    fetchLogs();
  }, []);

  const columns = [
    { title: 'Time', dataIndex: 'created_at', key: 'created_at', render: (text: string) => dayjs(text).format('YYYY-MM-DD HH:mm:ss') },
    { title: 'User', dataIndex: ['user', 'username'], key: 'user' },
    { title: 'Action', dataIndex: 'action', key: 'action' },
    { title: 'Detail', dataIndex: 'detail', key: 'detail' },
    { title: 'IP', dataIndex: 'ip_address', key: 'ip' },
  ];

  return <Table dataSource={logs} columns={columns} rowKey="id" />;
};

export default AuditList;
