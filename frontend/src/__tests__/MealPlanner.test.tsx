import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MealPlanner from '@/pages/mealplanner';
import apiClient from '@/api/client';

jest.mock('@/api/client', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockMealPlans = [
  { id: 1, recipe_id: 10, date: new Date().toISOString().split('T')[0], meal_type: 'Breakfast', recipe: { id: 10, title: 'Pancakes', image_url: '' } },
];
const mockRecipes = [
  { id: 10, title: 'Pancakes', description: '', category: 'Breakfast', prep_time: 10, cook_time: 15, servings: 2, image_url: '', created_at: '2024-01-01' },
];

describe('MealPlanner', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (apiClient.get as jest.Mock).mockImplementation((url: string) => {
      if (url === '/api/meal-plans') return Promise.resolve({ data: mockMealPlans });
      if (url === '/api/recipes') return Promise.resolve({ data: mockRecipes });
      return Promise.resolve({ data: [] });
    });
  });

  it('renders the meal planner title', async () => {
    render(<MealPlanner />);
    await waitFor(() => expect(screen.getByText('Meal Plan')).toBeInTheDocument());
  });

  it('displays a meal plan entry', async () => {
    render(<MealPlanner />);
    await waitFor(() => expect(screen.getByText('Pancakes')).toBeInTheDocument());
  });

  it('shows error state on fetch failure', async () => {
    (apiClient.get as jest.Mock).mockRejectedValue(new Error('fail'));
    render(<MealPlanner />);
    await waitFor(() => expect(screen.getByText('Failed to load meal plans.')).toBeInTheDocument());
  });

  it('opens add modal when clicking add button', async () => {
    render(<MealPlanner />);
    await waitFor(() => screen.getByText('Meal Plan'));
    const addBtns = screen.getAllByRole('button', { name: '' });
    // find one of the + buttons (dashed cells)
    const plusBtn = addBtns.find(b => b.querySelector('svg'));
    if (plusBtn) {
      fireEvent.click(plusBtn);
      await waitFor(() => expect(screen.getByText('Select a recipe…')).toBeInTheDocument());
    }
  });
});