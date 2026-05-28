-- CreateTable
CREATE TABLE "agent_allowlists" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "agent_id" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_allowlists_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "agent_allowlists_agent_id_idx" ON "agent_allowlists"("agent_id");

-- AddForeignKey
ALTER TABLE "agent_allowlists" ADD CONSTRAINT "agent_allowlists_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
