import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Recipes from '@/pages/recipes';
import apiClient from '@/api/client';

jest.mock('@/api/client', () => ({
  __esModule: true,
  default: { get: jest.fn() },
}));

const mockRecipes = [
  { id: 1, title: 'Pasta', description: 'Italian pasta', category: 'Dinner', prep_time: 10, cook_time: 20, servings: 4, image_url: '', created_at: '2024-01-01' },
  { id: 2, title: 'Pancakes', description: 'Fluffy', category: 'Breakfast', prep_time: 5, cook_time: 15, servings: 2, image_url: '', created_at: '2024-01-02' },
];

describe('Recipes page', () => {
  beforeEach(() => {
    (apiClient.get as jest.Mock).mockResolvedValue({ data: mockRecipes });
  });

  it('renders recipes after loading', async () => {
    render(<Recipes />);
    expect(screen.getByText('Loading recipes…')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('Pasta')).toBeInTheDocument());
    expect(screen.getByText('Pancakes')).toBeInTheDocument();
  });

  it('filters by search', async () => {
    render(<Recipes />);
    await waitFor(() => expect(screen.getByText('Pasta')).toBeInTheDocument());
    fireEvent.change(screen.getByPlaceholderText('Search recipes, ingredients…'), { target: { value: 'pancake' } });
    expect(screen.queryByText('Pasta')).not.toBeInTheDocument();
    expect(screen.getByText('Pancakes')).toBeInTheDocument();
  });

  it('filters by category pill', async () => {
    render(<Recipes />);
    await waitFor(() => expect(screen.getByText('Pasta')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Breakfast'));
    expect(screen.queryByText('Pasta')).not.toBeInTheDocument();
    expect(screen.getByText('Pancakes')).toBeInTheDocument();
  });

  it('shows error on API failure', async () => {
    (apiClient.get as jest.Mock).mockRejectedValue(new Error('fail'));
    render(<Recipes />);
    await waitFor(() => expect(screen.getByText('Failed to load recipes')).toBeInTheDocument());
  });
});