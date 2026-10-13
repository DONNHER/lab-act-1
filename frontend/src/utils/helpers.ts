// Utility Functions
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(dateString: string | null | undefined): string {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    ACTIVE: 'bg-green-100 text-green-800',
    INACTIVE: 'bg-gray-100 text-gray-800',
    GRADUATED: 'bg-blue-100 text-blue-800',
    OPEN: 'bg-green-100 text-green-800',
    CLOSED: 'bg-red-100 text-red-800',
    CANCELLED: 'bg-gray-100 text-gray-800',
    PLANNED: 'bg-yellow-100 text-yellow-800',
    ENROLLED: 'bg-blue-100 text-blue-800',
    DROPPED: 'bg-red-100 text-red-800',
    COMPLETED: 'bg-green-100 text-green-800',
    DRAFT: 'bg-yellow-100 text-yellow-800',
    PUBLISHED: 'bg-green-100 text-green-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

export function getRoleColor(role: string): string {
  const colors: Record<string, string> = {
    ADMIN: 'bg-purple-100 text-purple-800',
    REGISTRAR: 'bg-blue-100 text-blue-800',
    INSTRUCTOR: 'bg-green-100 text-green-800',
    STUDENT: 'bg-gray-100 text-gray-800',
  };
  return colors[role] || 'bg-gray-100 text-gray-800';
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}