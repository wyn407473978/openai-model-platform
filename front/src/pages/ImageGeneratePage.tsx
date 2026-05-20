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
  Slider,
  Image,
  InputNumber,
} from 'antd';
import { DownloadOutlined, ThunderboltOutlined, PictureOutlined } from '@ant-design/icons';
import { imageModelApi } from '@/api/admin/imageModel';
import { imageApi } from '@/api/image';
import type { ImageModel, ModelParameter } from '@/types/image';
import type { ImageGenerateRequest, ImageResult } from '@/types/imageGen';

const { TextArea } = Input;

export default function ImageGeneratePage() {
  const [form] = Form.useForm();
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [generatedImages, setGeneratedImages] = useState<ImageResult[]>([]);
  const [loading, setLoading] = useState(false);

  const { data: modelsData, isLoading: modelsLoading } = useQuery({
    queryKey: ['enabledModels'],
    queryFn: async () => {
      const res = await imageModelApi.listEnabled();
      return res.data.data as ImageModel[];
    },
  });

  const { data: parametersData, isLoading: paramsLoading } = useQuery({
    queryKey: ['modelParameters', selectedModel],
    queryFn: async () => {
      if (!selectedModel) return [];
      const res = await imageModelApi.getParameters(selectedModel);
      return res.data.data as ModelParameter[];
    },
    enabled: !!selectedModel,
  });

  const handleModelChange = (modelId: string) => {
    setSelectedModel(modelId);
    setGeneratedImages([]);
  };

  const sortedParameters = [...(parametersData || [])].sort((a, b) => a.param_order - b.param_order);

  const handleGenerate = async (values: Record<string, unknown>) => {
    setLoading(true);
    try {
      const request: ImageGenerateRequest = {
        model: selectedModel,
        prompt: values.prompt as string,
      };

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
          <Form.Item key={param.param_key} name={param.param_key} label={param.param_label} rules={rules}>
            <Select placeholder={`请选择${param.param_label}`}>
              {param.enum_values?.sort((a, b) => a.enum_order - b.enum_order).map((enumVal) => (
                <Select.Option key={enumVal.enum_value} value={enumVal.enum_value}>
                  {enumVal.enum_label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        );

      case 'boolean':
        return (
          <Form.Item key={param.param_key} name={param.param_key} label={param.param_label} valuePropName="checked">
            <Select options={[{ label: '是', value: 'true' }, { label: '否', value: 'false' }]} />
          </Form.Item>
        );

      case 'number':
        return (
          <Form.Item key={param.param_key} name={param.param_key} label={param.param_label} rules={rules}>
            <InputNumber min={1} max={10} style={{ width: '100%' }} />
          </Form.Item>
        );

      default:
        return (
          <Form.Item key={param.param_key} name={param.param_key} label={param.param_label} rules={rules}>
            <Input />
          </Form.Item>
        );
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>
          图片生成
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', margin: 0, fontSize: 14 }}>
          使用 AI 模型根据描述生成图片
        </p>
      </div>

      <Row gutter={24}>
        {/* Left: Form */}
        <Col span={11}>
          <Card
            style={{ borderRadius: 16 }}
            headStyle={{
              borderBottom: '1px solid var(--color-border)',
              padding: '16px 24px',
              fontWeight: 600,
            }}
            bodyStyle={{ padding: 24 }}
          >
            <Form form={form} layout="vertical" onFinish={handleGenerate} initialValues={{ n: 1 }}>
              <Form.Item
                name="model"
                label="选择模型"
                rules={[{ required: true, message: '请选择模型' }]}
              >
                <Select
                  placeholder="请选择模型"
                  onChange={handleModelChange}
                  loading={modelsLoading}
                  size="large"
                >
                  {modelsData?.map((model) => (
                    <Select.Option key={model.model_id} value={model.model_id}>
                      <div style={{ padding: '4px 0' }}>
                        <div style={{ fontWeight: 500 }}>{model.name}</div>
                        {model.description && (
                          <div style={{ fontSize: 12, color: '#94a3b8' }}>{model.description}</div>
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
                  rows={5}
                  placeholder="描述你想要生成的图片内容..."
                  maxLength={32000}
                  showCount
                  style={{ resize: 'none' }}
                />
              </Form.Item>

              <Form.Item name="n" label="生成数量" valuePropName="n">
                <Slider min={1} max={10} marks={{ 1: '1', 5: '5', 10: '10' }} />
              </Form.Item>

              {paramsLoading && <div style={{ padding: 8, color: 'var(--color-text-secondary)' }}>加载参数中...</div>}
              {sortedParameters.map((param) => renderParameterInput(param))}

              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                disabled={!selectedModel}
                block
                size="large"
                icon={<ThunderboltOutlined />}
                style={{
                  height: 48,
                  fontSize: 16,
                  fontWeight: 600,
                  borderRadius: 10,
                  marginTop: 8,
                }}
              >
                生成图片
              </Button>
            </Form>
          </Card>
        </Col>

        {/* Right: Result */}
        <Col span={13}>
          <Card
            style={{ borderRadius: 16, minHeight: 500 }}
            headStyle={{
              borderBottom: '1px solid var(--color-border)',
              padding: '16px 24px',
              fontWeight: 600,
            }}
            bodyStyle={{ padding: 24 }}
          >
            {loading && (
              <div style={{ textAlign: 'center', padding: 80 }}>
                <Spin size="large" tip="正在生成图片..." />
              </div>
            )}

            {!loading && generatedImages.length === 0 && (
              <div style={{ textAlign: 'center', padding: 80 }}>
                <div style={{ fontSize: 64, marginBottom: 16, opacity: 0.3 }}>
                  <PictureOutlined />
                </div>
                <div style={{ color: 'var(--color-text-secondary)' }}>
                  选择模型并输入描述后，点击生成图片
                </div>
              </div>
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
                          <Image src={img.url} alt={`生成图片 ${index + 1}`} style={{ height: 200, objectFit: 'cover' }} />
                        ) : null
                      }
                      actions={[
                        <DownloadOutlined key="download" onClick={() => downloadImage(img, index)} />,
                      ]}
                      style={{ borderRadius: 12 }}
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
