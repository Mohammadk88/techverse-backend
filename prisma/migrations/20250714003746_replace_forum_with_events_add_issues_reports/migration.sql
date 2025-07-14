/*
  Warnings:

  - You are about to drop the `forum_members` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `forum_replies` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `forum_topics` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `forums` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "issue_status" AS ENUM ('OPEN', 'ACTIVE', 'SOLVED');

-- CreateEnum
CREATE TYPE "developer_ranks" AS ENUM ('BEGINNER', 'PROBLEM_SOLVER', 'EXPERT', 'CONSULTANT');

-- CreateEnum
CREATE TYPE "report_status" AS ENUM ('PENDING', 'REVIEWED', 'REJECTED');

-- DropForeignKey
ALTER TABLE "forum_members" DROP CONSTRAINT "forum_members_forum_id_fkey";

-- DropForeignKey
ALTER TABLE "forum_members" DROP CONSTRAINT "forum_members_user_id_fkey";

-- DropForeignKey
ALTER TABLE "forum_replies" DROP CONSTRAINT "forum_replies_author_id_fkey";

-- DropForeignKey
ALTER TABLE "forum_replies" DROP CONSTRAINT "forum_replies_parent_id_fkey";

-- DropForeignKey
ALTER TABLE "forum_replies" DROP CONSTRAINT "forum_replies_topic_id_fkey";

-- DropForeignKey
ALTER TABLE "forum_topics" DROP CONSTRAINT "forum_topics_author_id_fkey";

-- DropForeignKey
ALTER TABLE "forum_topics" DROP CONSTRAINT "forum_topics_forum_id_fkey";

-- DropForeignKey
ALTER TABLE "forums" DROP CONSTRAINT "forums_country_code_fkey";

-- DropForeignKey
ALTER TABLE "forums" DROP CONSTRAINT "forums_creator_id_fkey";

-- DropForeignKey
ALTER TABLE "forums" DROP CONSTRAINT "forums_language_code_fkey";

-- DropTable
DROP TABLE "forum_members";

-- DropTable
DROP TABLE "forum_replies";

-- DropTable
DROP TABLE "forum_topics";

-- DropTable
DROP TABLE "forums";

-- CreateTable
CREATE TABLE "events" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "host" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "details" TEXT NOT NULL,
    "link" TEXT,
    "media_url" TEXT,
    "result" TEXT,
    "result_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "issues" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "issue_status" NOT NULL DEFAULT 'OPEN',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_by_id" INTEGER NOT NULL,
    "solved_by_id" INTEGER,
    "solved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "issues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "developer_profiles" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "rank" "developer_ranks" NOT NULL DEFAULT 'BEGINNER',

    CONSTRAINT "developer_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" SERIAL NOT NULL,
    "content_type" TEXT NOT NULL,
    "content_id" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "reported_by_id" INTEGER NOT NULL,
    "status" "report_status" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "developer_profiles_user_id_key" ON "developer_profiles"("user_id");

-- AddForeignKey
ALTER TABLE "issues" ADD CONSTRAINT "issues_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issues" ADD CONSTRAINT "issues_solved_by_id_fkey" FOREIGN KEY ("solved_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "developer_profiles" ADD CONSTRAINT "developer_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_reported_by_id_fkey" FOREIGN KEY ("reported_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
