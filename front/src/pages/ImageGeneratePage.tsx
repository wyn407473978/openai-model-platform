import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Form,
  Select,
  Input,
  Button,
  Card,
  Row,
  Col,
  Spin,
  message,
  Space,
  Radio,
  InputNumber,
  Slider,
  Alert,
  Image,
} from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { imageModelApi } from '@/api/admin/imageModel';
import { imageApi } from '@/api/image';
import type { ImageModel, ModelParameter } from '@/types/image';
import type { ImageGenerateRequest, ImageResult } from '@/types/imageGen';

const { TextArea } = Input;

export default function ImageGeneratePage() {
  const [form] = Form.useForm();
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [parameters, setParameters] = useState<ModelParameter[]>([]);
  const [generatedImages, setGeneratedImages] = useState<ImageResult[]>([]);
  const [loading, setLoading] = useState(false);

  // 获取启用的模型列表
  const { data: modelsData, isLoading: modelsLoading } = useQuery({
    queryKey: ['enabledModels'],
    queryFn: async () => {
      const res = await imageModelApi.listEnabled();
      return res.data.data as ImageModel[];
    },
  });

  // 获取模型参数配置
  const { refetch: fetchParameters } = useQuery({
    queryKey: ['modelParameters', selectedModel],
    queryFn: async () => {
      if (!selectedModel) return [];
      const res = await imageModelApi.getParameters(selectedModel);
      return res.data.data as ModelParameter[];
    },
    enabled: false,
  });

  const handleModelChange = async (modelId: string) => {
    setSelectedModel(modelId);
    setGeneratedImages([]);

    // 获取该模型的参数配置
    const result = await fetchParameters();
    if (result.data) {
      // 按 param_order 排序
      const sortedParams = [...result.data].sort((a, b) => a.param_order - b.param_order);
      setParameters(sortedParams);
    }
  };

  const handleGenerate = async (values: Record<string, unknown>) => {
    setLoading(true);
    try {
      const request: ImageGenerateRequest = {
        model: selectedModel,
        prompt: values.prompt as string,
      };

      // 只添加非空的参数
      if (values.n) request.n = values.n as number;
      if (values.size) request.size = values.size as string;
      if (values.quality) request.quality = values.quality as string;
      if (values.output_format) request.output_format = values.output_format as string;
      if (values.background) request.background = values.background as string;

      const res = await imageApi.generate(request);
      if (res.data.data) {
        setGeneratedImages(res.data.data.data || []);
        message.success('图片生成成功！');
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      message.error(err.response?.data?.error || '生成失败');
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = (img: ImageResult, index: number) => {
    if (img.image) {
      const link = document.createElement('a');
      link.href = `data:image/png;base64,${img.image}`;
      link.download = `generated-image-${index + 1}.png`;
      link.click();
    }
  };

  const renderParameterInput = (param: ModelParameter) => {
    const rules = param.is_required
      ? [{ required: true, message: `请输入${param.param_label}` }]
      : [];

    switch (param.param_type) {
      case 'enum':
        return (
          <Form.Item
            key={param.param_key}
            name={param.param_key}
            label={param.param_label}
            rules={rules}
          >
            <Radio.Group>
              <Space direction="vertical">
                {param.enum_values
                  ?.sort((a, b) => a.enum_order - b.enum_order)
                  .map((enumVal) => (
                    <Radio key={enumVal.enum_value} value={enumVal.enum_value}>
                      {enumVal.enum_label}
                    </Radio>
                  ))}
              </Space>
            </Radio.Group>
          </Form.Item>
        );

      case 'boolean':
        return (
          <Form.Item
            key={param.param_key}
            name={param.param_key}
            label={param.param_label}
            valuePropName="checked"
          >
            <Select
              options={[
                { label: '是', value: 'true' },
                { label: '否', value: 'false' },
              ]}
            />
          </Form.Item>
        );

      case 'number':
        return (
          <Form.Item
            key={param.param_key}
            name={param.param_key}
            label={param.param_label}
            rules={rules}
          >
            <InputNumber min={1} max={10} style={{ width: '100%' }} />
          </Form.Item>
        );

      case 'string':
      default:
        return (
          <Form.Item
            key={param.param_key}
            name={param.param_key}
            label={param.param_label}
            rules={rules}
          >
            <Input />
          </Form.Item>
        );
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ marginBottom: 24 }}>图片生成</h1>

      <Row gutter={24}>
        {/* 左侧：参数表单 */}
        <Col span={12}>
          <Card title="生成参数" loading={modelsLoading}>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleGenerate}
              initialValues={{ n: 1 }}
            >
              <Form.Item
                name="model"
                label="选择模型"
                rules={[{ required: true, message: '请选择模型' }]}
              >
                <Select
                  placeholder="请选择模型"
                  onChange={handleModelChange}
                  loading={modelsLoading}
                >
                  {modelsData?.map((model) => (
                    <Select.Option key={model.model_id} value={model.model_id}>
                      <div>
                        <div>{model.name}</div>
                        {model.description && (
                          <div style={{ fontSize: 12, color: '#999' }}>
                            {model.description}
                          </div>
                        )}
                      </div>
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="prompt"
                label="Prompt"
                rules={[{ required: true, message: '请输入描述' }]}
              >
                <TextArea
                  rows={4}
                  placeholder="描述你想要生成的图片内容..."
                  maxLength={32000}
                  showCount
                />
              </Form.Item>

              <Form.Item name="n" label="生成数量">
                <Slider min={1} max={10} marks={{ 1: '1', 5: '5', 10: '10' }} />
              </Form.Item>

              {/* 动态渲染参数 */}
              {parameters.map((param) => renderParameterInput(param))}

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  disabled={!selectedModel}
                  block
                  size="large"
                >
                  生成图片
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {/* 右侧：结果预览 */}
        <Col span={12}>
          <Card title="生成结果">
            {loading && (
              <div style={{ textAlign: 'center', padding: 48 }}>
                <Spin size="large" tip="正在生成图片..." />
              </div>
            )}

            {!loading && generatedImages.length === 0 && (
              <Alert
                message="暂无生成结果"
                description="选择模型并输入描述后，点击生成图片按钮"
                type="info"
                showIcon
              />
            )}

            {generatedImages.length > 0 && (
              <Row gutter={[16, 16]}>
                {generatedImages.map((img, index) => (
                  <Col span={12} key={index}>
                    <Card
                      hoverable
                      cover={
                        img.image ? (
                          <Image
                            src={`data:image/png;base64,${img.image}`}
                            alt={`生成图片 ${index + 1}`}
                            style={{ height: 200, objectFit: 'cover' }}
                          />
                        ) : img.url ? (
                          <Image src={img.url} alt={`生成图片 ${index + 1}`} />
                        ) : null
                      }
                      actions={[
                        <DownloadOutlined
                          key="download"
                          onClick={() => downloadImage(img, index)}
                        />,
                      ]}
                    >
                      <Card.Meta
                        title={`图片 ${index + 1}`}
                        description={`格式: ${img.image ? 'base64' : 'url'}`}
                      />
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
