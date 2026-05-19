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
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { imageLogApi } from '@/api/imageLog';
import type { ImageGenLog } from '@/types/imageLog';

const { Text } = Typography;

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
        width={700}
      >
        {selectedLog && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="ID">{selectedLog.id}</Descriptions.Item>
            <Descriptions.Item label="模型">{selectedLog.model}</Descriptions.Item>
            <Descriptions.Item label="操作">{selectedLog.operation}</Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={selectedLog.status === 'success' ? 'success' : 'error'}>
                {selectedLog.status}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Prompt">{selectedLog.request_prompt || '-'}</Descriptions.Item>
            <Descriptions.Item label="请求参数">
              <pre style={{ maxHeight: 200, overflow: 'auto' }}>
                {JSON.stringify(selectedLog.request_params, null, 2)}
              </pre>
            </Descriptions.Item>
            <Descriptions.Item label="响应数据">
              {selectedLog.response_data ? (
                <pre style={{ maxHeight: 200, overflow: 'auto' }}>
                  {JSON.stringify(selectedLog.response_data, null, 2)}
                </pre>
              ) : (
                '-'
              )}
            </Descriptions.Item>
            {selectedLog.error_message && (
              <Descriptions.Item label="错误信息">
                <Text type="danger">{selectedLog.error_message}</Text>
              </Descriptions.Item>
            )}
            <Descriptions.Item label="创建时间">
              {new Date(selectedLog.created_at).toLocaleString('zh-CN')}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
}
