export default function StatusBadge({ status }) {
  const normalized = status || 'PENDING';
  const className =
    normalized === 'AUTO_APPROVED'
      ? 'badge badge-approved'
      : normalized === 'NEEDS_REVIEW'
        ? 'badge badge-review'
        : 'badge badge-pending';

  return <span className={className}>{normalized.replace('_', ' ')}</span>;
}
