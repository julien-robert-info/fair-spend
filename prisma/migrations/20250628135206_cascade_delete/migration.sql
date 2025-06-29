-- DropForeignKey
ALTER TABLE "Debt" DROP CONSTRAINT "Debt_expenseId_fkey";

-- DropForeignKey
ALTER TABLE "Payback" DROP CONSTRAINT "Payback_counterDebtId_fkey";

-- DropForeignKey
ALTER TABLE "Payback" DROP CONSTRAINT "Payback_debtId_fkey";

-- DropForeignKey
ALTER TABLE "Payback" DROP CONSTRAINT "Payback_transferId_fkey";

-- AddForeignKey
ALTER TABLE "Debt" ADD CONSTRAINT "Debt_expenseId_fkey" FOREIGN KEY ("expenseId") REFERENCES "Expense"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payback" ADD CONSTRAINT "Payback_debtId_fkey" FOREIGN KEY ("debtId") REFERENCES "Debt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payback" ADD CONSTRAINT "Payback_counterDebtId_fkey" FOREIGN KEY ("counterDebtId") REFERENCES "Debt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payback" ADD CONSTRAINT "Payback_transferId_fkey" FOREIGN KEY ("transferId") REFERENCES "Transfer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
