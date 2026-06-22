const content = {
  home: {
    hero: {
      title: 'Refined interior solutions for homes, offices, and retail spaces.',
      description:
        'MTI Professional Interiors and Decor delivers elegant curtains, blinds, wallpapers, flooring, furniture, and complete interior styling with a premium showroom experience.',
    },
    offer: {
      title: 'Free initial design discussion',
      description:
        'Selected residential and boutique commercial projects can start with a complimentary concept discussion and material direction session.',
    },
    highlights: [
      { label: 'Projects delivered', value: '148+' },
      { label: 'Repeat clients', value: '72%' },
      { label: 'Design categories', value: '12' },
    ],
    quickLinks: [
      { label: 'Curtains and blinds', href: '#services' },
      { label: 'Portfolio showcase', href: '#portfolio' },
      { label: 'Book consultation', href: '#consultation' },
    ],
  },
  about: {
    eyebrow: 'Why Choose MTI',
    title: 'A more focused and professional experience from selection to installation',
    description:
      'MTI blends showroom-backed guidance, coordinated material selection, and on-ground installation support to make each project feel composed and complete.',
    facts: [
      'Residential interior styling',
      'Boutique and office decor upgrades',
      'Custom blinds and drapery solutions',
      'Wall treatments and flooring direction',
    ],
  },
  contact: {
    address: 'Shop No. 11, Tower H, Bahria Heights, Bahria Town Karachi',
    primaryPhone: '0321-2323611',
    secondaryPhone: '0307-6401155',
    whatsapp: 'https://wa.me/923212323611',
    email: 'info@mtiinteriors.com',
  },
  appearance: {
    primaryColor: '#2f1b12',
    accentColor: '#c6954f',
    backgroundTone: '#fdf8f2',
    fontHeading: 'Cormorant Garamond',
    fontBody: 'Manrope',
  },
  seo: {
    siteTitle: 'MTI Professional Interiors and Decor',
    metaDescription:
      'Premium interior design, curtains, blinds, wallpapers, flooring, and furniture solutions by MTI Professional Interiors and Decor.',
    keywords:
      'interior design, curtains, blinds, wallpapers, flooring, furniture, decor, Karachi, professional interior design',
  },
  banners: [
    {
      id: 'banner-1',
      title: 'Made to Inspire',
      imageUrl: '/brand/a4.jpeg',
      active: true,
    },
  ],
  quotationRates: {
    curtainClassicLinen: 1500,
    curtainSilkVelvet: 3200,
    curtainRoyalBrocade: 4800,
    curtainStandardTrack: 5000,
    curtainMotorizedSomfy: 25000,
    blindZebra: 400,
    blindWoodenVenetian: 900,
    blindSomfyMotorized: 1800,
    wallpaperMetallicFoil: 350,
    wallpaperPremiumTextured: 500,
    wallpaperWoodRafter: 1200,
    flooringSpruceLaminate: 550,
    flooringEngineeredOak: 1400,
    flooringWaterproofVinyl: 750,
  },
};

const services = [
  {
    id: 'service-1',
    name: 'Curtains and drapery',
    category: 'Soft Furnishing',
    description:
      'Fabric selection, stitching, tracks, rods, sheers, blackout layers, and styling for finished rooms.',
    timeline: '5-10 days',
    price: 'Starts at Rs. 18,000',
    featured: true,
  },
  {
    id: 'service-2',
    name: 'Window blinds',
    category: 'Shading Solutions',
    description:
      'Roller, Roman, Venetian, zebra, and motorized blinds designed for privacy, light control, and elegance.',
    timeline: '4-8 days',
    price: 'Starts at Rs. 15,000',
    featured: true,
  },
  {
    id: 'service-3',
    name: 'Wallpaper and panels',
    category: 'Wall Finishes',
    description:
      'Statement walls, wall rafters, decorative panels, and coordinated finish recommendations for modern interiors.',
    timeline: '3-7 days',
    price: 'Starts at Rs. 12,000',
    featured: true,
  },
  {
    id: 'service-4',
    name: 'Flooring solutions',
    category: 'Surface Styling',
    description:
      'Laminate, vinyl, wood-look finishes, and practical recommendations based on durability and room use.',
    timeline: '1-2 weeks',
    price: 'Starts at Rs. 22,000',
    featured: false,
  },
  {
    id: 'service-5',
    name: 'Furniture sourcing',
    category: 'Furniture',
    description:
      'Dining sets, lounge seating, bedroom accents, and custom furniture planning suited to each layout.',
    timeline: '2-4 weeks',
    price: 'Starts at Rs. 45,000',
    featured: false,
  },
  {
    id: 'service-6',
    name: 'Complete interior styling',
    category: 'Turnkey Design',
    description:
      'A coordinated approach covering materials, color direction, furnishing, accessorizing, and final setup.',
    timeline: 'Project based',
    price: 'Custom quote',
    featured: true,
  },
];

const processItems = [
  {
    id: 'process-1',
    step: '01',
    title: 'Discovery and requirements',
    description:
      'We understand your space, goals, budget, and style preferences before suggesting any materials.',
  },
  {
    id: 'process-2',
    step: '02',
    title: 'Concept and selection',
    description:
      'Our team presents suitable options for finishes, furniture, and window solutions with a more refined direction.',
  },
  {
    id: 'process-3',
    step: '03',
    title: 'Quotation and approval',
    description:
      'You receive a clear scope, pricing, and timeline before production, sourcing, or installation begins.',
  },
  {
    id: 'process-4',
    step: '04',
    title: 'Execution and finishing',
    description:
      'Installation, styling, and final handover are completed with attention to proportion, comfort, and finish quality.',
  },
];

const projects = [
  {
    id: 'project-1',
    category: 'Curtains',
    title: 'Pearl Residence formal lounge',
    location: 'Lahore',
    description:
      'Layered sheers and blackout drapes finished with bronze accessories for a calm luxury mood.',
    imageUrl: '/brand/a4.jpeg',
    videoUrl: '',
    featured: true,
  },
  {
    id: 'project-2',
    category: 'Wallpapers',
    title: 'Ivory Boutique feature wall',
    location: 'Islamabad',
    description:
      'Botanical wallpaper balanced with arched display shelves for a retail-ready statement backdrop.',
    imageUrl: '/brand/a1.jpeg',
    videoUrl: '',
    featured: true,
  },
  {
    id: 'project-3',
    category: 'Flooring',
    title: 'Oak Haven apartment revamp',
    location: 'Karachi',
    description:
      'Warm herringbone flooring paired with concealed lighting and neutral textiles across the living zone.',
    imageUrl: '/brand/a2.jpeg',
    videoUrl: '',
    featured: false,
  },
  {
    id: 'project-4',
    category: 'Furniture',
    title: 'Executive office suite',
    location: 'Rawalpindi',
    description:
      'Custom walnut desks, leather seating, and shelving designed for functional prestige.',
    imageUrl: '/brand/a3.jpeg',
    videoUrl: '',
    featured: true,
  },
];

const products = [
  {
    id: 'product-1',
    name: 'Velvet crescent sofa',
    category: 'Furniture',
    material: 'Velvet upholstery',
    specification:
      'Three-seater lounge sofa with brass-finished legs and medium-firm seating.',
    price: 980,
    imageUrl: '/brand/a3.jpeg',
    swatch: 'linear-gradient(135deg, #9f7660, #d8b5a0)',
    featured: true,
  },
  {
    id: 'product-2',
    name: 'Oakline dining table',
    category: 'Furniture',
    material: 'Solid oak',
    specification:
      'Six-seat handcrafted table with matte protective finish and soft-radius edges.',
    price: 1200,
    imageUrl: '/brand/a4.jpeg',
    swatch: 'linear-gradient(135deg, #a97d49, #edd1a9)',
    featured: true,
  },
  {
    id: 'product-3',
    name: 'Linen Roman blinds',
    category: 'Blinds',
    material: 'Textured linen blend',
    specification:
      'Light-filtering blinds available in neutral tones with manual or motorized control.',
    price: 240,
    imageUrl: '/brand/a1.jpeg',
    swatch: 'linear-gradient(135deg, #b9b0a1, #f1ece1)',
    featured: true,
  },
  {
    id: 'product-4',
    name: 'Halo pendant cluster',
    category: 'Lighting',
    material: 'Glass and brass',
    specification:
      'Modern ceiling cluster for dining and entrance spaces with warm ambient output.',
    price: 340,
    imageUrl: '/brand/a2.jpeg',
    swatch: 'linear-gradient(135deg, #6b5a4b, #cab399)',
    featured: false,
  },
];

const reviews = [
  {
    id: 'review-1',
    name: 'Areeba Malik',
    rating: 5,
    comment:
      'The MTI team handled our curtains, wallpaper, and furniture selection beautifully. The entire space feels elevated.',
    approved: true,
  },
  {
    id: 'review-2',
    name: 'Faisal Khan',
    rating: 5,
    comment:
      'We booked an on-site consultation and received practical layout advice plus a polished material palette.',
    approved: true,
  },
  {
    id: 'review-3',
    name: 'Nadia Riaz',
    rating: 4,
    comment:
      'Fast communication, tasteful proposals, and strong follow-through during installation.',
    approved: true,
  },
];

const users = [
  {
    id: 'user-super',
    name: 'MTI Super Admin',
    email: 'superadmin@mtiinteriors.com',
    password: 'SuperAdmin123!',
    role: 'superadmin',
    phone: '+92 321 2323611',
    status: 'active',
  },
  {
    id: 'user-1',
    name: 'MTI Admin',
    email: 'admin@mtiinteriors.com',
    password: 'Admin123!',
    role: 'admin',
    phone: '+92 300 1234567',
    status: 'active',
  },
  {
    id: 'user-2',
    name: 'Sara Client',
    email: 'sara@example.com',
    password: 'Client123!',
    role: 'user',
    phone: '+92 311 7654321',
    status: 'active',
  },
];

const bookings = [
  {
    id: 'booking-1',
    reference: 'MTI-1001',
    name: 'Ali Raza',
    phone: '+92 300 5551111',
    date: '2026-05-18',
    time: '14:00',
    consultationType: 'On-site consultation',
    spaceType: 'Drawing room',
    requirements: 'Need curtains, wallpaper, and accent furniture.',
    status: 'pending',
    notes: '',
  },
];

const inquiries = [
  {
    id: 'inquiry-1',
    name: 'Hina Saeed',
    email: 'hina@example.com',
    phone: '+92 333 2221111',
    subject: 'Bedroom renovation',
    message: 'Looking for wallpaper and blinds suggestions for a master bedroom.',
    status: 'new',
    reply: '',
  },
];

const blogs = [
  {
    id: 'blog-1',
    title: 'Choosing the right blinds for modern living rooms',
    excerpt:
      'A practical guide to balancing privacy, sunlight control, and interior softness through blind selection.',
    published: true,
  },
];

const notifications = [
  {
    id: 'notification-1',
    title: 'Summer decor offer',
    channel: 'email',
    body: 'Special pricing on selected curtain and wallpaper combinations.',
    active: true,
  },
  {
    id: 'notification-2',
    title: 'Booking confirmation template',
    channel: 'sms',
    body: 'Your MTI consultation has been received. We will confirm shortly.',
    active: true,
  },
];

const analytics = {
  visitorsToday: 188,
  weeklyVisitors: 1324,
  monthlyVisitors: 5480,
  activeCampaigns: 3,
  conversionRate: '7.4%',
};

const backups = [
  {
    id: 'backup-1',
    label: 'Nightly backup',
    createdAt: '2026-05-14T20:00:00.000Z',
    status: 'completed',
  },
];

const security = {
  passwordPolicy: 'Minimum 8 characters with letters and numbers',
  backupEnabled: true,
  recoveryEmail: 'admin@mtiinteriors.com',
  lastBackupAt: '2026-05-14T20:00:00.000Z',
};

module.exports = {
  analytics,
  backups,
  blogs,
  bookings,
  content,
  inquiries,
  notifications,
  processItems,
  products,
  projects,
  reviews,
  security,
  services,
  users,
};
