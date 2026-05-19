import { useQuery } from '@tanstack/react-query'
import { userApi } from '@/api/user'

export default function UsersPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await userApi.list({ page: 1, page_size: 10 })
      return res.data
    },
  })

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error loading users</div>

  return (
    <div>
      <h1>Users</h1>
      <div>
        {data?.data.map((user) => (
          <div key={user.id}>
            {user.username} - {user.email}
          </div>
        ))}
      </div>
    </div>
  )
}
