/*
  Warnings:

  - A unique constraint covering the columns `[name,country_id]` on the table `cities` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "cities_name_country_id_key" ON "cities"("name", "country_id");
