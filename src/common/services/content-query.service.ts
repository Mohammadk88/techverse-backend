import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

export interface LocalizationFilter {
  language_code?: string;
  country_code?: string;
}

export interface ContentPrioritization {
  exactMatch: any; // Exact language and country match
  languageMatch: any; // Same language, any country
  fallback: any; // Default content (en, or no specific locale)
}

@Injectable()
export class ContentQueryService {
  /**
   * Creates a localized where clause for content filtering
   * Priority order:
   * 1. Exact match: same language and country
   * 2. Language match: same language, any country
   * 3. Fallback: default language (en) or no specific locale
   */
  createLocalizedWhereClause(
    baseWhere: any = {},
    localization?: LocalizationFilter,
  ): any {
    if (!localization?.language_code && !localization?.country_code) {
      return baseWhere;
    }

    const { language_code, country_code } = localization;
    
    // Build prioritized OR conditions
    const localeConditions: any[] = [];

    // 1. Exact match (highest priority)
    if (language_code && country_code) {
      localeConditions.push({
        AND: [
          { language_code },
          { country_code }
        ]
      });
    }

    // 2. Language match with any country
    if (language_code) {
      localeConditions.push({
        AND: [
          { language_code },
          { country_code: null }
        ]
      });
    }

    // 3. Country match with any language
    if (country_code) {
      localeConditions.push({
        AND: [
          { language_code: null },
          { country_code }
        ]
      });
    }

    // 4. Fallback to default language
    localeConditions.push({
      language_code: 'en'
    });

    // 5. Fallback to no locale specified
    localeConditions.push({
      AND: [
        { language_code: null },
        { country_code: null }
      ]
    });

    return {
      ...baseWhere,
      OR: localeConditions
    };
  }

  /**
   * Creates an order by clause that prioritizes localized content
   * Items with exact locale match will appear first
   */
  createLocalizedOrderBy(
    baseOrderBy: any[] = [],
    localization?: LocalizationFilter,
  ): any[] {
    if (!localization?.language_code && !localization?.country_code) {
      return baseOrderBy;
    }

    const { language_code, country_code } = localization;
    const priorityOrderBy: any[] = [];

    // Create CASE statements for prioritization
    if (language_code && country_code) {
      // Exact match gets highest priority (1)
      priorityOrderBy.push({
        _relevance: {
          fields: ['language_code', 'country_code'],
          search: `${language_code} ${country_code}`,
          sort: 'desc'
        }
      });
    } else if (language_code) {
      // Language match gets priority
      priorityOrderBy.push({
        _relevance: {
          fields: ['language_code'],
          search: language_code,
          sort: 'desc'
        }
      });
    } else if (country_code) {
      // Country match gets priority
      priorityOrderBy.push({
        _relevance: {
          fields: ['country_code'],
          search: country_code,
          sort: 'desc'
        }
      });
    }

    return [...priorityOrderBy, ...baseOrderBy];
  }

  /**
   * Creates a raw SQL fragment for locale priority scoring
   * This can be used in complex queries where Prisma's query builder is insufficient
   */
  createLocalePrioritySQL(
    language_code?: string,
    country_code?: string,
  ): string {
    if (!language_code && !country_code) {
      return '0 as locale_priority';
    }

    let prioritySQL = 'CASE ';

    if (language_code && country_code) {
      prioritySQL += `WHEN language_code = '${language_code}' AND country_code = '${country_code}' THEN 100 `;
    }

    if (language_code) {
      prioritySQL += `WHEN language_code = '${language_code}' AND country_code IS NULL THEN 80 `;
      prioritySQL += `WHEN language_code = '${language_code}' THEN 70 `;
    }

    if (country_code) {
      prioritySQL += `WHEN country_code = '${country_code}' AND language_code IS NULL THEN 60 `;
      prioritySQL += `WHEN country_code = '${country_code}' THEN 50 `;
    }

    prioritySQL += `WHEN language_code = 'en' THEN 30 `;
    prioritySQL += `WHEN language_code IS NULL AND country_code IS NULL THEN 20 `;
    prioritySQL += `ELSE 10 END as locale_priority`;

    return prioritySQL;
  }

  /**
   * Groups results by their locale priority for advanced filtering
   */
  groupByLocalePriority<T extends { language_code?: string; country_code?: string }>(
    results: T[],
    localization?: LocalizationFilter,
  ): ContentPrioritization {
    const { language_code, country_code } = localization || {};

    const exactMatch: T[] = [];
    const languageMatch: T[] = [];
    const fallback: T[] = [];

    results.forEach((item) => {
      // Exact match
      if (
        language_code && 
        country_code && 
        item.language_code === language_code && 
        item.country_code === country_code
      ) {
        exactMatch.push(item);
      }
      // Language match
      else if (
        language_code && 
        item.language_code === language_code && 
        (!country_code || !item.country_code)
      ) {
        languageMatch.push(item);
      }
      // Fallback
      else {
        fallback.push(item);
      }
    });

    return {
      exactMatch,
      languageMatch,
      fallback,
    };
  }

  /**
   * Determines the best content items based on locale priority
   * Returns up to the specified limit with the highest priority items first
   */
  selectBestLocalizedContent<T extends { language_code?: string; country_code?: string }>(
    results: T[],
    localization?: LocalizationFilter,
    limit?: number,
  ): T[] {
    const grouped = this.groupByLocalePriority(results, localization);
    
    let selectedItems: T[] = [];
    
    // Add exact matches first
    selectedItems = [...selectedItems, ...grouped.exactMatch];
    
    // Add language matches if we need more items
    if (!limit || selectedItems.length < limit) {
      const remainingSlots = limit ? limit - selectedItems.length : grouped.languageMatch.length;
      selectedItems = [...selectedItems, ...grouped.languageMatch.slice(0, remainingSlots)];
    }
    
    // Add fallback items if we still need more
    if (!limit || selectedItems.length < limit) {
      const remainingSlots = limit ? limit - selectedItems.length : grouped.fallback.length;
      selectedItems = [...selectedItems, ...grouped.fallback.slice(0, remainingSlots)];
    }

    return selectedItems;
  }

  /**
   * Creates Prisma include/select options for localization fields
   */
  getLocalizationFields() {
    return {
      language_code: true,
      country_code: true,
      language: {
        select: {
          code: true,
          name: true,
          native_name: true,
          direction: true,
        },
      },
      countries: {
        select: {
          code: true,
          name: true,
        },
      },
    };
  }
}
