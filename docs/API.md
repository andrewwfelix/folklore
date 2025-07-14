# API Documentation - Folklore

## Overview
This document describes the API endpoints for the Folklore agent orchestration platform.

## Base URL
- Development: `http://localhost:3000/api`
- Production: `https://your-vercel-url.vercel.app/api`

## Authentication
[Describe authentication method]

## Endpoints

### Agents

#### GET /api/agents
List all agents

#### POST /api/agents
Create a new agent

#### GET /api/agents/:id
Get agent by ID

#### PUT /api/agents/:id
Update agent

#### DELETE /api/agents/:id
Delete agent

### Workflows

#### GET /api/workflows
List all workflows

#### POST /api/workflows
Create a new workflow

#### GET /api/workflows/:id
Get workflow by ID

#### PUT /api/workflows/:id
Update workflow

#### DELETE /api/workflows/:id
Delete workflow

#### POST /api/workflows/:id/execute
Execute a workflow

### Executions

#### GET /api/executions
List all executions

#### GET /api/executions/:id
Get execution by ID

## Data Models
[Define data structures]

## Error Handling
[Error response format]

## Rate Limiting
[Rate limiting information] 