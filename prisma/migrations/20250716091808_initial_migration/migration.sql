-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('APARTMENT', 'BUNGALOW', 'TOWNHOUSE', 'MAISONETTE', 'STUDIO', 'SINGLE_ROOM');

-- CreateTable
CREATE TABLE "RentEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "estate" TEXT NOT NULL,
    "apartment" TEXT,
    "rent" INTEGER NOT NULL,
    "bedrooms" INTEGER NOT NULL,
    "propertyType" "PropertyType" NOT NULL,
    "furnished" BOOLEAN NOT NULL,
    "comment" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RentEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "RentEntry" ADD CONSTRAINT "RentEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
