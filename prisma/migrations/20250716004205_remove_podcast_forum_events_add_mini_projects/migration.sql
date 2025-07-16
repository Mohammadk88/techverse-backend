/*
  Warnings:

  - You are about to drop the `developer_profiles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `episode_comments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `episode_likes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `episodes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `events` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `forum_answers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `forum_categories` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `forum_questions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `forum_votes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `issues` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `playlists` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `reports` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "project_status" AS ENUM ('OPEN', 'IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "task_status" AS ENUM ('PENDING', 'ASSIGNED', 'DONE');

-- DropForeignKey
ALTER TABLE "developer_profiles" DROP CONSTRAINT "developer_profiles_user_id_fkey";

-- DropForeignKey
ALTER TABLE "episode_comments" DROP CONSTRAINT "episode_comments_episode_id_fkey";

-- DropForeignKey
ALTER TABLE "episode_comments" DROP CONSTRAINT "episode_comments_user_id_fkey";

-- DropForeignKey
ALTER TABLE "episode_likes" DROP CONSTRAINT "episode_likes_episode_id_fkey";

-- DropForeignKey
ALTER TABLE "episode_likes" DROP CONSTRAINT "episode_likes_user_id_fkey";

-- DropForeignKey
ALTER TABLE "episodes" DROP CONSTRAINT "episodes_playlist_id_fkey";

-- DropForeignKey
ALTER TABLE "forum_answers" DROP CONSTRAINT "forum_answers_author_id_fkey";

-- DropForeignKey
ALTER TABLE "forum_answers" DROP CONSTRAINT "forum_answers_question_id_fkey";

-- DropForeignKey
ALTER TABLE "forum_questions" DROP CONSTRAINT "forum_questions_author_id_fkey";

-- DropForeignKey
ALTER TABLE "forum_questions" DROP CONSTRAINT "forum_questions_category_id_fkey";

-- DropForeignKey
ALTER TABLE "forum_votes" DROP CONSTRAINT "forum_votes_answer_id_fkey";

-- DropForeignKey
ALTER TABLE "forum_votes" DROP CONSTRAINT "forum_votes_user_id_fkey";

-- DropForeignKey
ALTER TABLE "issues" DROP CONSTRAINT "issues_created_by_id_fkey";

-- DropForeignKey
ALTER TABLE "issues" DROP CONSTRAINT "issues_solved_by_id_fkey";

-- DropForeignKey
ALTER TABLE "playlists" DROP CONSTRAINT "playlists_country_code_fkey";

-- DropForeignKey
ALTER TABLE "playlists" DROP CONSTRAINT "playlists_language_code_fkey";

-- DropForeignKey
ALTER TABLE "reports" DROP CONSTRAINT "reports_reported_by_id_fkey";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "tech_coin" INTEGER NOT NULL DEFAULT 100;

-- DropTable
DROP TABLE "developer_profiles";

-- DropTable
DROP TABLE "episode_comments";

-- DropTable
DROP TABLE "episode_likes";

-- DropTable
DROP TABLE "episodes";

-- DropTable
DROP TABLE "events";

-- DropTable
DROP TABLE "forum_answers";

-- DropTable
DROP TABLE "forum_categories";

-- DropTable
DROP TABLE "forum_questions";

-- DropTable
DROP TABLE "forum_votes";

-- DropTable
DROP TABLE "issues";

-- DropTable
DROP TABLE "playlists";

-- DropTable
DROP TABLE "reports";

-- DropEnum
DROP TYPE "developer_ranks";

-- DropEnum
DROP TYPE "issue_status";

-- DropEnum
DROP TYPE "report_status";

-- CreateTable
CREATE TABLE "projects" (
    "id" SERIAL NOT NULL,
    "owner_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "status" "project_status" NOT NULL DEFAULT 'OPEN',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_tasks" (
    "id" SERIAL NOT NULL,
    "project_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "status" "task_status" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_applications" (
    "id" SERIAL NOT NULL,
    "task_id" INTEGER NOT NULL,
    "applicant_id" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "task_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_assignments" (
    "id" SERIAL NOT NULL,
    "task_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "task_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_payments" (
    "id" SERIAL NOT NULL,
    "task_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "is_paid" BOOLEAN NOT NULL DEFAULT false,
    "paid_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "task_payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "task_applications_task_id_applicant_id_key" ON "task_applications"("task_id", "applicant_id");

-- CreateIndex
CREATE UNIQUE INDEX "task_assignments_task_id_key" ON "task_assignments"("task_id");

-- CreateIndex
CREATE UNIQUE INDEX "task_payments_task_id_key" ON "task_payments"("task_id");

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_tasks" ADD CONSTRAINT "project_tasks_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_applications" ADD CONSTRAINT "task_applications_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "project_tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_applications" ADD CONSTRAINT "task_applications_applicant_id_fkey" FOREIGN KEY ("applicant_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_assignments" ADD CONSTRAINT "task_assignments_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "project_tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_assignments" ADD CONSTRAINT "task_assignments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_payments" ADD CONSTRAINT "task_payments_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "project_tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_payments" ADD CONSTRAINT "task_payments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
