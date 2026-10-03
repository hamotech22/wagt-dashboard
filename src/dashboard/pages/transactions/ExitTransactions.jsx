import TransactionsTable from "./TransactionsTable";

export default function ExitTransactions() {
  return (
    <TransactionsTable
      mode="exit"
      title="عمليات الخروج"
      subtitle="المركبات التي سُجّل خروجها ووزن الخروج وصافي النفايات"
    />
  );
}
