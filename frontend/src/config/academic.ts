// Academic configuration constants
export const PASSING_GRADE_THRESHOLD = 75;

export const SEMESTER_LABELS: Record<number, string> = {
  1: 'First Semester',
  2: 'Second Semester',
  3: 'Summer',
};

export const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  core: { label: 'Core', color: 'bg-blue-100 text-blue-800' },
  major: { label: 'Major', color: 'bg-purple-100 text-purple-800' },
  elective: { label: 'Elective', color: 'bg-green-100 text-green-800' },
  ge: { label: 'Gen Ed', color: 'bg-gray-100 text-gray-800' },
  pe: { label: 'PE', color: 'bg-pink-100 text-pink-800' },
  nstp: { label: 'NSTP', color: 'bg-orange-100 text-orange-800' },
};

export const STATUS_COLORS = {
  enrolled: 'bg-green-100 text-green-800',
  completed: 'bg-blue-100 text-blue-800',
  available: 'bg-gray-100 text-gray-600',
  locked: 'bg-red-100 text-red-800',
  pending: 'bg-yellow-100 text-yellow-800',
};