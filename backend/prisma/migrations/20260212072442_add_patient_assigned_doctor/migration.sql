-- AlterTable
ALTER TABLE "patients" ADD COLUMN     "assignedDoctorId" TEXT;

-- CreateIndex
CREATE INDEX "patients_assignedDoctorId_idx" ON "patients"("assignedDoctorId");

-- AddForeignKey
ALTER TABLE "patients" ADD CONSTRAINT "patients_assignedDoctorId_fkey" FOREIGN KEY ("assignedDoctorId") REFERENCES "doctors"("id") ON DELETE SET NULL ON UPDATE CASCADE;
