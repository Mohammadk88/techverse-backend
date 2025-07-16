-- CreateEnum
CREATE TYPE "reaction_types" AS ENUM ('LIKE', 'LOVE', 'LAUGH', 'WOW', 'SAD', 'ANGRY');

-- CreateTable
CREATE TABLE "reactions" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "type" "reaction_types" NOT NULL,
    "article_id" INTEGER,
    "project_id" INTEGER,
    "challenge_id" INTEGER,
    "cafe_post_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "reactions_user_id_article_id_key" ON "reactions"("user_id", "article_id");

-- CreateIndex
CREATE UNIQUE INDEX "reactions_user_id_project_id_key" ON "reactions"("user_id", "project_id");

-- CreateIndex
CREATE UNIQUE INDEX "reactions_user_id_challenge_id_key" ON "reactions"("user_id", "challenge_id");

-- CreateIndex
CREATE UNIQUE INDEX "reactions_user_id_cafe_post_id_key" ON "reactions"("user_id", "cafe_post_id");

-- AddForeignKey
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_challenge_id_fkey" FOREIGN KEY ("challenge_id") REFERENCES "challenges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_cafe_post_id_fkey" FOREIGN KEY ("cafe_post_id") REFERENCES "cafe_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
