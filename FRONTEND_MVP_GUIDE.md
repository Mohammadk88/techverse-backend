# TechVerse Frontend Integration Guide

## 🎯 MVP Features to Implement

Based on the cleaned backend, here are the exact features to implement in the frontend:

## 📱 Pages to Create

### 1. Wallet Page (`/wallet`)
**Components needed:**
- `WalletInfo` - Display TechCoin balance and XP
- `TransactionHistory` - Table of wallet transactions
- `BuyTechCoinModal` - Stripe integration for purchases

**API Integration:**
```typescript
// React Query hooks
const { data: wallet } = useQuery(['wallet'], () => api.get('/wallet'))
const { data: transactions } = useQuery(['transactions'], () => 
  api.get('/wallet/transactions'))
const buyTechCoin = useMutation((data) => api.post('/wallet/buy', data))
```

### 2. Challenges Page (`/challenges`)
**Components needed:**
- `ChallengeCard` - Display challenge info with join button
- `ChallengeList` - Grid of challenge cards
- `CreateChallengeModal` - Form to create new challenge
- `JoinChallengeModal` - Confirmation with entry fee

**API Integration:**
```typescript
const { data: challenges } = useQuery(['challenges'], () => 
  api.get('/challenges'))
const joinChallenge = useMutation(({id, message}) => 
  api.post(`/challenges/${id}/join`, {message}))
```

### 3. Projects Page (`/projects`)
**Components needed:**
- `ProjectCard` - Project summary with task count
- `ProjectList` - Grid of project cards
- `ProjectDetails` - Full project view with tasks
- `TaskCard` - Task info with apply button
- `TaskAssignmentModal` - Application form

**API Integration:**
```typescript
const { data: projects } = useQuery(['projects'], () => api.get('/projects'))
const { data: project } = useQuery(['project', id], () => 
  api.get(`/projects/${id}`))
const applyToTask = useMutation(({taskId, message}) => 
  api.post(`/projects/tasks/${taskId}/apply`, {message}))
```

### 4. Create Project Page (`/projects/create`)
**Components needed:**
- `CreateProjectForm` - Project details form
- `AddTaskForm` - Add tasks to project
- `TaskPreview` - Preview tasks before publishing

**API Integration:**
```typescript
const createProject = useMutation((data) => api.post('/projects', data))
const addTask = useMutation(({projectId, task}) => 
  api.post(`/projects/${projectId}/tasks`, task))
```

## 🔧 Tech Stack Recommendations

### Required Dependencies
```json
{
  "@tanstack/react-query": "^4.0.0",
  "react-hook-form": "^7.0.0",
  "react-hot-toast": "^2.0.0",
  "@stripe/stripe-js": "^2.0.0",
  "@stripe/react-stripe-js": "^2.0.0",
  "lucide-react": "^0.300.0"
}
```

### Folder Structure
```
src/
  pages/
    wallet/
      index.tsx - Wallet dashboard
      components/
        WalletInfo.tsx
        TransactionHistory.tsx
        BuyTechCoinModal.tsx
    challenges/
      index.tsx - Challenge listing
      [id].tsx - Challenge details
      components/
        ChallengeCard.tsx
        JoinChallengeModal.tsx
    projects/
      index.tsx - Project listing
      [id].tsx - Project details
      create.tsx - Create project
      components/
        ProjectCard.tsx
        TaskCard.tsx
        TaskAssignmentModal.tsx
  components/
    ui/ - Shared UI components
    layout/ - Header, Sidebar, Footer
  hooks/
    useApi.ts - Axios instance with auth
    useAuth.ts - Authentication state
  lib/
    api.ts - API endpoints
    utils.ts - Helper functions
```

## 🎨 UI Components Needed

### WalletInfo Component
```typescript
interface WalletInfoProps {
  balance: number;
  xp: number;
  onBuyCoins: () => void;
}

const WalletInfo: React.FC<WalletInfoProps> = ({ balance, xp, onBuyCoins }) => {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{balance} TechCoin</h2>
          <p className="text-gray-600">{xp} XP</p>
        </div>
        <button onClick={onBuyCoins} className="btn-primary">
          Buy TechCoin
        </button>
      </div>
    </div>
  );
};
```

### ChallengeCard Component
```typescript
interface Challenge {
  id: number;
  title: string;
  description: string;
  reward: number;
  entryFee: number;
  participantCount: number;
  status: 'OPEN' | 'CLOSED';
}

const ChallengeCard: React.FC<{challenge: Challenge; onJoin: () => void}> = 
  ({ challenge, onJoin }) => {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h3 className="font-bold text-lg">{challenge.title}</h3>
      <p className="text-gray-600 mb-4">{challenge.description}</p>
      <div className="flex justify-between items-center">
        <div>
          <span className="text-green-600 font-semibold">
            Reward: {challenge.reward} TC
          </span>
          <span className="text-orange-600 ml-4">
            Entry: {challenge.entryFee} TC
          </span>
        </div>
        <button onClick={onJoin} className="btn-primary">
          Join Challenge
        </button>
      </div>
    </div>
  );
};
```

### TaskCard Component
```typescript
interface Task {
  id: number;
  title: string;
  description: string;
  price: number;
  status: 'PENDING' | 'ASSIGNED' | 'DONE';
}

const TaskCard: React.FC<{task: Task; onApply: () => void}> = 
  ({ task, onApply }) => {
  return (
    <div className="border rounded-lg p-4">
      <h4 className="font-semibold">{task.title}</h4>
      <p className="text-gray-600 text-sm mb-3">{task.description}</p>
      <div className="flex justify-between items-center">
        <span className="text-green-600 font-semibold">{task.price} TC</span>
        {task.status === 'PENDING' && (
          <button onClick={onApply} className="btn-sm btn-primary">
            Apply
          </button>
        )}
      </div>
    </div>
  );
};
```

## 🔐 Authentication Integration

### API Setup
```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4040',
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

### React Query Setup
```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <YourAppComponents />
    </QueryClientProvider>
  );
}
```

## 💳 Stripe Integration for TechCoin

### Setup
```typescript
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

const BuyTechCoinModal: React.FC = () => {
  const buyTechCoin = useMutation(async (amount: number) => {
    const response = await api.post('/wallet/buy', { 
      amount, 
      paymentMethod: 'stripe' 
    });
    return response.data;
  });

  return (
    // Stripe payment form implementation
  );
};
```

## 🎯 Priority Implementation Order

1. **Setup base structure** (API, React Query, routing)
2. **Implement Wallet page** (easiest, shows TechCoin economy)
3. **Implement Challenges page** (demonstrates competition system)
4. **Implement Projects browsing** (task marketplace)
5. **Implement Project creation** (content creation)
6. **Add Stripe integration** (monetization)
7. **Polish UI/UX** (loading states, error handling)

## 📊 Success Metrics

The MVP frontend should enable users to:
- ✅ View and manage their TechCoin wallet
- ✅ Browse and join programming challenges
- ✅ Discover and apply to project tasks
- ✅ Create projects and add tasks
- ✅ Purchase TechCoin to participate
- ✅ See their progress and earnings

This provides a complete MVP experience for the TechVerse platform! 🚀
