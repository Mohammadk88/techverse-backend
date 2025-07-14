-- AlterTable
ALTER TABLE "articles" ADD COLUMN     "country_code" TEXT,
ADD COLUMN     "featured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "language_code" TEXT DEFAULT 'en';

-- AlterTable
ALTER TABLE "cafes" ADD COLUMN     "country_code" TEXT,
ADD COLUMN     "language_code" TEXT DEFAULT 'en';

-- AlterTable
ALTER TABLE "forums" ADD COLUMN     "country_code" TEXT,
ADD COLUMN     "language_code" TEXT DEFAULT 'en';

-- AlterTable
ALTER TABLE "playlists" ADD COLUMN     "country_code" TEXT,
ADD COLUMN     "language_code" TEXT DEFAULT 'en';

-- AlterTable
ALTER TABLE "posts" ADD COLUMN     "country_code" TEXT,
ADD COLUMN     "language_code" TEXT DEFAULT 'en';

-- CreateIndex
CREATE INDEX "articles_language_code_idx" ON "articles"("language_code");

-- CreateIndex
CREATE INDEX "articles_country_code_idx" ON "articles"("country_code");

-- CreateIndex
CREATE INDEX "articles_language_code_country_code_idx" ON "articles"("language_code", "country_code");

-- CreateIndex
CREATE INDEX "articles_featured_idx" ON "articles"("featured");

-- CreateIndex
CREATE INDEX "articles_is_published_idx" ON "articles"("is_published");

-- CreateIndex
CREATE INDEX "articles_published_at_idx" ON "articles"("published_at");

-- CreateIndex
CREATE INDEX "cafes_language_code_idx" ON "cafes"("language_code");

-- CreateIndex
CREATE INDEX "cafes_country_code_idx" ON "cafes"("country_code");

-- CreateIndex
CREATE INDEX "cafes_language_code_country_code_idx" ON "cafes"("language_code", "country_code");

-- CreateIndex
CREATE INDEX "forums_language_code_idx" ON "forums"("language_code");

-- CreateIndex
CREATE INDEX "forums_country_code_idx" ON "forums"("country_code");

-- CreateIndex
CREATE INDEX "forums_language_code_country_code_idx" ON "forums"("language_code", "country_code");

-- CreateIndex
CREATE INDEX "playlists_language_code_idx" ON "playlists"("language_code");

-- CreateIndex
CREATE INDEX "playlists_country_code_idx" ON "playlists"("country_code");

-- CreateIndex
CREATE INDEX "playlists_language_code_country_code_idx" ON "playlists"("language_code", "country_code");

-- CreateIndex
CREATE INDEX "posts_language_code_idx" ON "posts"("language_code");

-- CreateIndex
CREATE INDEX "posts_country_code_idx" ON "posts"("country_code");

-- CreateIndex
CREATE INDEX "posts_language_code_country_code_idx" ON "posts"("language_code", "country_code");

-- AddForeignKey
ALTER TABLE "articles" ADD CONSTRAINT "articles_language_code_fkey" FOREIGN KEY ("language_code") REFERENCES "languages"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "articles" ADD CONSTRAINT "articles_country_code_fkey" FOREIGN KEY ("country_code") REFERENCES "countries"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_language_code_fkey" FOREIGN KEY ("language_code") REFERENCES "languages"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_country_code_fkey" FOREIGN KEY ("country_code") REFERENCES "countries"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cafes" ADD CONSTRAINT "cafes_language_code_fkey" FOREIGN KEY ("language_code") REFERENCES "languages"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cafes" ADD CONSTRAINT "cafes_country_code_fkey" FOREIGN KEY ("country_code") REFERENCES "countries"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forums" ADD CONSTRAINT "forums_language_code_fkey" FOREIGN KEY ("language_code") REFERENCES "languages"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forums" ADD CONSTRAINT "forums_country_code_fkey" FOREIGN KEY ("country_code") REFERENCES "countries"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "playlists" ADD CONSTRAINT "playlists_language_code_fkey" FOREIGN KEY ("language_code") REFERENCES "languages"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "playlists" ADD CONSTRAINT "playlists_country_code_fkey" FOREIGN KEY ("country_code") REFERENCES "countries"("code") ON DELETE SET NULL ON UPDATE CASCADE;
