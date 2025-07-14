import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

export interface LocalizationFilter {
  languageCode?: string;
  countryCode?: string;
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
    if (!localization?.languageCode && !localization?.countryCode) {
      return baseWhere;
    }

    const { languageCode, countryCode } = localization;
    
    // Build prioritized OR conditions
    const localeConditions: any[] = [];

    // 1. Exact match (highest priority)
    if (languageCode && countryCode) {
      localeConditions.push({
        AND: [
          { languageCode },
          { countryCode }
        ]
      });
    }

    // 2. Language match with any country
    if (languageCode) {
      localeConditions.push({
        AND: [
          { languageCode },
          { countryCode: null }
        ]
      });
    }

    // 3. Country match with any language
    if (countryCode) {
      localeConditions.push({
        AND: [
          { languageCode: null },
          { countryCode }
        ]
      });
    }

    // 4. Fallback to default language
    localeConditions.push({
      languageCode: 'en'
    });

    // 5. Fallback to no locale specified
    localeConditions.push({
      AND: [
        { languageCode: null },
        { countryCode: null }
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
    if (!localization?.languageCode && !localization?.countryCode) {
      return baseOrderBy;
    }

    const { languageCode, countryCode } = localization;
    const priorityOrderBy: any[] = [];

    // Create CASE statements for prioritization
    if (languageCode && countryCode) {
      // Exact match gets highest priority (1)
      priorityOrderBy.push({
        _relevance: {
          fields: ['languageCode', 'countryCode'],
          search: `${languageCode} ${countryCode}`,
          sort: 'desc'
        }
      });
    } else if (languageCode) {
      // Language match gets priority
      priorityOrderBy.push({
        _relevance: {
          fields: ['languageCode'],
          search: languageCode,
          sort: 'desc'
        }
      });
    } else if (countryCode) {
      // Country match gets priority
      priorityOrderBy.push({
        _relevance: {
          fields: ['countryCode'],
          search: countryCode,
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
    languageCode?: string,
    countryCode?: string,
  ): string {
    if (!languageCode && !countryCode) {
      return '0 as locale_priority';
    }

    let prioritySQL = 'CASE ';

    if (languageCode && countryCode) {
      prioritySQL += `WHEN language_code = '${languageCode}' AND country_code = '${countryCode}' THEN 100 `;
    }

    if (languageCode) {
      prioritySQL += `WHEN language_code = '${languageCode}' AND country_code IS NULL THEN 80 `;
      prioritySQL += `WHEN language_code = '${languageCode}' THEN 70 `;
    }

    if (countryCode) {
      prioritySQL += `WHEN country_code = '${countryCode}' AND language_code IS NULL THEN 60 `;
      prioritySQL += `WHEN country_code = '${countryCode}' THEN 50 `;
    }

    prioritySQL += `WHEN language_code = 'en' THEN 30 `;
    prioritySQL += `WHEN language_code IS NULL AND country_code IS NULL THEN 20 `;
    prioritySQL += `ELSE 10 END as locale_priority`;

    return prioritySQL;
  }

  /**
   * Groups results by their locale priority for advanced filtering
   */
  groupByLocalePriority<T extends { languageCode?: string; countryCode?: string }>(
    results: T[],
    localization?: LocalizationFilter,
  ): ContentPrioritization {
    const { languageCode, countryCode } = localization || {};

    const exactMatch: T[] = [];
    const languageMatch: T[] = [];
    const fallback: T[] = [];

    results.forEach((item) => {
      // Exact match
      if (
        languageCode && 
        countryCode && 
        item.languageCode === languageCode && 
        item.countryCode === countryCode
      ) {
        exactMatch.push(item);
      }
      // Language match
      else if (
        languageCode && 
        item.languageCode === languageCode && 
        (!countryCode || !item.countryCode)
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
  selectBestLocalizedContent<T extends { languageCode?: string; countryCode?: string }>(
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
      languageCode: true,
      countryCode: true,
      language: {
        select: {
          code: true,
          name: true,
          nativeName: true,
          direction: true,
        },
      },
      country: {
        select: {
          code: true,
          name: true,
        },
      },
    };
  }
}
