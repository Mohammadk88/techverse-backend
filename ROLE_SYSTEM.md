# Enhanced Role-Based Access Control System

## Overview

The TechVerse Café platform now includes a comprehensive two-tier role-based access control system that supports both global platform roles and café-specific roles.

## Role Types

### Global Roles (Platform-wide)
- **ADMIN**: Full platform administration access
- **SUPERVISOR**: Platform moderation and oversight capabilities  
- **EDITOR**: Content management and editorial permissions
- **MEMBER**: Basic platform member access

### Café Roles (Community-specific)
- **BARISTA**: Café management and moderation powers
- **THINKER**: Content creation and curation within the café
- **JOURNALIST**: News and article publishing within the café
- **MEMBER**: Basic café member participation

## Database Schema

### Tables
- `global_roles`: Stores global role definitions
- `user_global_roles`: Many-to-many relationship between users and global roles
- `cafe_roles`: Stores café-specific role definitions  
- `user_cafe_roles`: Many-to-many relationship between users, cafés, and café roles

### Key Relationships
- Users can have multiple global roles
- Users can have different roles in different cafés
- Roles are hierarchical but flexible for different contexts

## API Endpoints

### Global Role Management
```
GET /roles/global - List all global roles
POST /roles/global - Create new global role
POST /roles/user/:id/assign-global-role - Assign global role to user
DELETE /roles/user/:id/remove-global-role/:roleId - Remove global role from user
GET /roles/user/:id/global - Get user's global roles
```

### Café Role Management
```
GET /roles/cafe - List all café roles
POST /roles/cafe - Create new café role
POST /roles/cafe/:cafeId/assign-role - Assign café role to user
DELETE /roles/cafe/:cafeId/remove-role/:userId/:roleId - Remove café role from user
GET /roles/user/:id/cafe - Get all user's café roles
GET /roles/user/:id/cafe/:cafeId - Get user's roles for specific café
```

## Usage in Controllers

### Using Role Decorators

```typescript
import { GlobalRoles, CafeRoles, GLOBAL_ROLES, CAFE_ROLES } from '../auth/decorators/enhanced-roles.decorator';
import { EnhancedRolesGuard } from '../auth/guards/enhanced-roles.guard';

@UseGuards(JwtAuthGuard, EnhancedRolesGuard)
@Controller('example')
export class ExampleController {
  
  // Global role requirement
  @GlobalRoles(GLOBAL_ROLES.ADMIN)
  @Get('admin-only')
  async adminOnlyEndpoint() {
    // Only global admins can access
  }
  
  // Multiple global roles (OR logic)
  @GlobalRoles(GLOBAL_ROLES.ADMIN, GLOBAL_ROLES.EDITOR)
  @Get('content-management')
  async contentManagement() {
    // Admins OR editors can access
  }
  
  // Café role requirement
  @CafeRoles(CAFE_ROLES.BARISTA)
  @Get('cafe/:cafeId/moderate')
  async moderateCafe(@Param('cafeId') cafeId: number) {
    // Only baristas of this specific café can access
  }
  
  // Mixed requirements (global OR café roles)
  @GlobalRoles(GLOBAL_ROLES.ADMIN, GLOBAL_ROLES.SUPERVISOR)
  @CafeRoles(CAFE_ROLES.BARISTA)
  @Post('cafe/:cafeId/action')
  async performAction(@Param('cafeId') cafeId: number) {
    // Global admins/supervisors OR café baristas can access
  }
}
```

### Guard Logic

The `EnhancedRolesGuard` works as follows:

1. **No roles specified**: Access granted to all authenticated users
2. **Global roles only**: User must have at least one of the specified global roles
3. **Café roles only**: User must have at least one of the specified café roles for the target café
4. **Both specified**: User needs EITHER the global role OR the café role (OR logic)

### Café ID Extraction

The guard automatically extracts café ID from:
- Route parameters: `:cafeId` or `:id`
- Request body: `cafeId` field

## Permission Examples

### Content Management
```typescript
// Global editors can manage any content
@GlobalRoles(GLOBAL_ROLES.EDITOR)
@Patch('articles/:id')
async updateArticle() {}

// Café journalists can manage café content
@CafeRoles(CAFE_ROLES.JOURNALIST)  
@Post('cafe/:cafeId/articles')
async createCafeArticle() {}
```

### Moderation
```typescript
// Global supervisors or café baristas can moderate
@GlobalRoles(GLOBAL_ROLES.SUPERVISOR)
@CafeRoles(CAFE_ROLES.BARISTA)
@Delete('cafe/:cafeId/posts/:postId')
async moderatePost() {}
```

### Administrative Functions
```typescript
// Only global admins can access platform settings
@GlobalRoles(GLOBAL_ROLES.ADMIN)
@Get('admin/settings')
async getPlatformSettings() {}
```

## Default Role Assignment

### Seeded Roles
The system comes with pre-seeded default roles:

**Global Roles:**
- ADMIN, SUPERVISOR, EDITOR, MEMBER

**Café Roles:**  
- BARISTA, THINKER, JOURNALIST, MEMBER

### Initial Admin User
- The first user (ID: 1) is automatically assigned the ADMIN global role
- Admin users can then assign roles to other users

## Best Practices

### Role Granularity
- Use global roles for platform-wide permissions
- Use café roles for community-specific permissions
- Combine both for flexible access control

### Security Considerations
- Always use both `JwtAuthGuard` and `EnhancedRolesGuard`
- Validate café ownership/membership before role assignments
- Log role changes for audit trails

### Performance Tips
- The guard efficiently checks roles using database queries
- Consider caching user roles for high-traffic endpoints
- Use specific role requirements rather than broad permissions

## Testing Role Access

Use the `/examples` endpoints to test different role scenarios:

1. `/examples/admin-only` - Global admin access only
2. `/examples/cafe/:cafeId/barista-only` - Café barista access only  
3. `/examples/cafe/:cafeId/moderate` - Mixed global/café role access
4. `/examples/public` - No role requirements

## Migration Information

- Migration: `20250711192721_add_role_based_access_control`
- Database changes: 4 new tables added
- Backward compatibility: Existing authentication continues to work
- Seed data: Default roles and admin assignment included
