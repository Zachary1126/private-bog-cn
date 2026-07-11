export type Category = 'ai' | 'life' | 'career';

export interface PublishTarget {
  id: string;
  name: string;
  logo: string;
  connected: boolean;
  username?: string;
  repo?: string;
  branch?: string;
}

export interface PublishStatus {
  status: 'idle' | 'publishing' | 'success' | 'failed';
  url?: string;
  publishedAt?: string;
  error?: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  summary: string;
  category: Category;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  published: boolean;
  publishStatus?: Record<string, PublishStatus>;
  readTime: number; // in minutes
  views: number;
}

export interface AIResponse {
  content?: string;
  tags?: string[];
  summary?: string;
  outline?: string[];
  error?: string;
}
