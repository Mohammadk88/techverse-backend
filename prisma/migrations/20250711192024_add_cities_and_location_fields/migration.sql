/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `countries` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `countries` table without a default value. This is not possible if the table is not empty.

*/

-- First, add the code column as nullable
ALTER TABLE "countries" ADD COLUMN "code" TEXT;

-- Update existing countries with default codes based on their names
UPDATE "countries" SET "code" = 
  CASE 
    WHEN "name" = 'Turkey' THEN 'TR'
    WHEN "name" = 'United States' THEN 'US'
    WHEN "name" = 'United Kingdom' THEN 'GB'
    WHEN "name" = 'Germany' THEN 'DE'
    WHEN "name" = 'France' THEN 'FR'
    WHEN "name" = 'Spain' THEN 'ES'
    WHEN "name" = 'Italy' THEN 'IT'
    WHEN "name" = 'Canada' THEN 'CA'
    WHEN "name" = 'Australia' THEN 'AU'
    WHEN "name" = 'Japan' THEN 'JP'
    WHEN "name" = 'China' THEN 'CN'
    WHEN "name" = 'India' THEN 'IN'
    WHEN "name" = 'Brazil' THEN 'BR'
    WHEN "name" = 'Mexico' THEN 'MX'
    WHEN "name" = 'Russia' THEN 'RU'
    WHEN "name" = 'South Africa' THEN 'ZA'
    ELSE UPPER(LEFT("name", 2))
  END;

-- Now make the column NOT NULL
ALTER TABLE "countries" ALTER COLUMN "code" SET NOT NULL;

-- AlterTable
ALTER TABLE "languages" ADD COLUMN     "direction" TEXT DEFAULT 'ltr';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "city_id" INTEGER;

-- CreateTable
CREATE TABLE "cities" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "country_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "countries_code_key" ON "countries"("code");

-- AddForeignKey
ALTER TABLE "cities" ADD CONSTRAINT "cities_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "countries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE SET NULL ON UPDATE CASCADE;
