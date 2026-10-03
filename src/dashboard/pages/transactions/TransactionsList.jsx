import TransactionsTable from "./TransactionsTable";

export default function TransactionsList() {
  return (
    <TransactionsTable
      mode="all"
      title="جميع العمليات"
      subtitle="سجل حركة المركبات ودخولها وخروجها وأوزانها"
    />
  );
}
