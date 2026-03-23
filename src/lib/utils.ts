import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString()
}

export function calcPercentage(score: number, total: number) {
  if (!total) return 0
  return Math.round((score / total) * 100)
}
