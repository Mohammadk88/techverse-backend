export interface SearchResultItem {
  id: number;
  title: string;
  description?: string | null;
  type: 'article' | 'cafe' | 'user' | 'tag';
  avatar?: string | null;
  author?: {
    id: number;
    firstName?: string | null;
    lastName?: string | null;
    username?: string | null;
  };
  metadata?: any;
  createdAt: Date;
}

export interface SearchResponse {
  query: string;
  totalResults: number;
  results: {
    articles: SearchResultItem[];
    cafes: SearchResultItem[];
    users: SearchResultItem[];
    tags: SearchResultItem[];
  };
  summary: {
    articlesCount: number;
    cafesCount: number;
    usersCount: number;
    tagsCount: number;
  };
}

export interface SearchOptions {
  page?: number;
  limit?: number;
  offset?: number;
  includeInactive?: boolean;
  sortBy?: string;
  sortOrder?: string;
  category?: string;
  author?: string;
  tag?: string;
  city?: string;
  language?: string;
}
