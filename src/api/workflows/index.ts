import { NextApiRequest, NextApiResponse } from 'next';
import { Workflow, ApiResponse } from '@/types';
import { workflowsTable } from '@/lib/supabase/client';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Workflow | Workflow[]>>
) {
  try {
    switch (req.method) {
      case 'GET':
        return await getWorkflows(req, res);
      case 'POST':
        return await createWorkflow(req, res);
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

async function getWorkflows(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Workflow[]>>
) {
  const { data, error } = await workflowsTable().select('*');
  
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

async function createWorkflow(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Workflow>>
) {
  const { name, description, steps, status } = req.body;

  if (!name || !steps || !Array.isArray(steps)) {
    return res.status(400).json({
      success: false,
      error: 'Name and steps array are required'
    });
  }

  const workflowData = {
    name,
    description: description || '',
    steps,
    status: status || 'draft',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const { data, error } = await workflowsTable().insert(workflowData).select().single();

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