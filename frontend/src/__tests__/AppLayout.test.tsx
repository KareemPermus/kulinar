import React from 'react';
import { render, screen } from '@testing-library/react';

jest.mock('next/router', () => ({
  useRouter: () => ({ pathname: '/' }),
}));

jest.mock('next/link', () => {
  return ({ children, href }: any) => <a href={href}>{children}</a>;
});

import AppLayout from '@/components/layout/AppLayout';

describe('AppLayout', () => {
  it('renders brand name', () => {
    render(<AppLayout><div>child</div></AppLayout>);
    expect(screen.getByText('Kulinar')).toBeTruthy();
  });

  it('renders nav links', () => {
    render(<AppLayout><div>test</div></AppLayout>);
    expect(screen.getByText('Home')).toBeTruthy();
    expect(screen.getByText('Recipes')).toBeTruthy();
    expect(screen.getByText('Meal Planner')).toBeTruthy();
  });

  it('renders children', () => {
    render(<AppLayout><div>page content</div></AppLayout>);
    expect(screen.getByText('page content')).toBeTruthy();
  });
});