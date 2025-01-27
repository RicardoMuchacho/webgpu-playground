import React from 'react';
import { render } from '@testing-library/react';
import App from '../App';

jest.mock('@huggingface/transformers', () => ({
  env: {},
  AutoModel: jest.fn(),
  AutoProcessor: jest.fn(),
  RawImage: jest.fn()
}));

test('renders app correctly', () => {
  const component = render(<App />);
  expect(component.getByText('Background Remover')).toBeTruthy();
});