-- CreateTable
CREATE TABLE "RoomCount" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rooms" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "RoomCount_id_key" ON "RoomCount"("id");
