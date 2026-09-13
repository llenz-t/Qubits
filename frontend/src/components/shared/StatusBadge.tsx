/**
 * Small colored pill for the two status vocabularies in the app:
 * attendance health (Good/Warning) and justification review
 * (Pending/Approved/Rejected). Color is looked up from `status` alone.
 */
interface StatusBadgeProps {
  status: 'Good' | 'Warning' | 'Pending' | 'Approved' | 'Rejected';
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const colors = {
    Good: 'bg-green-100 text-green-800',
    Warning: 'bg-orange-100 text-orange-800',
    Pending: 'bg-gray-100 text-gray-800',
    Approved: 'bg-green-100 text-green-800',
    Rejected: 'bg-red-100 text-red-800'
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status]}`}>
      {status}
    </span>
  );
}