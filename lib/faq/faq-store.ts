import fs from 'fs'
import path from 'path'

export interface FAQItem {
  id: string
  question: string
  answer: string
  question_ar?: string
  answer_ar?: string
  category: string
  category_ar?: string
  display_order: number
  is_active: boolean
  updated_at: string
}

const FAQ_FILE_PATH = path.join(process.cwd(), 'data', 'faqs.json')

export function readAllFaqs(): FAQItem[] {
  try {
    if (!fs.existsSync(FAQ_FILE_PATH)) {
      return []
    }
    const content = fs.readFileSync(FAQ_FILE_PATH, 'utf-8')
    const list = JSON.parse(content) as FAQItem[]
    return list.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
  } catch (error) {
    console.error('Error reading faqs.json:', error)
    return []
  }
}

export function writeAllFaqs(faqs: FAQItem[]): void {
  try {
    const dir = path.dirname(FAQ_FILE_PATH)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(FAQ_FILE_PATH, JSON.stringify(faqs, null, 2), 'utf-8')
  } catch (error) {
    console.error('Error writing faqs.json:', error)
    throw new Error('Failed to persist FAQ update')
  }
}
