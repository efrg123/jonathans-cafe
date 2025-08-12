-- AlterTable
ALTER TABLE "public"."PricingRule" ADD COLUMN     "categoryId" INTEGER;

-- AddForeignKey
ALTER TABLE "public"."PricingRule" ADD CONSTRAINT "PricingRule_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
