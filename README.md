# Folklore - Agent Orchestration Platform

A server-side Node.js tool for orchestrating agents, built with Vercel and Supabase.

## 🚀 Features

- **Agent Management**: Create, configure, and manage different types of agents
- **Workflow Orchestration**: Define and execute complex agent workflows
- **Real-time Monitoring**: Track agent and workflow execution status
- **Scalable Architecture**: Built on Vercel serverless functions
- **Database Integration**: PostgreSQL database via Supabase
- **TypeScript**: Full type safety throughout the application

## 🏗️ Architecture

```
folklore/
├── src/
│   ├── agents/          # Agent definitions and logic
│   ├── api/             # Vercel API routes
│   ├── lib/             # Shared utilities
│   ├── types/           # TypeScript type definitions
│   └── config/          # Configuration files
├── tests/               # Test files
├── database/            # Database schema and migrations
├── docs/                # Documentation
└── public/              # Static assets
```

## 🛠️ Tech Stack

- **Runtime**: Node.js with TypeScript
- **Deployment**: Vercel (serverless functions)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Testing**: Jest
- **Linting**: ESLint

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Vercel CLI
- Supabase account

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/folklore.git
cd folklore
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
```bash
cp env.example .env.local
```

Edit `.env.local` with your Supabase credentials:
```bash
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 4. Set up database
Run the schema in your Supabase SQL editor:
```sql
-- Copy contents of database/schema.sql
```

### 5. Deploy to Vercel
```bash
vercel
```

## 🧪 Development

### Run locally
```bash
npm run dev
```

### Run tests
```bash
npm test
npm run test:watch
npm run test:coverage
```

### Lint code
```bash
npm run lint
npm run lint:fix
```

## 📚 API Documentation

### Agents

#### GET /api/agents
List all agents

#### POST /api/agents
Create a new agent

#### GET /api/agents/:id
Get agent by ID

### Workflows

#### GET /api/workflows
List all workflows

#### POST /api/workflows
Create a new workflow

#### POST /api/workflows/:id/execute
Execute a workflow

## 🗄️ Database Schema

### Tables
- **users**: User management
- **agents**: Agent configurations
- **workflows**: Workflow definitions
- **executions**: Execution history

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- Create an issue for bugs or feature requests
- Check the documentation in `/docs`
- Review the API documentation

## 🔄 Version History

- **v1.0.0**: Initial release with basic agent orchestration 