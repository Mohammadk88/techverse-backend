-- إنشاء فئة مقالات
INSERT INTO "article_categories" (name, slug, description) VALUES 
('Technology', 'technology', 'تكنولوجيا وبرمجة');

-- إنشاء مقال تجريبي
INSERT INTO "articles" (title, slug, content, excerpt, "category_id", "author_id", "is_published", "published_at", "language_code", "country_code", "created_at", "updated_at") VALUES 
('مقال تجريبي للجدولة والتعزيز', 'maqal-tajribi-liljadwala-waltaeziz', 'هذا مقال تجريبي لاختبار نظام الجدولة والتعزيز الجديد في TechVerse. يحتوي على معلومات مفيدة حول تطوير البرمجيات والتقنيات الحديثة.', 'مقال تجريبي لنظام الجدولة', 1, 61, true, NOW(), 'ar', 'SA', NOW(), NOW());
