import TransactionsTable from "./TransactionsTable";

export default function EntryTransactions() {
  return (
    <TransactionsTable
      mode="entry"
      title="عمليات الدخول"
      subtitle="المركبات التي سُجّل دخولها ووزن الدخول"
    />
  );
}
