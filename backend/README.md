# OpenAI Model Platform Backend

Go + Gin + Gorm + PostgreSQL

## Getting Started

```bash
# Install dependencies
go mod tidy

# Run development server
go run cmd/server/main.go

# Build
go build -o server cmd/server/main.go
```

## Project Structure

```
cmd/server/           # Application entry point
internal/
├── config/          # Configuration
├── handler/         # HTTP handlers
├── middleware/      # Middleware
├── model/           # Data models
├── repository/      # Database operations
└── service/         # Business logic
pkg/utils/           # Utility packages
configs/             # Configuration files
```

## Configuration

Copy `configs/config.yaml` and adjust settings:

```yaml
server:
  address: :8080

database:
  host: localhost
  port: 5432
  username: postgres
  password: postgres
  name: openai_platform
```

## API Documentation

API docs available at `/swagger/*` when running in debug mode.
