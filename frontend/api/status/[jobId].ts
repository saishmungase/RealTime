import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { jobId } = req.query;
  const AWS_URL = process.env.VITE_COMPILER_URL;
  
  console.log('[status] AWS_URL:', AWS_URL);
  console.log('[status] jobId:', jobId);

  if (!AWS_URL) {
    console.error('[status] ERROR: VITE_COMPILER_URL environment variable is not set');
    return res.status(500).json({ 
      status: "error", 
      message: "Server configuration error: VITE_COMPILER_URL not set" 
    });
  }

  try {
    console.log(`[status] Forwarding request to: ${AWS_URL}/status/${jobId}`);
    const response = await fetch(`${AWS_URL}/status/${jobId}`);
    console.log('[status] Response status:', response.status);
    
    if (!response.ok) {
      const text = await response.text();
      console.error('[status] AWS returned error:', text);
      return res.status(response.status).json({ 
        status: "error", 
        message: `AWS server error: ${response.statusText}` 
      });
    }

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error: any) {
    console.error('[status] ERROR:', error.message);
    return res.status(500).json({ 
      status: "error", 
      message: `Proxy Error: ${error.message}. AWS instance at ${AWS_URL} may be unreachable or not responding with valid JSON.` 
    });
  }
}
