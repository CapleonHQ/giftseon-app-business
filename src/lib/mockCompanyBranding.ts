export type MockOnboardingCompany = {
  companyName: string
  logo?: string
  brandColor: string
}

export const MOCK_COMPANIES_BY_TOKEN: Record<string, MockOnboardingCompany> = {
  'acme-demo': { companyName: 'Acme Ltd', brandColor: '#1A1ABC' },
  'lumen-demo': { companyName: 'Lumen Technologies', brandColor: '#099137' },
  'nova-demo': { companyName: 'Nova Retail Group', brandColor: '#DD900D' },
}

export const getOnboardingCompany = (token: string): MockOnboardingCompany => {
  return (
    MOCK_COMPANIES_BY_TOKEN[token] || {
      companyName: 'Your Employer',
      brandColor: '#1A1ABC',
    }
  )
}

export const INTEREST_CATEGORIES: { category: string; options: string[] }[] = [
  { category: 'Food & Drinks', options: ['Fine Dining', 'Coffee & Pastries', 'Wine & Spirits', 'Local Cuisine'] },
  { category: 'Beauty & Wellness', options: ['Spa & Massage', 'Skincare', 'Fitness & Gym', 'Haircare'] },
  { category: 'Fashion', options: ['Streetwear', 'Formal Wear', 'Footwear', 'Accessories'] },
  { category: 'Tech & Gadgets', options: ['Smart Home', 'Audio & Headphones', 'Mobile Accessories', 'Gaming'] },
  { category: 'Experiences', options: ['Concerts & Events', 'Travel & Getaways', 'Movies', 'Adventure Activities'] },
  { category: 'Home & Living', options: ['Home Decor', 'Kitchenware', 'Furniture', 'Plants & Garden'] },
]
