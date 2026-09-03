import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Home from '@/pages/index';
import apiClient from '@/api/client';

jest.mock('@/api/client', () => ({
  __esModule: true,
  default: { get: jest.fn() },
}));

jest.mock('next/link', () => {
  return ({ children, href }: any) => <a href={href}>{children}</a>;
});

const mockRecipes = [
  { id: 1, title: 'Pasta', description: 'Tasty', category: 'Dinner', prep_time: 10, cook_time: 20, servings: 2, image_url: '', created_at: '2024-01-01' },
  { id: 2, title: 'Salad', description: 'Fresh', category: 'Vegetarian', prep_time: 5, cook_time: 0, servings: 1, image_url: '', created_at: '2024-01-02' },
];

const mockMealPlans = [
  { id: 1, recipe_id: 1, date: '2024-06-10', meal_type: 'Dinner', recipe: { id: 1, title: 'Pasta', image_url: '' } },
];

beforeEach(() => {
  (apiClient.get as jest.Mock).mockImplementation((url: string) => {
    if (url === '/api/recipes') return Promise.resolve({ data: mockRecipes });
    if (url === '/api/meal-plans') return Promise.resolve({ data: mockMealPlans });
    return Promise.resolve({ data: [] });
  });
});

test('renders recipes after loading', async () => {
  render(<Home />);
  expect(screen.getByText('Loading recipes…')).toBeInTheDocument();
  await waitFor(() => expect(screen.getByText('Pasta')).toBeInTheDocument());
  expect(screen.getByText('Salad')).toBeInTheDocument();
});

test('filters by category pill', async () => {
  render(<Home />);
  await waitFor(() => expect(screen.getByText('Pasta')).toBeInTheDocument());
  await userEvent.click(screen.getByText('Vegetarian'));
  expect(screen.getByText('Salad')).toBeInTheDocument();
  expect(screen.queryByText('Pasta')).not.toBeInTheDocument();
});

test('shows error state on failure', async () => {
  (apiClient.get as jest.Mock).mockRejectedValue(new Error('fail'));
  render(<Home />);
  await waitFor(() => expect(screen.getByText('Failed to load data.')).toBeInTheDocument());
});

test('renders meal plans in week at a glance', async () => {
  render(<Home />);
  await waitFor(() => expect(screen.getByText('Pasta')).toBeInTheDocument());
  expect(screen.getByText('Dinner')).toBeInTheDocument();
  expect(screen.getByText('2024-06-10')).toBeInTheDocument();
});