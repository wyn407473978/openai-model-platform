import { useQuery } from '@tanstack/react-query'
import { imageModelApi } from '@/api/admin/imageModel'

export default function ModelsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['enabledModels'],
    queryFn: async () => {
      const res = await imageModelApi.listEnabled()
      return res.data.data
    },
  })

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error loading models</div>

  return (
    <div style={{ padding: 24 }}>
      <h1>图片模型</h1>
      <div>
        {data?.map((model) => (
          <div key={model.id} style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>
            <strong>{model.name}</strong> ({model.model_id})
            {model.description && <div style={{ color: '#666' }}>{model.description}</div>}
          </div>
        ))}
      </div>
    </div>
  )
}
