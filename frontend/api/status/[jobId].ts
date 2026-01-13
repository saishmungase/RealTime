import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { jobId } = req.query;
  const AWS_URL = process.env.VITE_COMPILER_URL;

  try {
    const response = await fetch(`${AWS_URL}/status/${jobId}`);
    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error: any) {
    return res.status(500).json({ status: "error", message: error.message });
  }
}
