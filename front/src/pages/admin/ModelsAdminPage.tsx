import { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Switch,
  Select,
  Space,
  Popconfirm,
  message,
  Card,
  Collapse,
  InputNumber,
  Divider,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { imageModelApi } from '@/api/admin/imageModel';
import type { ImageModel, ModelParameter, ParameterEnumValue } from '@/types/image';

const { Panel } = Collapse;

export default function ModelsAdminPage() {
  const [models, setModels] = useState<ImageModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingModel, setEditingModel] = useState<ImageModel | null>(null);
  const [paramModalVisible, setParamModalVisible] = useState(false);
  const [editingParam, setEditingParam] = useState<ModelParameter | null>(null);
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  const [form] = Form.useForm();
  const [paramForm] = Form.useForm();

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    setLoading(true);
    try {
      const res = await imageModelApi.listAll();
      setModels(res.data.data);
    } catch (error) {
      message.error('获取模型列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingModel(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: ImageModel) => {
    setEditingModel(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await imageModelApi.delete(id);
      message.success('删除成功');
      fetchModels();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingModel) {
        await imageModelApi.update(editingModel.id, values);
        message.success('更新成功');
      } else {
        await imageModelApi.create(values);
        message.success('创建成功');
      }
      setModalVisible(false);
      fetchModels();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleEditParam = (param: ModelParameter) => {
    setEditingParam(param);
    paramForm.setFieldsValue({
      ...param,
      default_value: param.default_value || undefined,
    });
    setParamModalVisible(true);
  };

  const handleDeleteParam = async (paramId: number) => {
    try {
      await imageModelApi.deleteParameter(paramId);
      message.success('删除成功');
      fetchModels();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleParamModalOk = async () => {
    try {
      const values = await paramForm.validateFields();
      if (!selectedModelId) return;

      if (editingParam) {
        await imageModelApi.updateParameter(editingParam.id, values);
        message.success('更新成功');
      } else {
        await imageModelApi.createParameter(selectedModelId, values);
        message.success('创建成功');
      }
      setParamModalVisible(false);
      fetchModels();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleAddParam = (modelId: string) => {
    setSelectedModelId(modelId);
    setEditingParam(null);
    paramForm.resetFields();
    setParamModalVisible(true);
  };

  const columns: ColumnsType<ImageModel> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },
    {
      title: 'Model ID',
      dataIndex: 'model_id',
      key: 'model_id',
      width: 150,
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '启用',
      dataIndex: 'enabled',
      key: 'enabled',
      width: 80,
      render: (enabled: boolean) => (enabled ? '是' : '否'),
    },
    {
      title: '排序',
      dataIndex: 'sort_order',
      key: 'sort_order',
      width: 80,
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button type="link" size="small" onClick={() => handleAddParam(record.model_id)}>
            添加参数
          </Button>
          <Popconfirm
            title="确认删除？"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button type="link" size="small" danger>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const paramColumns: ColumnsType<ModelParameter> = [
    {
      title: '参数Key',
      dataIndex: 'param_key',
      key: 'param_key',
      width: 120,
    },
    {
      title: '显示名称',
      dataIndex: 'param_label',
      key: 'param_label',
      width: 120,
    },
    {
      title: '类型',
      dataIndex: 'param_type',
      key: 'param_type',
      width: 100,
    },
    {
      title: '必填',
      dataIndex: 'is_required',
      key: 'is_required',
      width: 60,
      render: (required: boolean) => (required ? '是' : '否'),
    },
    {
      title: '默认值',
      dataIndex: 'default_value',
      key: 'default_value',
      width: 100,
    },
    {
      title: '枚举值',
      key: 'enum_values',
      render: (_, record) => (
        <span>
          {record.enum_values?.map((e) => e.enum_label).join(', ') || '-'}
        </span>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" onClick={() => handleEditParam(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确认删除？"
            onConfirm={() => handleDeleteParam(record.id)}
          >
            <Button type="link" size="small" danger>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card
        title="图片模型管理"
        extra={
          <Button type="primary" onClick={handleCreate}>
            添加模型
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={models}
          rowKey="id"
          loading={loading}
          expandable={{
            expandedRowRender: (record) => (
              <div style={{ padding: '0 0 16px 0' }}>
                <Collapse defaultActiveKey={[]} collapsible="header">
                  <Panel header="查看参数配置" key="1">
                    <Table
                      columns={paramColumns}
                      dataSource={record.parameters || []}
                      rowKey="id"
                      pagination={false}
                      size="small"
                    />
                  </Panel>
                </Collapse>
              </div>
            ),
          }}
        />
      </Card>

      {/* 模型编辑 Modal */}
      <Modal
        title={editingModel ? '编辑模型' : '添加模型'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        width={500}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="model_id"
            label="Model ID"
            rules={[{ required: true, message: '请输入Model ID' }]}
          >
            <Input placeholder="如: gpt-image-2" disabled={!!editingModel} />
          </Form.Item>
          <Form.Item
            name="name"
            label="名称"
            rules={[{ required: true, message: '请输入名称' }]}
          >
            <Input placeholder="如: GPT Image 2" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} placeholder="模型描述" />
          </Form.Item>
          <Form.Item name="enabled" label="启用" valuePropName="checked" initialValue={true}>
            <Switch />
          </Form.Item>
          <Form.Item name="sort_order" label="排序" initialValue={0}>
            <InputNumber min={0} style={{ width: 120 }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* 参数编辑 Modal */}
      <Modal
        title={editingParam ? '编辑参数' : '添加参数'}
        open={paramModalVisible}
        onOk={handleParamModalOk}
        onCancel={() => setParamModalVisible(false)}
        width={600}
      >
        <Form form={paramForm} layout="vertical">
          <Form.Item
            name="param_key"
            label="参数Key"
            rules={[{ required: true, message: '请输入参数Key' }]}
          >
            <Input placeholder="如: size, quality, background" disabled={!!editingParam} />
          </Form.Item>
          <Form.Item
            name="param_label"
            label="显示名称"
            rules={[{ required: true, message: '请输入显示名称' }]}
          >
            <Input placeholder="如: 图片尺寸" />
          </Form.Item>
          <Form.Item
            name="param_type"
            label="参数类型"
            rules={[{ required: true, message: '请选择参数类型' }]}
          >
            <Select>
              <Select.Option value="enum">枚举</Select.Option>
              <Select.Option value="string">字符串</Select.Option>
              <Select.Option value="number">数字</Select.Option>
              <Select.Option value="boolean">布尔</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="is_required" label="必填" valuePropName="checked" initialValue={false}>
            <Switch />
          </Form.Item>
          <Form.Item name="default_value" label="默认值">
            <Input placeholder="默认值" />
          </Form.Item>
          <Form.Item name="param_order" label="排序" initialValue={0}>
            <InputNumber min={0} style={{ width: 120 }} />
          </Form.Item>
        </Form>

        {editingParam && editingParam.param_type === 'enum' && (
          <>
            <Divider>枚举值配置</Divider>
            <EnumValueManager
              parameterId={editingParam.id}
              enumValues={editingParam.enum_values || []}
              onUpdate={fetchModels}
            />
          </>
        )}
      </Modal>
    </div>
  );
}

// 枚举值管理组件
function EnumValueManager({
  parameterId,
  enumValues,
  onUpdate,
}: {
  parameterId: number;
  enumValues: ParameterEnumValue[];
  onUpdate: () => void;
}) {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingEnum, setEditingEnum] = useState<ParameterEnumValue | null>(null);
  const [form] = Form.useForm();

  const handleAdd = () => {
    setEditingEnum(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: ParameterEnumValue) => {
    setEditingEnum(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (enumId: number) => {
    try {
      await imageModelApi.deleteEnumValue(enumId);
      message.success('删除成功');
      onUpdate();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingEnum) {
        await imageModelApi.updateEnumValue(editingEnum.id, values);
        message.success('更新成功');
      } else {
        await imageModelApi.createEnumValue(parameterId, values);
        message.success('创建成功');
      }
      setModalVisible(false);
      onUpdate();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const columns: ColumnsType<ParameterEnumValue> = [
    {
      title: '枚举值',
      dataIndex: 'enum_value',
      key: 'enum_value',
      width: 120,
    },
    {
      title: '显示名称',
      dataIndex: 'enum_label',
      key: 'enum_label',
    },
    {
      title: '默认',
      dataIndex: 'is_default',
      key: 'is_default',
      width: 60,
      render: (isDefault: boolean) => (isDefault ? '是' : '否'),
    },
    {
      title: '排序',
      dataIndex: 'enum_order',
      key: 'enum_order',
      width: 60,
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确认删除？"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button type="link" size="small" danger>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Button type="link" onClick={handleAdd} style={{ padding: 0 }}>
        + 添加枚举值
      </Button>
      <Table
        columns={columns}
        dataSource={enumValues}
        rowKey="id"
        pagination={false}
        size="small"
      />

      <Modal
        title={editingEnum ? '编辑枚举值' : '添加枚举值'}
        open={modalVisible}
        onOk={handleOk}
        onCancel={() => setModalVisible(false)}
        width={400}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="enum_value"
            label="枚举值"
            rules={[{ required: true, message: '请输入枚举值' }]}
          >
            <Input placeholder="如: 1024x1024" />
          </Form.Item>
          <Form.Item
            name="enum_label"
            label="显示名称"
            rules={[{ required: true, message: '请输入显示名称' }]}
          >
            <Input placeholder="如: 1024×1024 (正方形)" />
          </Form.Item>
          <Form.Item name="is_default" label="设为默认" valuePropName="checked" initialValue={false}>
            <Switch />
          </Form.Item>
          <Form.Item name="enum_order" label="排序" initialValue={0}>
            <InputNumber min={0} style={{ width: 120 }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
