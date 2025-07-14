-- CreateTable
CREATE TABLE "global_roles" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "global_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_global_roles" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "role_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_global_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cafe_roles" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cafe_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_cafe_roles" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "cafe_id" INTEGER NOT NULL,
    "role_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_cafe_roles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "global_roles_name_key" ON "global_roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "user_global_roles_user_id_role_id_key" ON "user_global_roles"("user_id", "role_id");

-- CreateIndex
CREATE UNIQUE INDEX "cafe_roles_name_key" ON "cafe_roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "user_cafe_roles_user_id_cafe_id_role_id_key" ON "user_cafe_roles"("user_id", "cafe_id", "role_id");

-- AddForeignKey
ALTER TABLE "user_global_roles" ADD CONSTRAINT "user_global_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_global_roles" ADD CONSTRAINT "user_global_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "global_roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_cafe_roles" ADD CONSTRAINT "user_cafe_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_cafe_roles" ADD CONSTRAINT "user_cafe_roles_cafe_id_fkey" FOREIGN KEY ("cafe_id") REFERENCES "cafes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_cafe_roles" ADD CONSTRAINT "user_cafe_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "cafe_roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
