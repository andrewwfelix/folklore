import { NextApiRequest, NextApiResponse } from 'next';
import { Agent, ApiResponse } from '@/types';
import { agentsTable } from '@/lib/supabase/client';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Agent | Agent[]>>
) {
  try {
    switch (req.method) {
      case 'GET':
        return await getAgents(req, res);
      case 'POST':
        return await createAgent(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).json({ 
          success: false, 
          error: `Method ${req.method} Not Allowed` 
        });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
}

async function getAgents(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Agent[]>>
) {
  const { data, error } = await agentsTable().select('*');
  
  if (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }

  res.status(200).json({
    success: true,
    data: data || []
  });
}

async function createAgent(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Agent>>
) {
  const { name, type, config } = req.body;

  if (!name || !type) {
    return res.status(400).json({
      success: false,
      error: 'Name and type are required'
    });
  }

  const agentData = {
    name,
    type,
    config: config || {},
    status: 'idle',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const { data, error } = await agentsTable().insert(agentData).select().single();

  if (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }

  res.status(201).json({
    success: true,
    data: data
  });
} 