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

  const handleViewDetail = (log: ImageGenLog) => {
    setSelectedLog(log);
    setDetailVisible(true);
  };

  const columns: ColumnsType<ImageGenLog> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '模型',
      dataIndex: 'model',
      key: 'model',
      width: 150,
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
        return <Tag color={colorMap[op] || 'default'}>{op}</Tag>;
      },
    },
    {
      title: 'Prompt',
      dataIndex: 'request_prompt',
      key: 'request_prompt',
      ellipsis: true,
      render: (text: string) => (text ? text.substring(0, 50) + (text.length > 50 ? '...' : '') : '-'),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={status === 'success' ? 'success' : 'error'}>{status}</Tag>
      ),
    },
    {
      title: '耗时',
      dataIndex: 'duration_ms',
      key: 'duration_ms',
      width: 100,
      render: (ms: number) => ms ? `${ms}ms` : '-',
    },
    {
      title: '时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
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
    <div style={{ padding: 24 }}>
      <h1 style={{ marginBottom: 24 }}>调用历史</h1>

      <Card>
        <Space style={{ marginBottom: 16 }}>
          <Select
            placeholder="筛选模型"
            allowClear
            style={{ width: 200 }}
            value={filterModel || undefined}
            onChange={(v) => setFilterModel(v || '')}
          >
            {data?.data?.map((log: ImageGenLog) => (
              <Select.Option key={log.model} value={log.model}>
                {log.model}
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

        {isLoading && (
          <div style={{ textAlign: 'center', padding: 48 }}>
            <Spin size="large" />
          </div>
        )}

        {error && (
          <Alert message="加载失败" description={(error as Error).message} type="error" showIcon />
        )}

        {!isLoading && !error && (
          <>
            <Table
              columns={columns}
              dataSource={data?.data}
              rowKey="id"
              pagination={{
                total: data?.total,
                pageSize: 50,
                showTotal: (total) => `共 ${total} 条`,
              }}
            />
          </>
        )}
      </Card>

      <Modal
        title="调用详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={800}
      >
        {selectedLog && (
          <>
            <Descriptions column={2} bordered size="small">
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
                  {selectedLog.status}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="创建时间" span={2}>
                {new Date(selectedLog.created_at).toLocaleString('zh-CN')}
              </Descriptions.Item>
            </Descriptions>

            <Card title="Prompt" size="small" style={{ marginTop: 16 }}>
              <Paragraph>{selectedLog.request_prompt || '-'}</Paragraph>
            </Card>

            <Card title="请求参数" size="small" style={{ marginTop: 16 }}>
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

            <Card title="生成的图片" size="small" style={{ marginTop: 16 }}>
              {selectedLog.response_data ? (() => {
                const images: ImageResult[] = typeof selectedLog.response_data === 'string'
                  ? JSON.parse(selectedLog.response_data)
                  : selectedLog.response_data;
                if (!images || images.length === 0) return <Text type="secondary">无图片</Text>;
                return (
                  <Row gutter={[8, 8]}>
                    {images.map((img, idx) => (
                      <Col span={8} key={idx}>
                        {img.image ? (
                          <Image
                            src={`data:image/png;base64,${img.image}`}
                            alt={`生成图片 ${idx + 1}`}
                            style={{ width: '100%', height: 150, objectFit: 'cover' }}
                          />
                        ) : img.url ? (
                          <Image
                            src={img.url}
                            alt={`生成图片 ${idx + 1}`}
                            style={{ width: '100%', height: 150, objectFit: 'cover' }}
                          />
                        ) : null}
                      </Col>
                    ))}
                  </Row>
                );
              })() : <Text type="secondary">无响应数据</Text>}
            </Card>

            {selectedLog.error_message && (
              <Card title="错误信息" size="small" style={{ marginTop: 16 }}>
                <Text type="danger">{selectedLog.error_message}</Text>
              </Card>
            )}
          </>
        )}
      </Modal>
    </div>
  );
}
