const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

const defaultMarkets = ['Singapore', 'Malaysia', 'UAE', 'UK', 'Germany']
const defaultCertifications = ['India Organic', 'FSSAI', 'APEDA', 'ISO 22000']
const defaultPackaging = ['25 kg kraft bags', '50 kg jute bags', 'Retail-ready cartons', 'Custom export cartons']
const defaultApplications = ['Food manufacturing', 'Retail supply', 'Export distribution']

const heroImages = {
  seasonalHarvests: '/organics/seasonal-harvests/seasonal-harvests-hero.jpeg',
  seasonalStaples: '/organics/seasonal-staples/seasonal-staples-hero.png',
  nonSeasonalEssentials: '/organics/non-seasonal-essentials/non-seasonal-essentials-hero.png',
  coconutProducts: '/organics/coconut-products/coconut-products-hero.png',
  teaCoffee: '/organics/tea%26coffee/tea-coffee-hero.png',
  valueAddedIngredients: '/organics/value-added-ingredients/value-added-ingredients-hero.png',
}

const galleryImages = {
  seasonalHarvests: [
    'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1498579809087-ef1e558fd1d1?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1519183071298-a2962d38fb50?auto=format&fit=crop&w=1400&q=80',
  ],
  seasonalStaples: [
    'https://images.unsplash.com/photo-1516685018646-5498ddb0a24b?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1506368249639-73a05d6f6488?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1598514983099-983c861fd5be?auto=format&fit=crop&w=1400&q=80',
  ],
  nonSeasonalEssentials: [
    'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1400&q=80',
  ],
  coconutProducts: [
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1542831371-d531d36971e6?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?auto=format&fit=crop&w=1400&q=80',
  ],
  teaCoffee: [
    'https://images.unsplash.com/photo-1510626176961-4b5321e8dd0f?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1400&q=80',
  ],
  valueAddedIngredients: [
    'https://images.unsplash.com/photo-1498842812179-c81beecf902c?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1510626176961-4b5321e8dd0f?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1506806732259-39c2d0268443?auto=format&fit=crop&w=1400&q=80',
  ],
}

const categoryDefaults = {
  'seasonal-harvests': {
    certifications: ['India Organic', 'FSSAI', 'APEDA'],
    applications: ['Fresh produce imports', 'Retail supply', 'Hospitality sourcing'],
    packaging: ['Carton trays', 'Cold-chain crates', 'Export-ready pallets'],
    exportMarkets: ['Singapore', 'Malaysia', 'UAE', 'UK', 'Qatar'],
    specs: [
      { label: 'Origin', value: 'India' },
      { label: 'Grade', value: 'Export Grade' },
      { label: 'Shelf Life', value: 'Fresh seasonal stock' },
      { label: 'Packaging', value: 'Carton / cold chain' },
      { label: 'MOQ', value: '1 x 20 ft container' },
    ],
  },
  'seasonal-staples': {
    certifications: ['India Organic', 'FSSAI', 'APEDA'],
    applications: ['Bulk food processing', 'Retail packaging', 'Institutional supply'],
    packaging: ['25 kg jute bags', '50 kg kraft bags', 'Bulk jumbo bags'],
    exportMarkets: ['UAE', 'Singapore', 'UK', 'Germany', 'Netherlands'],
    specs: [
      { label: 'Origin', value: 'India' },
      { label: 'Grade', value: 'Export Grade' },
      { label: 'Moisture', value: 'Max 12%' },
      { label: 'Purity', value: '98%+' },
      { label: 'Shelf Life', value: '6-12 months' },
    ],
  },
  'non-seasonal-essentials': {
    certifications: ['India Organic', 'FSSAI', 'APEDA', 'ISO 22000'],
    applications: ['Food manufacturing', 'Retail blends', 'Restaurant supply'],
    packaging: ['25 kg paper bags', '50 kg bulk bags', 'Retail jars and pouches'],
    exportMarkets: ['USA', 'UK', 'UAE', 'Germany', 'Japan'],
    specs: [
      { label: 'Origin', value: 'India' },
      { label: 'Grade', value: 'Export Grade' },
      { label: 'Moisture', value: 'Max 10%' },
      { label: 'Purity', value: '98%+' },
      { label: 'Shelf Life', value: '12-18 months' },
    ],
  },
  'coconut-products': {
    certifications: ['India Organic', 'FSSAI', 'HACCP'],
    applications: ['Food & beverage', 'Bakery', 'Cosmetics', 'Retail labels'],
    packaging: ['25 kg drums', '500 g retail packs', 'Custom tins'],
    exportMarkets: ['USA', 'UAE', 'UK', 'Australia', 'Saudi Arabia'],
    specs: [
      { label: 'Origin', value: 'India' },
      { label: 'Grade', value: 'Food Grade / Export Grade' },
      { label: 'Shelf Life', value: '12-18 months' },
      { label: 'Packaging', value: 'Drums / foil bags / retail jars' },
      { label: 'MOQ', value: '1 x 20 ft container' },
    ],
  },
  'tea-coffee': {
    certifications: ['India Organic', 'FSSAI', 'Fair Trade'],
    applications: ['Retail tea & coffee', 'Private label', 'Hospitality supply'],
    packaging: ['250 g / 500 g foil packs', '1 kg craft bags', 'Bulk cartons'],
    exportMarkets: ['UK', 'Germany', 'USA', 'Japan', 'Singapore'],
    specs: [
      { label: 'Origin', value: 'India' },
      { label: 'Grade', value: 'Premium plantation grade' },
      { label: 'Moisture', value: 'Max 5%' },
      { label: 'Shelf Life', value: '12 months' },
      { label: 'Packaging', value: 'Foil bags / retail cartons' },
    ],
  },
  'value-added-ingredients': {
    certifications: ['India Organic', 'FSSAI', 'EU Organic', 'USDA Organic'],
    applications: ['Nutraceuticals', 'Food OEM', 'Private label wellness'],
    packaging: ['250 g / 500 g pouches', '1 kg stand-up pouches', 'Bulk drums'],
    exportMarkets: ['USA', 'UK', 'Germany', 'Australia', 'UAE'],
    specs: [
      { label: 'Origin', value: 'India' },
      { label: 'Grade', value: 'Organic export grade' },
      { label: 'Shelf Life', value: '12 months' },
      { label: 'Purity', value: '99%+' },
      { label: 'Packaging', value: 'Foil pouches / bulk bags' },
    ],
  },
}

const productSpecOverrides = {
  '1121 Basmati Rice': [
    { label: 'Origin', value: 'India' },
    { label: 'Grade', value: 'Extra Long Grain Basmati' },
    { label: 'Moisture', value: 'Max 12.0%' },
    { label: 'Broken Grains', value: 'Max 1%' },
    { label: 'Foreign Matter', value: 'Max 0.2%' },
    { label: 'Shelf Life', value: '12-18 months' },
  ],
  'Pusa Basmati Rice': [
    { label: 'Origin', value: 'India' },
    { label: 'Grade', value: 'Premium Basmati' },
    { label: 'Moisture', value: 'Max 12.5%' },
    { label: 'Broken Grains', value: 'Max 1.5%' },
    { label: 'Foreign Matter', value: 'Max 0.3%' },
    { label: 'Shelf Life', value: '12-18 months' },
  ],
  'Sona Masoori Rice': [
    { label: 'Origin', value: 'India' },
    { label: 'Grade', value: 'Premium Short Grain' },
    { label: 'Moisture', value: 'Max 13.0%' },
    { label: 'Broken Grains', value: 'Max 2%' },
    { label: 'Foreign Matter', value: 'Max 0.3%' },
    { label: 'Shelf Life', value: '12-18 months' },
  ],
  'Ponni Rice': [
    { label: 'Origin', value: 'India' },
    { label: 'Grade', value: 'Super Kernel Rice' },
    { label: 'Moisture', value: 'Max 13.5%' },
    { label: 'Broken Grains', value: 'Max 2.5%' },
    { label: 'Foreign Matter', value: 'Max 0.4%' },
    { label: 'Shelf Life', value: '12-18 months' },
  ],
  'IR64 Rice': [
    { label: 'Origin', value: 'India' },
    { label: 'Grade', value: 'Standard Export Kernel' },
    { label: 'Moisture', value: 'Max 14.0%' },
    { label: 'Broken Grains', value: 'Max 3%' },
    { label: 'Foreign Matter', value: 'Max 0.4%' },
    { label: 'Shelf Life', value: '12-18 months' },
  ],
  'Garlic': [
    { label: 'Origin', value: 'India' },
    { label: 'Grade', value: 'Fresh Export Grade' },
    { label: 'Bulb Size', value: '35-55 mm' },
    { label: 'Moisture', value: 'Max 10%' },
    { label: 'Purity', value: '99%+' },
    { label: 'Shelf Life', value: '6-8 months' },
  ],
  'Aloe Vera Gel': [
    { label: 'Origin', value: 'India' },
    { label: 'Formulation', value: '100% pure organic gel' },
    { label: 'Viscosity', value: '3,000–4,500 cP' },
    { label: 'Shelf Life', value: '12 months' },
    { label: 'Packaging', value: '25 kg pails, 200 kg drums' },
    { label: 'MOQ', value: '1 x 20 ft container' },
  ],
}

const buildProductSpecs = (name, category) => productSpecOverrides[name] || categoryDefaults[category].specs

const categoryBotanicalDefaults = {
  'seasonal-harvests': 'As per crop variety',
  'seasonal-staples': 'Oryza sativa',
  'non-seasonal-essentials': 'As per spice variety',
  'coconut-products': 'Cocos nucifera',
  'tea-coffee': 'Camellia sinensis / Coffea spp.',
  'value-added-ingredients': 'As per botanical source',
}

const productDetailOverrides = {
  Garlic: {
    botanicalName: 'Allium sativum',
    grade: 'Fresh Export Grade',
    color: 'Cream / off-white',
    size: '35-55 mm bulb size',
    moisture: 'Max 10%',
    purity: '99%+',
    shelfLife: '6-8 months',
    packaging: 'Mesh bags / cartons / crates',
    storage: 'Cool, dry ventilated storage; avoid direct sunlight',
    moq: '1 x 20 ft container',
    leadTime: '4-6 weeks after PO',
  },
  'Fresh Onion': {
    botanicalName: 'Allium cepa',
    grade: 'Export Grade',
    color: 'Brown / red',
    size: '40-70 mm',
    moisture: 'Max 9%',
    purity: '99%+',
    shelfLife: '30-45 days under cold chain',
    packaging: '10 kg / 20 kg mesh bags, cartons',
    storage: 'Cool, dry warehouse; avoid direct sunlight',
    moq: '1 x 20 ft container or 5 MT',
    leadTime: '4-6 weeks after PO',
  },
  'Dehydrated Onion': {
    botanicalName: 'Allium cepa',
    grade: 'Export Grade',
    color: 'Deep red / purple',
    size: '40-65 mm diameter',
    moisture: 'Max 9%',
    purity: '99%+',
    shelfLife: '30-45 days under cold chain',
    packaging: '10 kg / 20 kg mesh bags, 25 kg jute bags, cartons',
    storage: 'Cool, dry warehouse; avoid direct sunlight',
    moq: '1 x 20 ft container or 5 MT',
    leadTime: '4-6 weeks after PO',
  },
  'Aloe Vera Gel': {
    botanicalName: 'Aloe barbadensis miller',
    grade: 'Food / Pharma Grade',
    color: 'Transparent to pale green',
    size: 'N/A',
    moisture: 'Max 2%',
    purity: '99%+',
    shelfLife: '12 months',
    packaging: '25 kg pails / 200 kg drums',
    storage: 'Cool, dry warehouse; avoid direct sunlight',
    moq: '1 x 20 ft container',
    leadTime: '4-6 weeks after PO',
  },
  'Assam Tea': {
    botanicalName: 'Camellia sinensis',
    grade: 'Premium grade',
    color: 'Black / golden infusion',
    size: 'Leaf grade',
    moisture: 'Max 5%',
    purity: '99%+',
    shelfLife: '12 months',
    packaging: 'Foil packs / cartons',
    storage: 'Cool, dry warehouse with moisture control',
    moq: '1 x 20 ft container',
    leadTime: '4-6 weeks after PO',
  },
  'Arabica Coffee Beans': {
    botanicalName: 'Coffea arabica',
    grade: 'Specialty export grade',
    color: 'Green / light brown',
    size: 'Screen 15/16',
    moisture: 'Max 12%',
    purity: '99%+',
    shelfLife: '12 months',
    packaging: 'Vacuum packs / export cartons',
    storage: 'Cool, dry warehouse; avoid direct sunlight',
    moq: '1 x 20 ft container',
    leadTime: '4-6 weeks after PO',
  },
}

const buildProductDetails = (name, category) => {
  const override = productDetailOverrides[name] || {}
  const base = {
    productName: name,
    botanicalName: override.botanicalName || categoryBotanicalDefaults[category] || 'As per export specification',
    origin: override.origin || 'India',
    grade: override.grade || 'Export Grade',
    color: override.color || 'Natural',
    size: override.size || 'As per grade',
    moisture: override.moisture || 'As per specification',
    purity: override.purity || '99%+',
    shelfLife: override.shelfLife || 'Varies with product and storage',
    packaging: override.packaging || 'Custom export packaging available',
    storage: override.storage || 'Cool, dry warehouse; avoid direct sunlight',
    moq: override.moq || '1 x 20 ft container or 5 MT',
    leadTime: override.leadTime || '4-6 weeks after PO',
  }

  return base
}

const teaCoffeeImageMap = {
  'assam-tea': '/organics/tea-coffee/assam-tea.png',
  'darjeeling-tea': '/organics/tea-coffee/darjeeling-tea.png',
  'nilgiri-tea': '/organics/tea-coffee/nilgiri-tea.png',
  'green-tea': '/organics/tea-coffee/green-tea.png',
  'arabica-coffee-beans': '/organics/tea-coffee/arabica-coffee-beans.png',
  'robusta-coffee-beans': '/organics/tea-coffee/robusta-coffee-beans.png',
}

const productImagePath = (category, name) => {
  if (category === 'tea-coffee') {
    const slug = slugify(name)
    return teaCoffeeImageMap[slug] || `/organics/tea-coffee/${slug}.png`
  }

  return `/organics/${category}/${slugify(name)}.png`
}

const makeProduct = ({ name, category, tagline, hero, gallery, specs, applications, packaging, exportMarkets, certifications }) => ({
  slug: slugify(name),
  name,
  category,
  tagline,
  hero: hero ?? productImagePath(category, name),
  gallery: gallery ?? [productImagePath(category, name)],
  specs,
  applications,
  packaging,
  exportMarkets,
  certifications,
  details: buildProductDetails(name, category),
})

export const CATEGORIES = [
  {
    slug: 'seasonal-harvests',
    name: 'Seasonal Harvests',
    tagline: 'Fresh fruits, vegetables and peak-harvest crops for export buyers.',
    image: heroImages.seasonalHarvests,
  },
  {
    slug: 'seasonal-staples',
    name: 'Seasonal Staples',
    tagline: 'Rice, pulses and millets supplied in line with harvest cycles.',
    image: heroImages.seasonalStaples,
  },
  {
    slug: 'non-seasonal-essentials',
    name: 'Non-Seasonal Essentials',
    tagline: 'Dry spices, dehydrated vegetables and shelf-stable ingredients all year.',
    image: heroImages.nonSeasonalEssentials,
  },
  {
    slug: 'coconut-products',
    name: 'Coconut Products',
    tagline: 'Premium coconut derivatives for food, retail and industrial use.',
    image: heroImages.coconutProducts,
  },
  {
    slug: 'tea-coffee',
    name: 'Tea & Coffee',
    tagline: 'Plantation teas and specialty coffee beans from India’s best estates.',
    image: heroImages.teaCoffee,
  },
  {
    slug: 'value-added-ingredients',
    name: 'Value-Added Ingredients',
    tagline: 'Organic powders and herbal ingredients for wellness and food brands.',
    image: heroImages.valueAddedIngredients,
  },
]

const productGroups = [
  {
    category: 'seasonal-harvests',
    hero: heroImages.seasonalHarvests,
    gallery: galleryImages.seasonalHarvests,
    items: [
      'Alphonso Mango',
      'Kesar Mango',
      'Banganapalli Mango',
      'Totapuri Mango',
      'Banana',
      'Pomegranate',
      'Grapes',
      'Guava',
      'Papaya',
      'Fresh Coconut',
      'Fresh Ginger',
      'Fresh Turmeric',
      'Garlic',
      'Green Chilli',
      'Tomato',
      'Fresh Onion',
      'Potato',
    ],
  },
  {
    category: 'seasonal-staples',
    hero: heroImages.seasonalStaples,
    gallery: galleryImages.seasonalStaples,
    items: [
      '1121 Basmati Rice',
      'Pusa Basmati Rice',
      'Sona Masoori Rice',
      'Ponni Rice',
      'IR64 Rice',
      'Toor Dal',
      'Moong Dal',
      'Urad Dal',
      'Chana Dal',
      'Masoor Dal',
      'Foxtail Millet',
      'Finger Millet (Ragi)',
      'Pearl Millet (Bajra)',
      'Little Millet',
      'Barnyard Millet',
    ],
  },
  {
    category: 'non-seasonal-essentials',
    hero: heroImages.nonSeasonalEssentials,
    gallery: galleryImages.nonSeasonalEssentials,
    items: [
      'Black Pepper',
      'Green Cardamom',
      'Cumin Seeds',
      'Coriander Seeds',
      'Dry Red Chilli',
      'Fennel Seeds',
      'Fenugreek Seeds',
      'Mustard Seeds',
      'Cloves',
      'Cinnamon',
      'Turmeric Powder',
      'Chilli Powder',
      'Coriander Powder',
      'Cumin Powder',
      'Black Pepper Powder',
      'Dehydrated Onion',
      'Onion Powder',
      'Dehydrated Garlic',
      'Garlic Powder',
      'Dehydrated Ginger',
      'Ginger Powder',
      'Dehydrated Tomato',
      'Tomato Powder',
      'Curry Leaf Powder',
    ],
  },
  {
    category: 'coconut-products',
    hero: heroImages.coconutProducts,
    gallery: galleryImages.coconutProducts,
    items: [
      'Desiccated Coconut',
      'Coconut Powder',
      'Virgin Coconut Oil',
      'Coconut Flour',
      'Coconut Milk Powder',
    ],
  },
  {
    category: 'tea-coffee',
    hero: heroImages.teaCoffee,
    gallery: galleryImages.teaCoffee,
    items: [
      'Assam Tea',
      'Darjeeling Tea',
      'Nilgiri Tea',
      'Green Tea',
      'Arabica Coffee Beans',
      'Robusta Coffee Beans',
    ],
  },
  {
    category: 'value-added-ingredients',
    hero: heroImages.valueAddedIngredients,
    gallery: galleryImages.valueAddedIngredients,
    items: [
      'Moringa Powder',
      'Wheatgrass Powder',
      'Spirulina Powder',
      'Beetroot Powder',
      'Spinach Powder',
      'Amla Powder',
      'Ashwagandha Powder',
      'Triphala Powder',
      'Neem Powder',
      'Brahmi Powder',
      'Hibiscus Powder',
      'Aloe Vera Powder',
      'Aloe Vera Gel',
    ],
  },
]

const productTagline = (name, category) => {
  if (category === 'seasonal-harvests') return `${name} sourced fresh from India’s peak harvests for premium export markets.`
  if (category === 'seasonal-staples') return `${name} graded for export and bulk supply to food manufacturers and retail brands.`
  if (category === 'non-seasonal-essentials') return `${name} prepared and packed for dependable year-round ingredient supply.`
  if (category === 'coconut-products') return `${name} processed to food-grade standards for global retail and industrial use.`
  if (category === 'tea-coffee') return `${name} sourced from premium plantations for specialty export demand.`
  if (category === 'value-added-ingredients') return `${name} formulated for nutraceutical, wellness and private label products.`
  return `${name} export-grade supply from India.`
}

export const PRODUCTS = productGroups.flatMap((group) =>
  group.items.map((name) =>
    makeProduct({
      name,
      category: group.category,
      tagline: productTagline(name, group.category),
      specs: buildProductSpecs(name, group.category),
      applications: categoryDefaults[group.category].applications,
      packaging: categoryDefaults[group.category].packaging,
      exportMarkets: categoryDefaults[group.category].exportMarkets,
      certifications: categoryDefaults[group.category].certifications,
    })
  )
)

export function getProductsByCategory(cat) {
  return PRODUCTS.filter((p) => p.category === cat)
}
