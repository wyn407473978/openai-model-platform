import { useQuery } from '@tanstack/react-query';
import { Row, Col, Card } from 'antd';
import { BarChartOutlined, HistoryOutlined, PictureOutlined } from '@ant-design/icons';
import { imageLogApi } from '@/api/imageLog';
import styles from '../styles/pages.module.css';

const quickActions = [
  { icon: <PictureOutlined />, title: '生成图片', desc: '使用 AI 模型生成图片', path: '/images/generate' },
  { icon: <HistoryOutlined />, title: '调用历史', desc: '查看最近的 API 调用记录', path: '/logs' },
  { icon: <BarChartOutlined />, title: '模型管理', desc: '配置和管理 AI 模型', path: '/models' },
];

export default function DashboardPage() {
  const { data: statsData, isLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: async () => {
      const res = await imageLogApi.getStats();
      return res.data.data;
    },
  });

  const formatNumber = (n: number) => {
    if (n >= 1000000) {
      return (n / 1000000).toFixed(1) + 'M';
    }
    if (n >= 1000) {
      return (n / 1000).toFixed(1) + 'K';
    }
    return n.toString();
  };

  const formatPercent = (n: number) => {
    return n.toFixed(1) + '%';
  };

  const stats = [
    {
      label: '今日调用',
      value: formatNumber(statsData?.today_calls || 0),
      change: '',
      positive: true,
    },
    {
      label: '活跃模型',
      value: statsData?.active_models?.toString() || '0',
      change: '',
      positive: true,
    },
    {
      label: '成功率',
      value: formatPercent(statsData?.success_rate || 0),
      change: '',
      positive: (statsData?.success_rate || 0) >= 90,
    },
    {
      label: '总调用量',
      value: formatNumber(statsData?.total_calls || 0),
      change: '',
      positive: true,
    },
  ];

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Dashboard</h1>
        <p className={styles.pageDescription}>欢迎使用 AI Model Platform</p>
      </div>

      {/* Stats */}
      <Row gutter={[20, 20]} style={{ marginBottom: 32 }}>
        {stats.map((stat, i) => (
          <Col span={6} key={i}>
            <div className={styles.statCard} style={{ opacity: isLoading ? 0.6 : 1 }}>
              <div className={styles.statLabel}>{stat.label}</div>
              <div className={styles.statValue}>{stat.value}</div>
            </div>
          </Col>
        ))}
      </Row>

      {/* Quick Actions */}
      <Card
        title="快捷操作"
        className={styles.card}
        headStyle={{ borderBottom: '1px solid var(--color-border)', padding: '16px 24px' }}
        bodyStyle={{ padding: 0 }}
      >
        <Row>
          {quickActions.map((action, i) => (
            <Col span={8} key={i}>
              <a
                href={action.path}
                style={{
                  display: 'block',
                  padding: '24px',
                  borderRight: i < quickActions.length - 1 ? '1px solid var(--color-border)' : 'none',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ fontSize: 32, marginBottom: 12, color: 'var(--color-primary)' }}>
                  {action.icon}
                </div>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>{action.title}</div>
                <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{action.desc}</div>
              </a>
            </Col>
          ))}
        </Row>
      </Card>
    </div>
  );
}
