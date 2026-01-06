import { render } from '@react-email/render';
import type * as React from 'react';

export async function renderEmail(input: {
  react: React.ReactElement;
}): Promise<{ html: string; text: string }> {
  const html = await render(input.react);
  const text = await render(input.react, { plainText: true });
  return { html, text };
}
