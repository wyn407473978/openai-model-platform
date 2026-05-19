import { useQuery } from '@tanstack/react-query'
import { modelApi } from '@/api/user'

export default function ModelsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['models'],
    queryFn: async () => {
      const res = await modelApi.list()
      return res.data.data
    },
  })

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error loading models</div>

  return (
    <div>
      <h1>Models</h1>
      <div>
        {data?.map((model) => (
          <div key={model.id}>
            {model.name} - {model.provider}
          </div>
        ))}
      </div>
    </div>
  )
}
