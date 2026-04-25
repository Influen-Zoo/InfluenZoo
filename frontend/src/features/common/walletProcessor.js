export const getTransactionDecoration = (transaction) => {
  const isPositive = ['topup', 'earning'].includes(transaction.type);
  const symbol = transaction.asset === 'coins' ? '🪙' : '₹';
  const color = isPositive ? 'var(--success)' : 'var(--danger)';
  const sign = isPositive ? '+' : '-';

  return {
    symbol,
    color,
    sign,
    isPositive
  };
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN').format(amount);
};
