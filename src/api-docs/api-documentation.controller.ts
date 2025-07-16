import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('API Documentation')
@Controller('api')
export class ApiDocumentationController {
  @Get('info')
  @ApiOperation({ 
    summary: 'Get API information and available endpoints',
    description: 'Returns basic information about the TechVerse Café API including available endpoints and authentication requirements'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'API information',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'TechVerse Café API' },
        version: { type: 'string', example: '1.0.0' },
        description: { type: 'string' },
        documentation: { type: 'string', example: '/api/docs' },
        downloads: {
          type: 'object',
          properties: {
            json: { type: 'string', example: '/api/swagger.json' }
          }
        },
        features: {
          type: 'array',
          items: { type: 'string' }
        },
        authentication: {
          type: 'object',
          properties: {
            type: { type: 'string', example: 'JWT' },
            header: { type: 'string', example: 'X-HTTP-TOKEN' },
            description: { type: 'string' }
          }
        }
      }
    }
  })
  getApiInfo() {
    return {
      name: 'TechVerse Café API',
      version: '1.0.0',
      description: 'Backend API for TechVerse Café - A multilingual tech and media social platform',
      documentation: '/api/docs',
      downloads: {
        json: '/api/swagger.json'
      },
      features: [
        'JWT Authentication & Role-based Access Control',
        'Multi-language Support (Languages, Countries, Cities)',
        'Content Management (Articles, Posts)',
        'Community Management (Cafés - Discussion Groups)',
        'Mini Projects & Tasks System with TechCoin Payments',
        'Bookmarking System',
        'User Profiles & Social Features'
      ],
      authentication: {
        type: 'JWT',
        header: 'X-HTTP-TOKEN',
        description: 'Include JWT token in the X-HTTP-TOKEN header for authenticated requests'
      },
      roles: {
        global: ['ADMIN', 'SUPERVISOR', 'EDITOR', 'MEMBER'],
        cafe: ['BARISTA', 'THINKER', 'JOURNALIST', 'MEMBER']
      },
      baseUrl: {
        development: 'http://localhost:4040',
        production: 'https://api.techverse.cafe'
      },
      endpoints: {
        authentication: '/auth',
        users: '/users',
        articles: '/articles',
        posts: '/posts',
        cafes: '/cafes',
        projects: '/projects',
        bookmarks: '/bookmarks',
        languages: '/languages',
        countries: '/countries',
        roles: '/roles'
      }
    };
  }
}
