import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';
import { ConfigService } from '@nestjs/config';
import { AIKeysService } from '../ai-keys/ai-keys.service';
import { PrismaService } from '../database/prisma.service';
import { AIProvider } from '../common/enums/ai-provider.enum';

export interface AIArticleResponse {
  title: string;
  content: string;
  excerpt: string;
}

export interface AIPostResponse {
  content: string;
}

interface AIArticleJsonResponse {
  title: string;
  content: string;
  excerpt: string;
}

interface AIPostJsonResponse {
  content: string;
}

interface AISuggestionsJsonResponse {
  suggestions: string[];
}

@Injectable()
export class AIService {
  private openai: OpenAI | null = null;
  private gemini: GoogleGenerativeAI | null = null;
  private claude: Anthropic | null = null;

  constructor(
    private configService: ConfigService,
    private aiKeysService: AIKeysService,
    private prisma: PrismaService,
  ) {
    this.initializeProviders();
  }

  private initializeProviders() {
    // Initialize OpenAI
    const openaiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (openaiKey) {
      this.openai = new OpenAI({ apiKey: openaiKey });
    }

    // Initialize Gemini
    const geminiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (geminiKey) {
      this.gemini = new GoogleGenerativeAI(geminiKey);
    }

    // Initialize Claude
    const claudeKey = this.configService.get<string>('CLAUDE_API_KEY');
    if (claudeKey) {
      this.claude = new Anthropic({ apiKey: claudeKey });
    }
  }

  // Dynamic provider initialization with user/system keys
  private async initializeProvider(
    providerName: string,
    userId?: number,
  ): Promise<{
    openai: OpenAI | null;
    gemini: GoogleGenerativeAI | null;
    claude: Anthropic | null;
  }> {
    // Get provider from database
    const provider = await this.prisma.aIProvider.findFirst({
      where: { name: providerName, isActive: true },
    });

    if (!provider) {
      throw new HttpException(
        `AI provider ${providerName} not found or inactive`,
        HttpStatus.BAD_REQUEST,
      );
    }

    // Get API key from our key management system
    const apiKey = await this.aiKeysService.getApiKeyForProvider(
      provider.id,
      userId,
    );

    if (!apiKey) {
      throw new HttpException(
        `No API key available for ${providerName}. Please configure a system key or add your own API key.`,
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    // Initialize the appropriate client
    const result = {
      openai: null as OpenAI | null,
      gemini: null as GoogleGenerativeAI | null,
      claude: null as Anthropic | null,
    };

    switch (providerName) {
      case 'openai':
        result.openai = new OpenAI({ apiKey });
        break;
      case 'gemini':
        result.gemini = new GoogleGenerativeAI(apiKey);
        break;
      case 'claude':
        result.claude = new Anthropic({ apiKey });
        break;
    }

    return result;
  }

  private validateProvider(provider: AIProvider): void {
    switch (provider) {
      case AIProvider.OPENAI:
        if (!this.openai) {
          throw new HttpException(
            'OpenAI not configured. Please set OPENAI_API_KEY.',
            HttpStatus.SERVICE_UNAVAILABLE,
          );
        }
        break;
      case AIProvider.GEMINI:
        if (!this.gemini) {
          throw new HttpException(
            'Gemini not configured. Please set GEMINI_API_KEY.',
            HttpStatus.SERVICE_UNAVAILABLE,
          );
        }
        break;
      case AIProvider.CLAUDE:
        if (!this.claude) {
          throw new HttpException(
            'Claude not configured. Please set CLAUDE_API_KEY.',
            HttpStatus.SERVICE_UNAVAILABLE,
          );
        }
        break;
      default:
        throw new HttpException(
          'Unsupported AI provider',
          HttpStatus.BAD_REQUEST,
        );
    }
  }

  private sanitizePrompt(prompt: string): string {
    // Basic prompt sanitization
    return prompt.trim().substring(0, 1000);
  }

  private sanitizeResponse(response: string): string {
    // Basic response sanitization
    return response.trim();
  }

  async generateArticle(
    prompt: string,
    provider: AIProvider = AIProvider.OPENAI,
    topic?: string,
    userId?: number,
  ): Promise<AIArticleResponse> {
    const sanitizedPrompt = this.sanitizePrompt(prompt);
    
    // For enhanced functionality, use dynamic provider initialization
    if (userId !== undefined) {
      return this.generateArticleWithDynamicProvider(
        sanitizedPrompt,
        provider,
        topic,
        userId,
      );
    }

    // Fall back to legacy behavior for backward compatibility
    this.validateProvider(provider);

    switch (provider) {
      case AIProvider.OPENAI:
        return this.useOpenAIForArticle(sanitizedPrompt, topic);
      case AIProvider.GEMINI:
        return this.useGeminiForArticle(sanitizedPrompt, topic);
      case AIProvider.CLAUDE:
        return this.useClaudeForArticle(sanitizedPrompt, topic);
      default:
        throw new HttpException('Unsupported provider', HttpStatus.BAD_REQUEST);
    }
  }

  async generatePost(
    prompt: string,
    provider: AIProvider = AIProvider.OPENAI,
    mood?: string,
    userId?: number,
  ): Promise<AIPostResponse> {
    const sanitizedPrompt = this.sanitizePrompt(prompt);
    
    // For enhanced functionality, use dynamic provider initialization
    if (userId !== undefined) {
      return this.generatePostWithDynamicProvider(
        sanitizedPrompt,
        provider,
        mood,
        userId,
      );
    }

    // Fall back to legacy behavior for backward compatibility
    this.validateProvider(provider);

    switch (provider) {
      case AIProvider.OPENAI:
        return this.useOpenAIForPost(sanitizedPrompt, mood);
      case AIProvider.GEMINI:
        return this.useGeminiForPost(sanitizedPrompt, mood);
      case AIProvider.CLAUDE:
        return this.useClaudeForPost(sanitizedPrompt, mood);
      default:
        throw new HttpException('Unsupported provider', HttpStatus.BAD_REQUEST);
    }
  }

  // Enhanced article generation with dynamic provider initialization
  private async generateArticleWithDynamicProvider(
    prompt: string,
    provider: AIProvider,
    topic?: string,
    userId?: number,
  ): Promise<AIArticleResponse> {
    const providerName = provider.toLowerCase();
    const clients = await this.initializeProvider(providerName, userId);

    switch (provider) {
      case AIProvider.OPENAI: {
        if (!clients.openai) {
          throw new HttpException(
            'OpenAI client not available',
            HttpStatus.SERVICE_UNAVAILABLE,
          );
        }
        // Use the dynamic client instead of the static one
        const tempOpenai = this.openai;
        this.openai = clients.openai;
        const result = await this.useOpenAIForArticle(prompt, topic);
        this.openai = tempOpenai; // Restore original
        return result;
      }
      case AIProvider.GEMINI: {
        if (!clients.gemini) {
          throw new HttpException(
            'Gemini client not available',
            HttpStatus.SERVICE_UNAVAILABLE,
          );
        }
        const tempGemini = this.gemini;
        this.gemini = clients.gemini;
        const geminiResult = await this.useGeminiForArticle(prompt, topic);
        this.gemini = tempGemini;
        return geminiResult;
      }
      case AIProvider.CLAUDE: {
        if (!clients.claude) {
          throw new HttpException(
            'Claude client not available',
            HttpStatus.SERVICE_UNAVAILABLE,
          );
        }
        const tempClaude = this.claude;
        this.claude = clients.claude;
        const claudeResult = await this.useClaudeForArticle(prompt, topic);
        this.claude = tempClaude;
        return claudeResult;
      }
      default:
        throw new HttpException('Unsupported provider', HttpStatus.BAD_REQUEST);
    }
  }

  // Enhanced post generation with dynamic provider initialization
  private async generatePostWithDynamicProvider(
    prompt: string,
    provider: AIProvider,
    mood?: string,
    userId?: number,
  ): Promise<AIPostResponse> {
    const providerName = provider.toLowerCase();
    const clients = await this.initializeProvider(providerName, userId);

    switch (provider) {
      case AIProvider.OPENAI: {
        if (!clients.openai) {
          throw new HttpException(
            'OpenAI client not available',
            HttpStatus.SERVICE_UNAVAILABLE,
          );
        }
        const tempOpenai = this.openai;
        this.openai = clients.openai;
        const result = await this.useOpenAIForPost(prompt, mood);
        this.openai = tempOpenai;
        return result;
      }
      case AIProvider.GEMINI: {
        if (!clients.gemini) {
          throw new HttpException(
            'Gemini client not available',
            HttpStatus.SERVICE_UNAVAILABLE,
          );
        }
        const tempGemini = this.gemini;
        this.gemini = clients.gemini;
        const geminiResult = await this.useGeminiForPost(prompt, mood);
        this.gemini = tempGemini;
        return geminiResult;
      }
      case AIProvider.CLAUDE: {
        if (!clients.claude) {
          throw new HttpException(
            'Claude client not available',
            HttpStatus.SERVICE_UNAVAILABLE,
          );
        }
        const tempClaude = this.claude;
        this.claude = clients.claude;
        const claudeResult = await this.useClaudeForPost(prompt, mood);
        this.claude = tempClaude;
        return claudeResult;
      }
      default:
        throw new HttpException('Unsupported provider', HttpStatus.BAD_REQUEST);
    }
  }

  // OpenAI Implementation
  private async useOpenAIForArticle(
    prompt: string,
    topic?: string,
  ): Promise<AIArticleResponse> {
    try {
      const systemPrompt = `You are a skilled technical writer for TechVerse Café, a platform for tech enthusiasts. 
      Generate high-quality, engaging articles about technology topics. 
      Focus on making complex topics accessible and interesting.
      
      Return a JSON object with:
      - title: A compelling, SEO-friendly title (max 80 characters)
      - content: Well-structured article content (800-1500 words) with markdown formatting
      - excerpt: A brief summary (150-200 characters) that entices readers
      
      Make sure the content is:
      - Original and informative
      - Well-structured with headings
      - Includes practical examples or use cases
      - Written in an engaging, conversational tone
      - Suitable for developers and tech enthusiasts`;

      const userPrompt = topic
        ? `Write an article about: ${prompt}. Focus specifically on: ${topic}`
        : `Write an article about: ${prompt}`;

      const completion = await this.openai!.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 2500,
        response_format: { type: 'json_object' },
      });

      const response = completion.choices[0].message.content;
      if (!response) {
        throw new Error('Empty response from OpenAI');
      }

      let parsed: AIArticleJsonResponse;
      try {
        parsed = JSON.parse(response) as AIArticleJsonResponse;
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError, 'Response:', response);
        throw new Error('Invalid JSON response from OpenAI');
      }

      // Validate response structure
      if (!parsed.title || !parsed.content || !parsed.excerpt) {
        throw new Error('Invalid response format from AI');
      }

      return {
        title: this.sanitizeResponse(parsed.title.substring(0, 200)),
        content: this.sanitizeResponse(parsed.content),
        excerpt: this.sanitizeResponse(parsed.excerpt.substring(0, 500)),
      };
    } catch (error) {
      console.error('OpenAI Article Generation Error:', error);
      throw new HttpException(
        'Failed to generate article with OpenAI',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async useOpenAIForPost(
    prompt: string,
    mood?: string,
  ): Promise<AIPostResponse> {
    try {
      const systemPrompt = `You are a social media content creator for TechVerse Café, a tech community platform.
      Generate engaging, concise social media posts for tech enthusiasts.
      
      Return a JSON object with:
      - content: A compelling social media post (50-280 characters) 
      
      Make sure the post is:
      - Engaging and thought-provoking
      - Tech-focused but accessible
      - Includes relevant hashtags
      - Encourages discussion
      - Matches the requested mood/tone`;

      const moodInstruction = mood
        ? `Write in a ${mood} tone/mood.`
        : 'Write in an engaging, professional tone.';

      const userPrompt = `Create a social media post about: ${prompt}. ${moodInstruction}`;

      const completion = await this.openai!.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.8,
        max_tokens: 200,
        response_format: { type: 'json_object' },
      });

      const response = completion.choices[0].message.content;
      if (!response) {
        throw new Error('Empty response from OpenAI');
      }

      let parsed: AIPostJsonResponse;
      try {
        parsed = JSON.parse(response) as AIPostJsonResponse;
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError, 'Response:', response);
        throw new Error('Invalid JSON response from OpenAI');
      }

      if (!parsed.content) {
        throw new Error('Invalid response format from AI');
      }

      return {
        content: this.sanitizeResponse(parsed.content.substring(0, 1000)),
      };
    } catch (error) {
      console.error('OpenAI Post Generation Error:', error);
      throw new HttpException(
        'Failed to generate post with OpenAI',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Gemini Implementation
  private async useGeminiForArticle(
    prompt: string,
    topic?: string,
  ): Promise<AIArticleResponse> {
    try {
      const model = this.gemini!.getGenerativeModel({ model: 'gemini-pro' });

      const systemPrompt = `You are a skilled technical writer for TechVerse Café, a platform for tech enthusiasts. 
      Generate high-quality, engaging articles about technology topics in JSON format.
      
      Return only a JSON object with:
      - title: A compelling, SEO-friendly title (max 80 characters)
      - content: Well-structured article content (800-1500 words) with markdown formatting
      - excerpt: A brief summary (150-200 characters) that entices readers`;

      const userPrompt = topic
        ? `${systemPrompt}\n\nWrite an article about: ${prompt}. Focus specifically on: ${topic}`
        : `${systemPrompt}\n\nWrite an article about: ${prompt}`;

      const result = await model.generateContent(userPrompt);
      const response = result.response.text();

      if (!response) {
        throw new Error('Empty response from Gemini');
      }

      // Extract JSON from response (Gemini might include extra text)
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in Gemini response');
      }

      const parsed = JSON.parse(jsonMatch[0]) as AIArticleJsonResponse;

      return {
        title: this.sanitizeResponse(parsed.title.substring(0, 200)),
        content: this.sanitizeResponse(parsed.content),
        excerpt: this.sanitizeResponse(parsed.excerpt.substring(0, 500)),
      };
    } catch (error) {
      console.error('Gemini Article Generation Error:', error);
      throw new HttpException(
        'Failed to generate article with Gemini',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async useGeminiForPost(
    prompt: string,
    mood?: string,
  ): Promise<AIPostResponse> {
    try {
      const model = this.gemini!.getGenerativeModel({ model: 'gemini-pro' });

      const moodInstruction = mood
        ? `Write in a ${mood} tone/mood.`
        : 'Write in an engaging, professional tone.';

      const systemPrompt = `You are a social media content creator for TechVerse Café, a tech community platform.
      Generate engaging, concise social media posts for tech enthusiasts in JSON format.
      
      Return only a JSON object with:
      - content: A compelling social media post (50-280 characters)
      
      ${moodInstruction}`;

      const userPrompt = `${systemPrompt}\n\nCreate a social media post about: ${prompt}`;

      const result = await model.generateContent(userPrompt);
      const response = result.response.text();

      if (!response) {
        throw new Error('Empty response from Gemini');
      }

      // Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in Gemini response');
      }

      const parsed = JSON.parse(jsonMatch[0]) as AIPostJsonResponse;

      return {
        content: this.sanitizeResponse(parsed.content.substring(0, 1000)),
      };
    } catch (error) {
      console.error('Gemini Post Generation Error:', error);
      throw new HttpException(
        'Failed to generate post with Gemini',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Claude Implementation
  private async useClaudeForArticle(
    prompt: string,
    topic?: string,
  ): Promise<AIArticleResponse> {
    try {
      const systemPrompt = `You are a skilled technical writer for TechVerse Café, a platform for tech enthusiasts. 
      Generate high-quality, engaging articles about technology topics.
      
      Return only a JSON object with:
      - title: A compelling, SEO-friendly title (max 80 characters)
      - content: Well-structured article content (800-1500 words) with markdown formatting
      - excerpt: A brief summary (150-200 characters) that entices readers
      
      Make sure the content is original, informative, well-structured with headings, and includes practical examples.`;

      const userPrompt = topic
        ? `Write an article about: ${prompt}. Focus specifically on: ${topic}`
        : `Write an article about: ${prompt}`;

      const response = await this.claude!.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 2500,
        temperature: 0.7,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      });

      const content = response.content[0];
      if (content.type !== 'text' || !content.text) {
        throw new Error('Invalid response format from Claude');
      }

      // Extract JSON from response
      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in Claude response');
      }

      const parsed = JSON.parse(jsonMatch[0]) as AIArticleJsonResponse;

      return {
        title: this.sanitizeResponse(parsed.title.substring(0, 200)),
        content: this.sanitizeResponse(parsed.content),
        excerpt: this.sanitizeResponse(parsed.excerpt.substring(0, 500)),
      };
    } catch (error) {
      console.error('Claude Article Generation Error:', error);
      throw new HttpException(
        'Failed to generate article with Claude',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async useClaudeForPost(
    prompt: string,
    mood?: string,
  ): Promise<AIPostResponse> {
    try {
      const moodInstruction = mood
        ? `Write in a ${mood} tone/mood.`
        : 'Write in an engaging, professional tone.';

      const systemPrompt = `You are a social media content creator for TechVerse Café, a tech community platform.
      Generate engaging, concise social media posts for tech enthusiasts.
      
      Return only a JSON object with:
      - content: A compelling social media post (50-280 characters)
      
      ${moodInstruction} Make sure the post includes relevant hashtags and encourages discussion.`;

      const userPrompt = `Create a social media post about: ${prompt}`;

      const response = await this.claude!.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 200,
        temperature: 0.8,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      });

      const content = response.content[0];
      if (content.type !== 'text' || !content.text) {
        throw new Error('Invalid response format from Claude');
      }

      // Extract JSON from response
      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in Claude response');
      }

      const parsed = JSON.parse(jsonMatch[0]) as AIPostJsonResponse;

      return {
        content: this.sanitizeResponse(parsed.content.substring(0, 1000)),
      };
    } catch (error) {
      console.error('Claude Post Generation Error:', error);
      throw new HttpException(
        'Failed to generate post with Claude',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async generateContentSuggestions(
    type: 'article' | 'post',
    category?: string,
  ): Promise<string[]> {
    if (!this.openai) {
      return this.getFallbackSuggestions(type);
    }

    try {
      const systemPrompt = `You are a content strategy expert for TechVerse Café, a tech community platform.
      Generate creative, relevant content ideas for ${type}s.
      
      Return a JSON object with:
      - suggestions: Array of 5-7 content ideas (each 10-50 words)
      
      Ideas should be:
      - Current and trending in tech
      - Engaging for developers and tech enthusiasts
      - Specific enough to be actionable
      - Varied in scope and difficulty`;

      const categoryFilter = category ? ` in the ${category} category` : '';
      const userPrompt = `Generate content ideas for ${type}s${categoryFilter} for a tech community platform.`;

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.9,
        max_tokens: 300,
        response_format: { type: 'json_object' },
      });

      const response = completion.choices[0].message.content;
      if (!response) {
        return this.getFallbackSuggestions(type);
      }

      const parsed = JSON.parse(response) as AISuggestionsJsonResponse;
      return parsed.suggestions || this.getFallbackSuggestions(type);
    } catch (error) {
      console.error('AI Content Suggestions Error:', error);
      return this.getFallbackSuggestions(type);
    }
  }

  private getFallbackSuggestions(type: 'article' | 'post'): string[] {
    const articleSuggestions = [
      "Getting Started with TypeScript: A Developer's Guide",
      'Building Scalable APIs with NestJS',
      'Docker Best Practices for Development',
      'Modern JavaScript Features You Should Know',
      'Database Design Patterns for Web Applications',
    ];

    const postSuggestions = [
      "What's your favorite debugging technique? Share below! 🐛",
      'Hot take: Code comments are more important than clean code. Agree? 💭',
      'Which programming language are you learning next? 🚀',
      'Share your best productivity tool for coding! ⚡',
      "What's the biggest lesson you learned as a developer? 📚",
    ];

    return type === 'article' ? articleSuggestions : postSuggestions;
  }

  getAvailableProviders() {
    return {
      openai: {
        available: !!this.openai,
        status: this.openai ? 'configured' : 'not configured - missing OPENAI_API_KEY',
      },
      gemini: {
        available: !!this.gemini,
        status: this.gemini ? 'configured' : 'not configured - missing GEMINI_API_KEY',
      },
      claude: {
        available: !!this.claude,
        status: this.claude ? 'configured' : 'not configured - missing CLAUDE_API_KEY',
      },
      default: AIProvider.OPENAI,
    };
  }
}
