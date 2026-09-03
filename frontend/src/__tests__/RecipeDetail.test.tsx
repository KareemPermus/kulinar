import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RecipeDetailPage from '@/pages/recipes/[id]';
import apiClient from '@/api/client';

jest.mock('next/router', () => ({
  useRouter: () => ({ query: { id: '1' }, push: jest.fn() }),
}));
jest.mock('@/api/client');

const mockRecipe = {
  id: 1,
  title: 'Test Recipe',
  description: 'Desc',
  category: 'Dinner',
  prep_time: 10,
  cook_time: 20,
  servings: 4,
  image_url: '',
  created_at: '2024-01-01',
  ingredients: [{ id: 1, name: 'Salt', quantity: '1', unit: 'tsp' }],
  steps: [{ id: 1, order: 1, instruction: 'Do something' }],
};

describe('RecipeDetailPage', () => {
  it('renders recipe details', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({ data: mockRecipe });
    render(<RecipeDetailPage />);
    await waitFor(() => expect(screen.getByText('Test Recipe')).toBeInTheDocument());
    expect(screen.getByText('Salt')).toBeInTheDocument();
    expect(screen.getByText('Do something')).toBeInTheDocument();
  });

  it('shows error on fetch failure', async () => {
    (apiClient.get as jest.Mock).mockRejectedValue(new Error('fail'));
    render(<RecipeDetailPage />);
    await waitFor(() => expect(screen.getByText('Recipe not found')).toBeInTheDocument());
  });

  it('calls delete on button click', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({ data: mockRecipe });
    (apiClient.delete as jest.Mock).mockResolvedValue({ data: { success: true } });
    window.confirm = jest.fn(() => true);
    render(<RecipeDetailPage />);
    await waitFor(() => screen.getByText('Test Recipe'));
    await userEvent.click(screen.getByText('Delete'));
    expect(apiClient.delete).toHaveBeenCalledWith('/api/recipes/1');
  });
});