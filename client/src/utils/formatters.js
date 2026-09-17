export function formatDistanceToNow(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 5) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function getInitials(name = '') {
  if (!name) return 'U';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function getAvatarColor(name = '') {
  const colors = [
    'bg-blue-600 text-white',
    'bg-purple-600 text-white',
    'bg-emerald-600 text-white',
    'bg-amber-600 text-white',
    'bg-rose-600 text-white',
    'bg-indigo-600 text-white',
    'bg-teal-600 text-white',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}
