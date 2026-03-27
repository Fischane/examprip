export function validateCoverLetter(data: { recipientName: string; paragraphs: string[] }): boolean {
  if (!data.recipientName || data.recipientName.trim() === '') return false
  if (!data.paragraphs || data.paragraphs.filter(p => p.trim() !== '').length === 0) return false
  return true
}
