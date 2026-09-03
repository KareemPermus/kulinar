import { createMocks } from 'node-mocks-http';
import handler from '@/pages/api/meal-plans/index';
import detailHandler from '@/pages/api/meal-plans/[id]';

delete process.env.NEXT_PUBLIC_SUPABASE_URL;

describe('/api/meal-plans', () => {
  it('GET returns array', async () => {
    const { req, res } = createMocks({ method: 'GET' });
    await handler(req as any, res as any);
    expect(res._getStatusCode()).toBe(200);
    expect(Array.isArray(JSON.parse(res._getData()))).toBe(true);
  });

  it('POST creates meal plan', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { recipe_id: 1, date: '2025-01-15', meal_type: 'dinner' },
    });
    await handler(req as any, res as any);
    expect(res._getStatusCode()).toBe(201);
    const data = JSON.parse(res._getData());
    expect(data.meal_type).toBe('dinner');
  });

  it('POST without fields returns 400', async () => {
    const { req, res } = createMocks({ method: 'POST', body: {} });
    await handler(req as any, res as any);
    expect(res._getStatusCode()).toBe(400);
  });
});

describe('/api/meal-plans/[id]', () => {
  it('DELETE returns success', async () => {
    // create one first
    const { req: cReq, res: cRes } = createMocks({ method: 'POST', body: { recipe_id: 1, date: '2025-02-01', meal_type: 'lunch' } });
    await handler(cReq as any, cRes as any);
    const created = JSON.parse(cRes._getData());

    const { req, res } = createMocks({ method: 'DELETE', query: { id: String(created.id) } });
    await detailHandler(req as any, res as any);
    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData()).success).toBe(true);
  });

  it('non-DELETE returns 405', async () => {
    const { req, res } = createMocks({ method: 'GET', query: { id: '1' } });
    await detailHandler(req as any, res as any);
    expect(res._getStatusCode()).toBe(405);
  });
});