-- AlterTable
ALTER TABLE "articles" ADD COLUMN     "ai_prompt" TEXT,
ADD COLUMN     "is_ai" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "scheduled_for" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "posts" ADD COLUMN     "ai_prompt" TEXT,
ADD COLUMN     "is_ai" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_published" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "published_at" TIMESTAMP(3),
ADD COLUMN     "scheduled_for" TIMESTAMP(3);
