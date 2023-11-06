import server from '@/api/server';
import type { SignInResponse } from '@/libs/type/client';
import type { NextApiResponse, NextApiRequest } from 'next';

export default async function handleSignIn(
  req: NextApiRequest,
  res: NextApiResponse<SignInResponse>,
) {
  if (req.method !== 'POST') return res.status(405).end();

  const result = await server.postSignIn(req.body);

  if (result === undefined)
    return res.status(500).json({ ok: false, reason: '서버 통신 없음' });

  if (result.data === undefined)
    return res.status(500).json({ ok: false, reason: '서버 결과 없음' });

  const { data } = result;

  if (!data.success) {
    return res.status(400).json({ ok: false, reason: data.reason });
  }

  return res.status(200).json({ ok: true, token: data.token });
}
