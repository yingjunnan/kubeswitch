import React, { useEffect, useState } from 'react';
import { Layout, Menu, Button, theme } from 'antd';
import { LogoutOutlined, ClusterOutlined, UserOutlined, FileTextOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import ClusterList from '../components/ClusterList';
import UserList from '../components/UserList';
import AuditList from '../components/AuditList';
import api from '../api/client';

const { Header, Content, Sider } = Layout;

const Dashboard: React.FC = () => {
  const [role, setRole] = useState('');
  const [selectedKey, setSelectedKey] = useState('1');
  const navigate = useNavigate();
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  useEffect(() => {
    const storedRole = localStorage.getItem('role');
    if (!storedRole) {
      navigate('/login');
    } else {
      setRole(storedRole);
    }
  }, [navigate]);

  const handleLogout = async () => {
    await api.post('/logout');
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  const menuItems = [
    { key: '1', icon: <ClusterOutlined />, label: 'Clusters' },
  ];

  if (role === 'admin') {
    menuItems.push(
      { key: '2', icon: <UserOutlined />, label: 'Users' },
      { key: '3', icon: <FileTextOutlined />, label: 'Audit Logs' }
    );
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible>
        <div style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', borderRadius: '6px' }}>
          KubeSwitch
        </div>
        <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline" items={menuItems} onClick={(e) => setSelectedKey(e.key)} />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', paddingRight: 20 }}>
          <Button icon={<LogoutOutlined />} onClick={handleLogout}>Logout</Button>
        </Header>
        <Content style={{ margin: '16px' }}>
          <div style={{ padding: 24, minHeight: 360, background: colorBgContainer }}>
            {selectedKey === '1' && <ClusterList role={role} />}
            {selectedKey === '2' && role === 'admin' && <UserList />}
            {selectedKey === '3' && role === 'admin' && <AuditList />}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Dashboard;
