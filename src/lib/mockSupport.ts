import type { ChatMessage, FaqCategory } from '@/types/Support'

export const INITIAL_MESSAGES: ChatMessage[] = [
  { id: 1, from: 'bot', text: "Hi! I'm the Giftseon Business assistant. Ask me about employees, gifting configuration, budget, or branding." },
]

export const FAQ_DATA: FaqCategory[] = [
  {
    title: 'EMPLOYEES',
    items: [
      {
        question: 'How do I add employees to Giftseon?',
        answer: 'From the Employees page, add them individually, upload a spreadsheet (CSV/Excel), or enter their Giftseon @tags directly. Employees without an account receive an onboarding link to set up their profile and delivery address.',
      },
      {
        question: 'Can I see what my employees are interested in?',
        answer: "No — an employee's specific interest selections are private to them. You can only see whether their profile is complete. Giftseon uses their interests behind the scenes to personalize gift recommendations.",
      },
      {
        question: 'How do I send a gift to a group or department?',
        answer: 'From the Employees page, select employees with the checkboxes (or use "Send a Gift" and switch to "By Department") and choose a gift type from your configuration, a custom gift, or something from the marketplace.',
      },
      {
        question: 'What happens when I remove an employee?',
        answer: "They're taken off your gifting list and excluded from future automated rules. Past gift history isn't affected.",
      },
    ],
  },
  {
    title: 'GIFTING & BUDGET',
    items: [
      {
        question: 'What is a gifting rule?',
        answer: 'A gifting rule automates a gift for an occasion — Birthday, Work Anniversary, Welcome, and more — with a trigger, gift format, and budget you configure once. It fires automatically from then on.',
      },
      {
        question: 'What does auto-allocate do on the Budget page?',
        answer: 'It distributes your total budget cap across your enabled gifting types based on how many employees you have and your plan, suggesting a sensible per-gift amount for each. You can review it before applying, or configure limits manually instead.',
      },
      {
        question: "What happens if my budget isn't enough?",
        answer: "You'll see an insufficient-budget warning showing the exact shortfall, with an option to scale the suggested amounts down to fit, or top up your wallet first.",
      },
      {
        question: 'Where does company wallet money come from?',
        answer: 'Top up via bank transfer to your dedicated company virtual account, shown on the Budget & Wallet page. This wallet is separate from any individual employee wallets.',
      },
    ],
  },
  {
    title: 'ACCOUNT',
    items: [
      {
        question: 'How do I update my company information?',
        answer: 'Go to Settings > Company Information and click Edit. You can update your company name, industry, admin contact, and business details.',
      },
      {
        question: 'How do I change my account password?',
        answer: 'Navigate to Settings > Security. Enter your current password and your new password, then save.',
      },
    ],
  },
]
