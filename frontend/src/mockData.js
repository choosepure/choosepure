// Mock data for the ChoosePure community platform

export const testReports = [
  {
    id: '1',
    productName: 'Amul Gold Milk',
    brand: 'Amul',
    category: 'Dairy',
    purityScore: 9.6,
    testDate: '2025-01-15',
    testedBy: 'NABL Certified Lab',
    image: 'https://images.unsplash.com/photo-1668243304603-7ecf4eefba6e',
    parameters: [
      { name: 'Fat Content', result: '4.5%', status: 'pass' },
      { name: 'SNF', result: '8.7%', status: 'pass' },
      { name: 'Adulterants', result: 'None Detected', status: 'pass' },
      { name: 'Antibiotics', result: 'Not Found', status: 'pass' }
    ],
    summary: 'Excellent purity. No adulterants detected. Meets all FSSAI standards.'
  },
  {
    id: '2',
    productName: 'Mother Dairy Milk',
    brand: 'Mother Dairy',
    category: 'Dairy',
    purityScore: 8.8,
    testDate: '2025-01-15',
    testedBy: 'NABL Certified Lab',
    image: 'https://images.unsplash.com/photo-1659353887617-8cf154b312c5',
    parameters: [
      { name: 'Fat Content', result: '4.2%', status: 'pass' },
      { name: 'SNF', result: '8.5%', status: 'pass' },
      { name: 'Adulterants', result: 'None Detected', status: 'pass' },
      { name: 'Antibiotics', result: 'Not Found', status: 'pass' }
    ],
    summary: 'Good purity. Meets FSSAI standards with minor variations.'
  },
  {
    id: '3',
    productName: 'Dabur Honey',
    brand: 'Dabur',
    category: 'Sweeteners',
    purityScore: 7.2,
    testDate: '2025-01-10',
    testedBy: 'FSSAI Approved Lab',
    image: 'https://images.pexels.com/photos/14797915/pexels-photo-14797915.jpeg',
    parameters: [
      { name: 'Sugar Composition', result: 'Natural', status: 'pass' },
      { name: 'Moisture Content', result: '18%', status: 'warning' },
      { name: 'Antibiotics', result: 'Not Found', status: 'pass' },
      { name: 'Additives', result: 'None', status: 'pass' }
    ],
    summary: 'Acceptable purity. Slight moisture concerns but within limits.'
  }
];

export const upcomingTests = [
  {
    id: '1',
    productCategory: 'Cooking Oil',
    votes: 342,
    funded: 78,
    targetFunding: 100,
    estimatedTestDate: '2025-02-01',
    description: 'Testing purity of popular cooking oil brands for adulterants and chemical residues'
  },
  {
    id: '2',
    productCategory: 'Turmeric Powder',
    votes: 289,
    funded: 65,
    targetFunding: 100,
    estimatedTestDate: '2025-02-10',
    description: 'Checking for lead chromate, synthetic colors, and starch adulteration'
  },
  {
    id: '3',
    productCategory: 'Paneer',
    votes: 256,
    funded: 52,
    targetFunding: 100,
    estimatedTestDate: '2025-02-15',
    description: 'Testing for starch, detergent, and urea contamination'
  },
  {
    id: '4',
    productCategory: 'Atta (Wheat Flour)',
    votes: 198,
    funded: 41,
    targetFunding: 100,
    estimatedTestDate: '2025-02-20',
    description: 'Analyzing nutritional content and checking for adulteration'
  }
];

export const forumPosts = [
  {
    id: '1',
    author: 'Priya Sharma',
    authorImage: 'https://i.pravatar.cc/150?img=1',
    title: 'Shocked by the honey test results!',
    content: 'I\'ve been using Brand X honey for years thinking it was pure. The test results opened my eyes. Thank you ChoosePure!',
    category: 'Test Results',
    replies: 23,
    likes: 45,
    timeAgo: '2 hours ago'
  },
  {
    id: '2',
    author: 'Rajesh Kumar',
    authorImage: 'https://i.pravatar.cc/150?img=12',
    title: 'Which ghee brand should we test next?',
    content: 'Looking for community input on which ghee brands we should prioritize for testing. Drop your suggestions!',
    category: 'Voting',
    replies: 67,
    likes: 89,
    timeAgo: '5 hours ago'
  },
  {
    id: '3',
    author: 'Anjali Patel',
    authorImage: 'https://i.pravatar.cc/150?img=5',
    title: 'How to identify fake spices at home?',
    content: 'While we wait for test results, here are some quick home tests you can do to check spice purity...',
    category: 'Tips & Tricks',
    replies: 34,
    likes: 112,
    timeAgo: '1 day ago'
  },
  {
    id: '4',
    author: 'Vikram Reddy',
    authorImage: 'https://i.pravatar.cc/150?img=13',
    title: 'Community milestone: 1000 members!',
    content: 'We\'ve reached 1000 responsible parents! Together we\'re making food transparency a reality.',
    category: 'Announcements',
    replies: 156,
    likes: 892,
    timeAgo: '2 days ago'
  }
];

export const blogPosts = [
  {
    id: '1',
    title: 'The Hidden Dangers of Adulterated Turmeric',
    excerpt: 'Lead chromate in turmeric powder is a serious health hazard. Learn how to identify and avoid it.',
    author: 'Dr. Meera Singh',
    publishDate: '2025-01-20',
    readTime: '5 min read',
    category: 'Food Safety',
    image: 'https://images.pexels.com/photos/9345627/pexels-photo-9345627.jpeg',
    views: 1234
  },
  {
    id: '2',
    title: 'Understanding Food Safety Standards: FSSAI, FDA, and EFSA',
    excerpt: 'A comprehensive guide to global food safety standards and what they mean for Indian consumers.',
    author: 'Team ChoosePure',
    publishDate: '2025-01-18',
    readTime: '8 min read',
    category: 'Education',
    image: 'https://images.pexels.com/photos/9345625/pexels-photo-9345625.jpeg',
    views: 2341
  },
  {
    id: '3',
    title: 'How We Test: Inside Our Laboratory Process',
    excerpt: 'Transparency is our promise. Here\'s exactly how we conduct independent food testing.',
    author: 'Lab Team',
    publishDate: '2025-01-15',
    readTime: '6 min read',
    category: 'Behind the Scenes',
    image: 'https://images.unsplash.com/photo-1668243304603-7ecf4eefba6e',
    views: 3456
  },
  {
    id: '4',
    title: '10 Simple Home Tests for Food Purity',
    excerpt: 'Quick DIY tests you can perform at home to check if your food is adulterated.',
    author: 'Nutritionist Team',
    publishDate: '2025-01-12',
    readTime: '4 min read',
    category: 'DIY Tips',
    image: 'https://images.unsplash.com/photo-1660015154762-c9b086d796e4',
    views: 5678
  },
  {
    id: '5',
    title: 'The Power of Community-Driven Testing',
    excerpt: 'How 1000 parents are changing the food industry by demanding transparency.',
    author: 'Team ChoosePure',
    publishDate: '2025-01-10',
    readTime: '7 min read',
    category: 'Community',
    image: 'https://images.unsplash.com/photo-1660015155339-c224fae66104',
    views: 4321
  },
  {
    id: '6',
    title: 'Milk Adulteration: What Every Parent Should Know',
    excerpt: 'From detergent to synthetic milk, understanding common milk adulterants and their health impacts.',
    author: 'Dr. Rajesh Verma',
    publishDate: '2025-01-08',
    readTime: '6 min read',
    category: 'Food Safety',
    image: 'https://images.unsplash.com/photo-1639979511096-e3fa0348eb16',
    views: 6789
  }
];

export const testimonials = [
  {
    id: '1',
    name: 'Rajesh Kumar',
    role: 'Father of 9-year-old',
    location: 'Mumbai',
    image: 'https://images.pexels.com/photos/8819149/pexels-photo-8819149.jpeg',
    quote: 'I used to think all paneer brands were pure - until ChoosePure showed how much purity can really vary. Now I only trust what our community tests.',
    rating: 5
  },
  {
    id: '2',
    name: 'Ritu Sharma',
    role: 'Mother of 5-year-old',
    location: 'Delhi',
    image: 'https://images.unsplash.com/photo-1764967411658-64b8bdecb0be',
    quote: 'As a mom, I finally feel confident about what I buy. ChoosePure has given me peace of mind.',
    rating: 5
  },
  {
    id: '3',
    name: 'Anil Patel',
    role: 'Parent',
    location: 'Bangalore',
    image: 'https://images.pexels.com/photos/8819149/pexels-photo-8819149.jpeg',
    quote: 'It\'s amazing to be part of something that holds brands accountable. This is the future of food safety.',
    rating: 5
  },
  {
    id: '4',
    name: 'Priya Reddy',
    role: 'Mother of 7-year-old',
    location: 'Hyderabad',
    image: 'https://images.unsplash.com/photo-1764967411658-64b8bdecb0be',
    quote: 'Finally someone\'s testing food for our kids, not just for brands. This community is a game-changer.',
    rating: 5
  },
  {
    id: '5',
    name: 'Vikram Singh',
    role: 'Father of twins',
    location: 'Pune',
    image: 'https://images.pexels.com/photos/8819149/pexels-photo-8819149.jpeg',
    quote: 'The transparency and unbiased testing give me confidence. Worth every rupee contributed.',
    rating: 5
  },
  {
    id: '6',
    name: 'Meera Joshi',
    role: 'Mother of 3-year-old',
    location: 'Ahmedabad',
    image: 'https://images.unsplash.com/photo-1764967411658-64b8bdecb0be',
    quote: 'This is what India needs. Real parents, real tests, real results. Proud to be part of this movement.',
    rating: 5
  }
];

export const communityStats = {
  totalMembers: 1247,
  testsCompleted: 28,
  productsAnalyzed: 156,
  fundsPooled: 142000,
  upcomingTests: 4,
  activePosts: 89
};

export const labPartners = [
  {
    id: '1',
    name: 'NABL Certified Lab',
    accreditation: 'NABL, FSSAI',
    image: 'https://via.placeholder.com/200x100?text=NABL+Lab'
  },
  {
    id: '2',
    name: 'FSSAI Approved Testing Facility',
    accreditation: 'FSSAI, ISO 17025',
    image: 'https://via.placeholder.com/200x100?text=FSSAI+Lab'
  },
  {
    id: '3',
    name: 'Food Safety Lab India',
    accreditation: 'ISO 17025, GLP',
    image: 'https://via.placeholder.com/200x100?text=Safety+Lab'
  }
];

export const features = [
  {
    icon: 'FlaskConical',
    title: 'Global-Standard Testing',
    description: 'Products tested in certified labs following FSSAI, US FDA, and EFSA standards.'
  },
  {
    icon: 'Users',
    title: 'Driven By Parents',
    description: 'Tests driven by parents, not brands — ensuring unbiased and transparent results.'
  },
  {
    icon: 'FileCheck',
    title: 'Reports You Can Trust',
    description: 'Tests are community-funded, ensuring unbiased and transparent outcomes.'
  }
];

export const howItWorks = [
  {
    icon: 'UsersRound',
    title: 'Parents Power the Tests',
    description: 'Families pool funds to test everyday foods that matter most to them.'
  },
  {
    icon: 'Microscope',
    title: 'Independent Lab Analysis',
    description: 'ChoosePure partners with certified labs to test products without brand influence.'
  },
  {
    icon: 'FileText',
    title: 'Results Shared Openly',
    description: 'Purity reports are shared with the community — creating transparency and accountability.'
  }
];

export const foodDangers = [
  {
    title: 'Fake Paneer',
    subtitle: 'Detected detergent traces',
    description: 'Many popular dairy products contain hidden chemicals - pesticides, detergents, starch, and even urea.',
    image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da',
    icon: 'AlertTriangle'
  },
  {
    title: 'Adulterated Spices',
    subtitle: 'Low Purity Score',
    description: '1 in 5 foods in India is found to be adulterated. From turmeric laced with lead chromate to chili powder with textile dyes.',
    image: 'https://images.pexels.com/photos/9345627/pexels-photo-9345627.jpeg',
    icon: 'AlertTriangle'
  }
];
