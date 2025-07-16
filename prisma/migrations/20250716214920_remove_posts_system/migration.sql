/*
  Warnings:

  - You are about to drop the column `post_id` on the `bookmarks` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `bookmarks` table. All the data in the column will be lost.
  - You are about to drop the `comments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `posts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `reactions` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[user_id,article_id]` on the table `bookmarks` will be added. If there are existing duplicate values, this will fail.
  - Made the column `article_id` on table `bookmarks` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "bookmarks" DROP CONSTRAINT "bookmarks_post_id_fkey";

-- DropForeignKey
ALTER TABLE "comments" DROP CONSTRAINT "comments_author_id_fkey";

-- DropForeignKey
ALTER TABLE "comments" DROP CONSTRAINT "comments_parent_id_fkey";

-- DropForeignKey
ALTER TABLE "comments" DROP CONSTRAINT "comments_post_id_fkey";

-- DropForeignKey
ALTER TABLE "posts" DROP CONSTRAINT "posts_author_id_fkey";

-- DropForeignKey
ALTER TABLE "posts" DROP CONSTRAINT "posts_country_code_fkey";

-- DropForeignKey
ALTER TABLE "posts" DROP CONSTRAINT "posts_language_code_fkey";

-- DropForeignKey
ALTER TABLE "reactions" DROP CONSTRAINT "reactions_post_id_fkey";

-- DropForeignKey
ALTER TABLE "reactions" DROP CONSTRAINT "reactions_user_id_fkey";

-- AlterTable
ALTER TABLE "bookmarks" DROP COLUMN "post_id",
DROP COLUMN "type",
ALTER COLUMN "article_id" SET NOT NULL;

-- DropTable
DROP TABLE "comments";

-- DropTable
DROP TABLE "posts";

-- DropTable
DROP TABLE "reactions";

-- DropEnum
DROP TYPE "bookmark_types";

-- DropEnum
DROP TYPE "post_types";

-- DropEnum
DROP TYPE "reaction_types";

-- CreateIndex
CREATE UNIQUE INDEX "bookmarks_user_id_article_id_key" ON "bookmarks"("user_id", "article_id");
