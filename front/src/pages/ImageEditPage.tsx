import { useState, useCallback } from 'react';
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
  Upload,
  Image,
  InputNumber,
  Slider,
} from 'antd';
import { InboxOutlined, DownloadOutlined, EditOutlined, CopyOutlined } from '@ant-design/icons';
import type { RcFile, UploadFile } from 'antd/es/upload';
import { imageModelApi } from '@/api/admin/imageModel';
import { imageApi } from '@/api/image';
import type { ImageModel, ModelParameter } from '@/types/image';
import type { ImageEditRequest, ImageResult } from '@/types/imageGen';

const { TextArea } = Input;
const { Dragger } = Upload;

export default function ImageEditPage() {
  const [form] = Form.useForm();
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [maskImage, setMaskImage] = useState<string>('');
  const [editedImages, setEditedImages] = useState<ImageResult[]>([]);
  const [loading, setLoading] = useState(false);

  const { data: modelsData, isLoading: modelsLoading } = useQuery({
    queryKey: ['enabledModelsForEdit'],
    queryFn: async () => {
      const res = await imageModelApi.listEnabled();
      return res.data.data as ImageModel[];
    },
  });

  const { data: parametersData, isLoading: paramsLoading } = useQuery({
    queryKey: ['modelParametersForEdit', selectedModel],
    queryFn: async () => {
      if (!selectedModel) return [];
      const res = await imageModelApi.getParameters(selectedModel);
      return res.data.data as ModelParameter[];
    },
    enabled: !!selectedModel,
  });

  const sortedParameters = [...(parametersData || [])].sort((a, b) => a.param_order - b.param_order);

  const handleModelChange = (modelId: string) => {
    setSelectedModel(modelId);
    setEditedImages([]);
  };

  const getBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageUpload = useCallback(async (file: RcFile) => {
    const base64 = await getBase64(file);
    setUploadedImages((prev) => [...prev, base64]);
    return false;
  }, []);

  const handleMaskUpload = useCallback(async (file: RcFile) => {
    const base64 = await getBase64(file);
    setMaskImage(base64);
    return false;
  }, []);

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleEdit = async (values: Record<string, unknown>) => {
    if (uploadedImages.length === 0) {
      message.error('请上传至少一张图片');
      return;
    }

    setLoading(true);
    try {
      const request: ImageEditRequest = {
        model: selectedModel,
        prompt: values.prompt as string,
        images: uploadedImages,
      };

      if (maskImage) request.mask = maskImage;
      if (values.n) request.n = values.n as number;
      if (values.size) request.size = values.size as string;
      if (values.quality) request.quality = values.quality as string;
      if (values.output_format) request.output_format = values.output_format as string;
      if (values.background) request.background = values.background as string;
      if (values.input_fidelity) request.input_fidelity = values.input_fidelity as string;

      const res = await imageApi.edit(request);
      if (res.data.data) {
        setEditedImages(res.data.data.data || []);
        message.success('图片编辑成功！');
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      message.error(err.response?.data?.error || '编辑失败');
    } finally {
      setLoading(false);
    }
  };

  const handleVariation = async () => {
    if (uploadedImages.length === 0) {
      message.error('请上传至少一张图片');
      return;
    }

    setLoading(true);
    try {
      const res = await imageApi.variation({
        model: selectedModel,
        image: uploadedImages[0],
      });
      if (res.data.data) {
        setEditedImages(res.data.data.data || []);
        message.success('图片变体生成成功！');
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
      link.download = `edited-image-${index + 1}.png`;
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
      case 'number':
        return (
          <Form.Item key={param.param_key} name={param.param_key} label={param.param_label} rules={rules}>
            <InputNumber min={1} max={10} style={{ width: '100%' }} />
          </Form.Item>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>
          图片编辑
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', margin: 0, fontSize: 14 }}>
          编辑现有图片或生成变体
        </p>
      </div>

      <Row gutter={24}>
        {/* Left: Form */}
        <Col span={11}>
          <Card
            style={{ borderRadius: 16 }}
            headStyle={{ borderBottom: '1px solid var(--color-border)', padding: '16px 24px', fontWeight: 600 }}
            bodyStyle={{ padding: 24 }}
          >
            <Form form={form} layout="vertical" onFinish={handleEdit} initialValues={{ n: 1 }}>
              <Form.Item label="选择模型">
                <Select value={selectedModel} onChange={handleModelChange} loading={modelsLoading} size="large">
                  {modelsData?.map((model) => (
                    <Select.Option key={model.model_id} value={model.model_id}>
                      {model.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item name="prompt" label="编辑描述" rules={[{ required: true, message: '请输入编辑描述' }]}>
                <TextArea rows={4} placeholder="描述你想要如何编辑这张图片..." maxLength={32000} showCount style={{ resize: 'none' }} />
              </Form.Item>

              <Form.Item name="n" label="生成数量" valuePropName="n">
                <Slider min={1} max={10} marks={{ 1: '1', 5: '5', 10: '10' }} />
              </Form.Item>

              {paramsLoading && <div style={{ padding: 8, color: 'var(--color-text-secondary)' }}>加载参数中...</div>}
              {sortedParameters.map((param) => renderParameterInput(param))}

              <Form.Item>
                <Space>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    disabled={uploadedImages.length === 0}
                    icon={<EditOutlined />}
                    style={{ borderRadius: 8 }}
                  >
                    编辑图片
                  </Button>
                  <Button
                    onClick={handleVariation}
                    loading={loading}
                    disabled={uploadedImages.length === 0}
                    icon={<CopyOutlined />}
                    style={{ borderRadius: 8 }}
                  >
                    生成变体
                  </Button>
                </Space>
              </Form.Item>
            </Form>

            {/* Image Upload */}
            <div style={{ marginTop: 24 }}>
              <h4 style={{ marginBottom: 12, fontWeight: 600 }}>上传图片（1-16张）</h4>
              <Dragger
                multiple
                accept="image/png,image/jpeg,image/webp"
                beforeUpload={handleImageUpload}
                fileList={[]}
                showUploadList={false}
                style={{ borderRadius: 12 }}
              >
                <p className="ant-upload-drag-icon" style={{ color: 'var(--color-primary)' }}>
                  <InboxOutlined style={{ fontSize: 40 }} />
                </p>
                <p className="ant-upload-text" style={{ fontWeight: 500 }}>点击或拖拽上传图片</p>
                <p className="ant-upload-hint" style={{ color: 'var(--color-text-secondary)' }}>支持 PNG、JPG、WebP 格式</p>
              </Dragger>

              {uploadedImages.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <Row gutter={[8, 8]}>
                    {uploadedImages.map((img, index) => (
                      <Col span={6} key={index}>
                        <div style={{ position: 'relative', borderRadius: 8, overflow: 'hidden' }}>
                          <Image src={img} alt={`上传图片 ${index + 1}`} style={{ width: '100%', height: 80, objectFit: 'cover' }} />
                          <Button
                            type="text"
                            danger
                            size="small"
                            style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(255,255,255,0.9)' }}
                            onClick={() => removeImage(index)}
                          >
                            删除
                          </Button>
                        </div>
                      </Col>
                    ))}
                  </Row>
                </div>
              )}
            </div>

            {/* Mask Upload */}
            <div style={{ marginTop: 24 }}>
              <h4 style={{ marginBottom: 12, fontWeight: 600 }}>Mask 图片（可选）</h4>
              <Dragger
                accept="image/png"
                beforeUpload={handleMaskUpload}
                fileList={maskImage ? [{ name: 'mask.png', status: 'done', uid: '1' } as UploadFile] : []}
                onRemove={() => setMaskImage('')}
                style={{ borderRadius: 12 }}
              >
                <p className="ant-upload-drag-icon" style={{ color: 'var(--color-text-secondary)' }}>
                  <InboxOutlined style={{ fontSize: 32 }} />
                </p>
                <p className="ant-upload-text" style={{ fontWeight: 500, fontSize: 14 }}>点击或拖拽上传 Mask</p>
                <p className="ant-upload-hint" style={{ color: 'var(--color-text-secondary)', fontSize: 12 }}>PNG 格式，用于指定编辑区域</p>
              </Dragger>
            </div>
          </Card>
        </Col>

        {/* Right: Result */}
        <Col span={13}>
          <Card
            style={{ borderRadius: 16, minHeight: 600 }}
            headStyle={{ borderBottom: '1px solid var(--color-border)', padding: '16px 24px', fontWeight: 600 }}
            bodyStyle={{ padding: 24 }}
          >
            {loading && (
              <div style={{ textAlign: 'center', padding: 80 }}>
                <Spin size="large" tip="正在处理图片..." />
              </div>
            )}

            {!loading && editedImages.length === 0 && (
              <div style={{ textAlign: 'center', padding: 80 }}>
                <div style={{ fontSize: 64, marginBottom: 16, opacity: 0.3 }}>
                  <EditOutlined />
                </div>
                <div style={{ color: 'var(--color-text-secondary)' }}>
                  上传图片并输入描述后，点击编辑或生成变体
                </div>
              </div>
            )}

            {editedImages.length > 0 && (
              <Row gutter={[16, 16]}>
                {editedImages.map((img, index) => (
                  <Col span={12} key={index}>
                    <Card
                      hoverable
                      cover={
                        img.image ? (
                          <Image src={`data:image/png;base64,${img.image}`} alt={`编辑结果 ${index + 1}`} style={{ height: 200, objectFit: 'cover' }} />
                        ) : img.url ? (
                          <Image src={img.url} alt={`编辑结果 ${index + 1}`} style={{ height: 200, objectFit: 'cover' }} />
                        ) : null
                      }
                      actions={[<DownloadOutlined key="download" onClick={() => downloadImage(img, index)} />]}
                      style={{ borderRadius: 12 }}
                    >
                      <Card.Meta
                        title={`结果 ${index + 1}`}
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
