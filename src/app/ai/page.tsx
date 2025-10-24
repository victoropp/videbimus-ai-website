import { Metadata } from 'next';
import AIPlaygroundClient from './page.client';

export const metadata: Metadata = {
  title: 'AI Playground | Videbimus AI',
  description: 'Explore cutting-edge AI features including chatbots, sentiment analysis, text summarization, and more.',
};

export default function AIPlaygroundPage() {
  return <AIPlaygroundClient />;
}
