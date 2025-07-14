# Frontend Integration Guide - TechVerse Café API

## Overview

This guide provides comprehensive information for frontend developers to integrate with the TechVerse Café API.

## API Documentation & Specifications

### Swagger Documentation
- **Interactive Docs**: [http://localhost:4040/api/docs](http://localhost:4040/api/docs)
- **API Information**: [http://localhost:4040/api/info](http://localhost:4040/api/info)

### Download API Specifications
- **JSON Format**: [http://localhost:4040/api/swagger.json](http://localhost:4040/api/swagger.json)
- **Local File**: `./swagger-spec.json` (generated on server start)

## Quick Start

### 1. Authentication Flow
```javascript
// Register a new user
const registerResponse = await fetch('http://localhost:4040/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'securePassword',
    firstName: 'John',
    lastName: 'Doe'
  })
});

// Login to get JWT token
const loginResponse = await fetch('http://localhost:4040/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'securePassword'
  })
});

const { access_token } = await loginResponse.json();

// Use token for authenticated requests
const authHeaders = {
  'Content-Type': 'application/json',
  'X-HTTP-TOKEN': access_token
};
```

### 2. API Base Configuration
```javascript
const API_CONFIG = {
  baseURL: 'http://localhost:4040',
  headers: {
    'Content-Type': 'application/json',
    'X-HTTP-TOKEN': localStorage.getItem('jwt_token') // Store token securely
  }
};
```

## Core Features Integration

### User Management
```javascript
// Get user profile
const profile = await fetch(`${API_CONFIG.baseURL}/auth/profile`, {
  headers: API_CONFIG.headers
});

// Update user profile
const updateProfile = await fetch(`${API_CONFIG.baseURL}/users/profile`, {
  method: 'PATCH',
  headers: API_CONFIG.headers,
  body: JSON.stringify({
    bio: 'Updated bio',
    location: 'New York'
  })
});

// Get user leaderboard
const leaderboard = await fetch(`${API_CONFIG.baseURL}/users/leaderboard/xp`, {
  headers: API_CONFIG.headers
});
```

### Content Management

#### Articles
```javascript
// Create article
const article = await fetch(`${API_CONFIG.baseURL}/articles`, {
  method: 'POST',
  headers: API_CONFIG.headers,
  body: JSON.stringify({
    title: 'My Tech Article',
    content: 'Article content here...',
    summary: 'Brief summary',
    categoryId: 1,
    tags: ['tech', 'programming']
  })
});

// Get articles with pagination
const articles = await fetch(
  `${API_CONFIG.baseURL}/articles?page=1&limit=10&category=tech`
);
```

#### Posts (Social Feed)
```javascript
// Create post
const post = await fetch(`${API_CONFIG.baseURL}/posts`, {
  method: 'POST',
  headers: API_CONFIG.headers,
  body: JSON.stringify({
    content: 'My thoughts on the latest tech trends...',
    type: 'TEXT'
  })
});

// Get posts feed
const posts = await fetch(`${API_CONFIG.baseURL}/posts?page=1&limit=20`);
```

### Community Features

#### Cafés (Discussion Groups)
```javascript
// Get all cafés
const cafes = await fetch(`${API_CONFIG.baseURL}/cafes`);

// Join a café
const joinCafe = await fetch(`${API_CONFIG.baseURL}/cafes/1/join`, {
  method: 'POST',
  headers: API_CONFIG.headers
});

// Create café post
const cafePost = await fetch(`${API_CONFIG.baseURL}/cafes/1/posts`, {
  method: 'POST',
  headers: API_CONFIG.headers,
  body: JSON.stringify({
    content: 'Discussion topic for this café...'
  })
});
```

#### Forums
```javascript
// Get forums
const forums = await fetch(`${API_CONFIG.baseURL}/forums`);

// Join forum
const joinForum = await fetch(`${API_CONFIG.baseURL}/forums/1/join`, {
  method: 'POST',
  headers: API_CONFIG.headers
});
```

### Media Features

#### Podcasts
```javascript
// Get podcast playlists
const playlists = await fetch(`${API_CONFIG.baseURL}/podcasts/playlists`);

// Get episodes
const episodes = await fetch(`${API_CONFIG.baseURL}/podcasts/episodes`);

// Like an episode
const likeEpisode = await fetch(`${API_CONFIG.baseURL}/podcasts/episodes/1/like`, {
  method: 'POST',
  headers: API_CONFIG.headers
});
```

#### Bookmarks
```javascript
// Create bookmark
const bookmark = await fetch(`${API_CONFIG.baseURL}/bookmarks`, {
  method: 'POST',
  headers: API_CONFIG.headers,
  body: JSON.stringify({
    articleId: 1,
    note: 'Great article about React'
  })
});

// Get user bookmarks
const bookmarks = await fetch(`${API_CONFIG.baseURL}/bookmarks`, {
  headers: API_CONFIG.headers
});
```

## Internationalization Support

### Languages & Locations
```javascript
// Get supported languages
const languages = await fetch(`${API_CONFIG.baseURL}/languages`);

// Get countries
const countries = await fetch(`${API_CONFIG.baseURL}/countries`);

// Get cities for a country
const cities = await fetch(`${API_CONFIG.baseURL}/countries/1/cities`);
```

## Role-Based Access Control

### Understanding Roles
- **Global Roles**: ADMIN, SUPERVISOR, EDITOR, MEMBER
- **Café Roles**: BARISTA, THINKER, JOURNALIST, MEMBER

### Role Management
```javascript
// Get user's global roles
const globalRoles = await fetch(`${API_CONFIG.baseURL}/roles/user/1/global`, {
  headers: API_CONFIG.headers
});

// Get user's café roles
const cafeRoles = await fetch(`${API_CONFIG.baseURL}/roles/user/1/cafe/1`, {
  headers: API_CONFIG.headers
});

// Assign global role (admin only)
const assignRole = await fetch(`${API_CONFIG.baseURL}/roles/user/1/assign-global-role`, {
  method: 'POST',
  headers: API_CONFIG.headers,
  body: JSON.stringify({
    roleId: 2
  })
});
```

## Error Handling

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

### Error Response Format
```javascript
{
  "statusCode": 400,
  "message": ["email must be a valid email"],
  "error": "Bad Request"
}
```

### Error Handling Example
```javascript
async function apiRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...API_CONFIG.headers,
        ...options.headers
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'API request failed');
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}
```

## React Integration Example

### Custom Hook for API
```javascript
import { useState, useEffect } from 'react';

function useApi(url, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const result = await apiRequest(`${API_CONFIG.baseURL}${url}`, options);
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [url]);

  return { data, loading, error };
}

// Usage in component
function ArticlesList() {
  const { data: articles, loading, error } = useApi('/articles');

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {articles?.map(article => (
        <div key={article.id}>
          <h3>{article.title}</h3>
          <p>{article.summary}</p>
        </div>
      ))}
    </div>
  );
}
```

### Context for Authentication
```javascript
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('jwt_token'));

  useEffect(() => {
    if (token) {
      // Verify token and get user profile
      fetchUserProfile();
    }
  }, [token]);

  const login = async (email, password) => {
    const response = await fetch(`${API_CONFIG.baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (response.ok) {
      const { access_token } = await response.json();
      setToken(access_token);
      localStorage.setItem('jwt_token', access_token);
      await fetchUserProfile();
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('jwt_token');
  };

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}/auth/profile`, {
        headers: { 'X-HTTP-TOKEN': token }
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

## TypeScript Support

### API Response Types
```typescript
interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  bio?: string;
  location?: string;
  xpScore: number;
  createdAt: string;
  updatedAt: string;
}

interface Article {
  id: number;
  title: string;
  content: string;
  summary: string;
  authorId: number;
  author: User;
  categoryId: number;
  tags: string[];
  likesCount: number;
  bookmarksCount: number;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

### API Client
```typescript
class TechVerseAPI {
  private baseURL = 'http://localhost:4040';
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token && { 'X-HTTP-TOKEN': this.token }),
      ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  }

  // User methods
  async getProfile(): Promise<User> {
    return this.request<User>('/auth/profile');
  }

  async getArticles(params?: {
    page?: number;
    limit?: number;
    category?: string;
  }): Promise<ApiResponse<Article[]>> {
    const query = new URLSearchParams(params as any).toString();
    return this.request<ApiResponse<Article[]>>(`/articles?${query}`);
  }

  async createArticle(data: Partial<Article>): Promise<Article> {
    return this.request<Article>('/articles', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const api = new TechVerseAPI();
```

## Testing

### API Testing with Jest
```javascript
// api.test.js
import { api } from './api-client';

describe('TechVerse API', () => {
  beforeAll(() => {
    api.setToken('your-test-token');
  });

  test('should fetch user profile', async () => {
    const profile = await api.getProfile();
    expect(profile).toHaveProperty('id');
    expect(profile).toHaveProperty('email');
  });

  test('should fetch articles', async () => {
    const response = await api.getArticles({ page: 1, limit: 10 });
    expect(response.data).toBeInstanceOf(Array);
    expect(response.meta).toHaveProperty('page');
  });
});
```

## Best Practices

### 1. Token Management
- Store JWT tokens securely (consider using httpOnly cookies for sensitive apps)
- Implement token refresh logic
- Handle token expiration gracefully

### 2. API State Management
- Use React Query, SWR, or similar for caching and synchronization
- Implement optimistic updates for better UX
- Handle loading and error states consistently

### 3. Performance
- Implement pagination for large data sets
- Use debouncing for search inputs
- Cache static data (languages, countries)

### 4. Security
- Always validate user inputs
- Implement proper error boundaries
- Don't expose sensitive data in client-side code

## Support & Resources

- **Swagger Documentation**: http://localhost:4040/api/docs
- **API Information**: http://localhost:4040/api/info
- **Download Specifications**: http://localhost:4040/api/swagger.json
- **Example Endpoints**: http://localhost:4040/examples/*

For additional support or questions about the API integration, please refer to the comprehensive Swagger documentation or contact the development team.
