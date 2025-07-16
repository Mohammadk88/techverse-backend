-- CreateEnum
CREATE TYPE "scheduled_post_status" AS ENUM ('SCHEDULED', 'PUBLISHED', 'CANCELED');

-- CreateEnum
CREATE TYPE "ai_enhancement_types" AS ENUM ('TITLE_OPTIMIZATION', 'SUMMARY_GENERATION', 'SEO_TAGS', 'FULL_ENHANCEMENT');

-- CreateTable
CREATE TABLE "scheduled_posts" (
    "id" SERIAL NOT NULL,
    "article_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "publish_at" TIMESTAMP(3) NOT NULL,
    "ai_enhanced" BOOLEAN NOT NULL DEFAULT false,
    "status" "scheduled_post_status" NOT NULL DEFAULT 'SCHEDULED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scheduled_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "article_boosts" (
    "id" SERIAL NOT NULL,
    "article_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "coin_spent" INTEGER NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "article_boosts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "article_ai_enhancements" (
    "id" SERIAL NOT NULL,
    "article_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "enhancement_type" "ai_enhancement_types" NOT NULL,
    "original_value" TEXT NOT NULL,
    "enhanced_value" TEXT NOT NULL,
    "coin_spent" INTEGER NOT NULL,
    "is_applied" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "article_ai_enhancements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "scheduled_posts_publish_at_status_idx" ON "scheduled_posts"("publish_at", "status");

-- CreateIndex
CREATE UNIQUE INDEX "scheduled_posts_article_id_key" ON "scheduled_posts"("article_id");

-- CreateIndex
CREATE INDEX "article_boosts_start_date_end_date_idx" ON "article_boosts"("start_date", "end_date");

-- CreateIndex
CREATE INDEX "article_boosts_article_id_idx" ON "article_boosts"("article_id");

-- CreateIndex
CREATE INDEX "article_ai_enhancements_article_id_enhancement_type_idx" ON "article_ai_enhancements"("article_id", "enhancement_type");

-- AddForeignKey
ALTER TABLE "scheduled_posts" ADD CONSTRAINT "scheduled_posts_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scheduled_posts" ADD CONSTRAINT "scheduled_posts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_boosts" ADD CONSTRAINT "article_boosts_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_boosts" ADD CONSTRAINT "article_boosts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_ai_enhancements" ADD CONSTRAINT "article_ai_enhancements_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_ai_enhancements" ADD CONSTRAINT "article_ai_enhancements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
