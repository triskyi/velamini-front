// Utility to calculate age from birth date string (YYYY-MM-DD or YYYY/MM/DD or YYYY.MM.DD)
export function calculateAge(birthDateString: string, now: Date = new Date()): number {
  const birthDate = new Date(birthDateString);
  let age = now.getFullYear() - birthDate.getFullYear();
  const m = now.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}
