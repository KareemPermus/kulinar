import { createMocks } from 'node-mocks-http';
import handler from '@/pages/api/recipes/index';
import detailHandler from '@/pages/api/recipes/[id]';

// Force SQLite path
delete process.env.NEXT_PUBLIC_SUPABASE_URL;

describe('/api/recipes', () => {
  it('GET returns array', async () => {
    const { req, res } = createMocks({ method: 'GET' });
    await handler(req as any, res as any);
    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(Array.isArray(data)).toBe(true);
  });

  it('POST creates recipe', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { title: 'Test Recipe', description: 'Desc', category: 'Test', ingredients: [{ name: 'Salt', quantity: '1', unit: 'tsp' }], steps: [{ order: 1, instruction: 'Do it' }] },
    });
    await handler(req as any, res as any);
    expect(res._getStatusCode()).toBe(201);
    const data = JSON.parse(res._getData());
    expect(data.title).toBe('Test Recipe');
    expect(data.ingredients).toHaveLength(1);
    expect(data.steps).toHaveLength(1);
  });

  it('POST without title returns 400', async () => {
    const { req, res } = createMocks({ method: 'POST', body: {} });
    await handler(req as any, res as any);
    expect(res._getStatusCode()).toBe(400);
  });
});

describe('/api/recipes/[id]', () => {
  it('GET returns recipe with ingredients and steps', async () => {
    const { req, res } = createMocks({ method: 'GET', query: { id: '1' } });
    await detailHandler(req as any, res as any);
    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.title).toBeDefined();
    expect(data.ingredients).toBeDefined();
    expect(data.steps).toBeDefined();
  });

  it('GET 404 for missing recipe', async () => {
    const { req, res } = createMocks({ method: 'GET', query: { id: '99999' } });
    await detailHandler(req as any, res as any);
    expect(res._getStatusCode()).toBe(404);
  });

  it('PUT updates recipe', async () => {
    const { req, res } = createMocks({ method: 'PUT', query: { id: '1' }, body: { title: 'Updated' } });
    await detailHandler(req as any, res as any);
    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.title).toBe('Updated');
  });

  it('DELETE returns success', async () => {
    // Create one to delete
    const { req: cReq, res: cRes } = createMocks({ method: 'POST', body: { title: 'ToDelete' } });
    await handler(cReq as any, cRes as any);
    const created = JSON.parse(cRes._getData());

    const { req, res } = createMocks({ method: 'DELETE', query: { id: String(created.id) } });
    await detailHandler(req as any, res as any);
    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData()).success).toBe(true);
  });
});