// !STARTERCONF You should delete this page

import { render, screen } from '@testing-library/react';

import ComponentPage from '@/app/components-page/page';

describe('ComponentPage', () => {
  it('renders the Components', () => {
    render(<ComponentPage />);
    const heading = screen.getByText(/Built-in Components/i);

    expect(heading).toBeInTheDocument();
  });
});
