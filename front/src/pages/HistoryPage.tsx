import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Table,
  Card,
  Select,
  Space,
  Tag,
  Modal,
  Descriptions,
  Typography,
  Spin,
  Alert,
  Row,
  Col,
  Image,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { imageLogApi } from '@/api/imageLog';
import type { ImageGenLog } from '@/types/imageLog';

const { Text, Paragraph } = Typography;

interface ImageResult {
  image?: string;
  url?: string;
  index?: number;
}

export default function HistoryPage() {
  const [filterModel, setFilterModel] = useState<string>('');
  const [filterOperation, setFilterOperation] = useState<string>('');
  const [selectedLog, setSelectedLog] = useState<ImageGenLog | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);

  // 获取日志列表
  const { data, isLoading, error } = useQuery({
    queryKey: ['imageLogs', filterModel, filterOperation],
    queryFn: async () => {
      const res = await imageLogApi.list({
        model: filterModel || undefined,
        operation: filterOperation || undefined,
        limit: 50,
      });
      return res.data.data;
    },
  });

  // 获取去重的模型列表
  const { data: modelsData } = useQuery({
    queryKey: ['imageLogModels'],
    queryFn: async () => {
      const res = await imageLogApi.getModels();
      return res.data.data || [];
    },
  });

  const handleViewDetail = (log: ImageGenLog) => {
    setSelectedLog(log);
    setDetailVisible(true);
  };

  const columns: ColumnsType<ImageGenLog> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 70,
    },
    {
      title: '模型',
      dataIndex: 'model',
      key: 'model',
      width: 140,
    },
    {
      title: '操作',
      dataIndex: 'operation',
      key: 'operation',
      width: 100,
      render: (op: string) => {
        const colorMap: Record<string, string> = {
          generate: 'blue',
          edit: 'green',
          variation: 'purple',
        };
        return <Tag color={colorMap[op] || 'default'} style={{ borderRadius: 6 }}>{op}</Tag>;
      },
    },
    {
      title: 'Prompt',
      dataIndex: 'request_prompt',
      key: 'request_prompt',
      ellipsis: true,
      render: (text: string) => (text ? text.substring(0, 60) + (text.length > 60 ? '...' : '') : '-'),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 90,
      render: (status: string) => (
        <Tag
          color={status === 'success' ? 'success' : 'error'}
          style={{ borderRadius: 6 }}
        >
          {status === 'success' ? '成功' : '失败'}
        </Tag>
      ),
    },
    {
      title: '耗时',
      dataIndex: 'duration_ms',
      key: 'duration_ms',
      width: 90,
      render: (ms: number) => ms ? `${ms}ms` : '-',
    },
    {
      title: 'Input',
      dataIndex: 'input_tokens',
      key: 'input_tokens',
      width: 80,
      render: (t: number) => t ? t.toLocaleString() : '-',
    },
    {
      title: 'Output',
      dataIndex: 'output_tokens',
      key: 'output_tokens',
      width: 80,
      render: (t: number) => t ? t.toLocaleString() : '-',
    },
    {
      title: 'Total',
      dataIndex: 'total_tokens',
      key: 'total_tokens',
      width: 90,
      render: (t: number) => t ? t.toLocaleString() : '-',
    },
    {
      title: '时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 170,
      render: (time: string) => new Date(time).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <a onClick={() => handleViewDetail(record)}>查看详情</a>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>
          调用历史
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', margin: 0, fontSize: 14 }}>
          查看所有 API 调用记录和详情
        </p>
      </div>

      <Card style={{ borderRadius: 16 }} bodyStyle={{ padding: 0 }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--color-border)' }}>
          <Space>
            <Select
              placeholder="筛选模型"
              allowClear
              style={{ width: 180 }}
              value={filterModel || undefined}
              onChange={(v) => setFilterModel(v || '')}
            >
              {modelsData?.map((model) => (
                <Select.Option key={model} value={model}>
                  {model}
                </Select.Option>
              ))}
            </Select>
            <Select
              placeholder="筛选操作"
              allowClear
              style={{ width: 120 }}
              value={filterOperation || undefined}
              onChange={(v) => setFilterOperation(v || '')}
            >
              <Select.Option value="generate">生成</Select.Option>
              <Select.Option value="edit">编辑</Select.Option>
              <Select.Option value="variation">变体</Select.Option>
            </Select>
          </Space>
        </div>

        {isLoading && (
          <div style={{ textAlign: 'center', padding: 48 }}>
            <Spin size="large" />
          </div>
        )}

        {error && (
          <div style={{ padding: 24 }}>
            <Alert message="加载失败" description={(error as Error).message} type="error" showIcon />
          </div>
        )}

        {!isLoading && !error && (
          <Table
            columns={columns}
            dataSource={data?.data}
            rowKey="id"
            pagination={{
              total: data?.total,
              pageSize: 50,
              showTotal: (total) => `共 ${total} 条`,
              style: { padding: '16px 24px' },
            }}
            style={{ borderRadius: 0 }}
          />
        )}
      </Card>

      <Modal
        title="调用详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={800}
        styles={{ body: { padding: 24 } }}
      >
        {selectedLog && (
          <>
            <Descriptions
              column={2}
              bordered
              size="small"
              style={{ borderRadius: 12, overflow: 'hidden' }}
              labelStyle={{ background: 'var(--color-bg)', fontWeight: 500 }}
            >
              <Descriptions.Item label="ID">{selectedLog.id}</Descriptions.Item>
              <Descriptions.Item label="模型">{selectedLog.model}</Descriptions.Item>
              <Descriptions.Item label="操作">
                <Tag color={
                  selectedLog.operation === 'generate' ? 'blue' :
                  selectedLog.operation === 'edit' ? 'green' : 'purple'
                }>
                  {selectedLog.operation}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={selectedLog.status === 'success' ? 'success' : 'error'}>
                  {selectedLog.status === 'success' ? '成功' : '失败'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="耗时">{selectedLog.duration_ms}ms</Descriptions.Item>
              <Descriptions.Item label="Token 用量">
                <Space size="middle">
                  <Text>In: {selectedLog.input_tokens?.toLocaleString() || '-'}</Text>
                  <Text>Out: {selectedLog.output_tokens?.toLocaleString() || '-'}</Text>
                  <Text strong>Total: {selectedLog.total_tokens?.toLocaleString() || '-'}</Text>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="创建时间" span={2}>
                {new Date(selectedLog.created_at).toLocaleString('zh-CN')}
              </Descriptions.Item>
            </Descriptions>

            <Card title="Prompt" size="small" style={{ marginTop: 16, borderRadius: 12 }} headStyle={{ fontWeight: 600 }}>
              <Paragraph>{selectedLog.request_prompt || '-'}</Paragraph>
            </Card>

            <Card title="请求参数" size="small" style={{ marginTop: 16, borderRadius: 12 }} headStyle={{ fontWeight: 600 }}>
              {(() => {
                const params = selectedLog.request_params;
                if (!params || (typeof params === 'string' && params === '{}')) {
                  return <Text type="secondary">无</Text>;
                }
                const paramsObj = typeof params === 'string' ? JSON.parse(params) : params;
                return (
                  <Descriptions column={2} size="small" colon={false}>
                    {Object.entries(paramsObj).map(([key, value]) => (
                      <Descriptions.Item key={key} label={key}>
                        {key === 'user_image_urls' && Array.isArray(value) ? (
                          <Space direction="vertical" size={0}>
                            {value.map((url, i) => (
                              <Text key={i} style={{ fontSize: 12 }} copyable={{ text: url as string }}>
                                {String(url).substring(0, 50)}...
                              </Text>
                            ))}
                          </Space>
                        ) : key === 'mask_url' && value ? (
                          <Text style={{ fontSize: 12 }} copyable={{ text: value as string }}>
                            {String(value).substring(0, 50)}...
                          </Text>
                        ) : (
                          <Text style={{ fontSize: 12 }}>{String(value)}</Text>
                        )}
                      </Descriptions.Item>
                    ))}
                  </Descriptions>
                );
              })()}
            </Card>

            <Card title="生成的图片" size="small" style={{ marginTop: 16, borderRadius: 12 }} headStyle={{ fontWeight: 600 }}>
              {selectedLog.response_data ? (() => {
                const images: ImageResult[] = typeof selectedLog.response_data === 'string'
                  ? JSON.parse(selectedLog.response_data)
                  : selectedLog.response_data;
                if (!images || images.length === 0) return <Text type="secondary">无图片</Text>;
                return (
                  <Row gutter={[12, 12]}>
                    {images.map((img, idx) => (
                      <Col span={8} key={idx}>
                        {img.image ? (
                          <Image
                            src={`data:image/png;base64,${img.image}`}
                            alt={`生成图片 ${idx + 1}`}
                            style={{ width: '100%', height: 150, objectFit: 'cover', borderRadius: 8 }}
                          />
                        ) : img.url ? (
                          <Image
                            src={img.url}
                            alt={`生成图片 ${idx + 1}`}
                            style={{ width: '100%', height: 150, objectFit: 'cover', borderRadius: 8 }}
                          />
                        ) : null}
                      </Col>
                    ))}
                  </Row>
                );
              })() : <Text type="secondary">无响应数据</Text>}
            </Card>

            {selectedLog.error_message && (
              <Card title="错误信息" size="small" style={{ marginTop: 16, borderRadius: 12 }} headStyle={{ fontWeight: 600 }}>
                <Text type="danger">{selectedLog.error_message}</Text>
              </Card>
            )}
          </>
        )}
      </Modal>
    </div>
  );
}
