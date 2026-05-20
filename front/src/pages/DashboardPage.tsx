import { Row, Col, Card } from 'antd'
import { BarChartOutlined, HistoryOutlined, PictureOutlined } from '@ant-design/icons'
import styles from '../styles/pages.module.css'

const stats = [
  { label: '今日调用', value: '1,234', change: '+12%', positive: true },
  { label: '活跃模型', value: '3', change: '+1', positive: true },
  { label: '成功率', value: '98.5%', change: '-0.5%', positive: false },
  { label: '总调用量', value: '45,678', change: '+2,345', positive: true },
]

const quickActions = [
  { icon: <PictureOutlined />, title: '生成图片', desc: '使用 AI 模型生成图片', path: '/images/generate' },
  { icon: <HistoryOutlined />, title: '调用历史', desc: '查看最近的 API 调用记录', path: '/logs' },
  { icon: <BarChartOutlined />, title: '模型管理', desc: '配置和管理 AI 模型', path: '/models' },
]

export default function DashboardPage() {
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
            <div className={styles.statCard}>
              <div className={styles.statLabel}>{stat.label}</div>
              <div className={styles.statValue}>{stat.value}</div>
              <div className={`${styles.statChange} ${stat.positive ? styles.statChangePositive : styles.statChangeNegative}`}>
                {stat.change}
              </div>
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
  )
}
