-- AlterTable
ALTER TABLE "public"."Channel" ADD COLUMN     "pinnedMessageId" TEXT;

-- AlterTable
ALTER TABLE "public"."Message" ADD COLUMN     "replyToId" TEXT;

-- AddForeignKey
ALTER TABLE "public"."Channel" ADD CONSTRAINT "Channel_pinnedMessageId_fkey" FOREIGN KEY ("pinnedMessageId") REFERENCES "public"."Message"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Message" ADD CONSTRAINT "Message_replyToId_fkey" FOREIGN KEY ("replyToId") REFERENCES "public"."Message"("id") ON DELETE SET NULL ON UPDATE CASCADE;
