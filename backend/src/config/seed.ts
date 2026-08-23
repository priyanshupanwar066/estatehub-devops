import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Property from '../models/Property.js';

const IMAGES = {
  apartment: [
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1560185127-6a2806647f81?auto=format&fit=crop&w=800&q=80'
  ],
  house: [
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1513584684374-8bab748fbf90?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'
  ],
  villa: [
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=800&q=80'
  ],
  plot: [
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80'
  ]
};

const CITIES = ['New York', 'Los Angeles', 'Chicago', 'Miami', 'Houston', 'San Francisco', 'Seattle', 'Austin'];

const NEIGHBORHOODS: Record<string, string[]> = {
  'New York': ['Manhattan', 'Brooklyn Heights', 'Astoria', 'Williamsburg', 'Upper East Side', 'SoHo'],
  'Los Angeles': ['Beverly Hills', 'Santa Monica', 'Venice Beach', 'Pasadena', 'Hollywood Hills', 'Silver Lake'],
  'Chicago': ['Lincoln Park', 'Loop', 'Wicker Park', 'Lakeview', 'Gold Coast', 'River North'],
  'Miami': ['South Beach', 'Brickell', 'Coconut Grove', 'Coral Gables', 'Key Biscayne', 'Wynwood'],
  'Houston': ['The Heights', 'Downtown', 'Montrose', 'River Oaks', 'Midtown', 'Museum District'],
  'San Francisco': ['Pacific Heights', 'Mission District', 'Noe Valley', 'SOMA', 'Marina District', 'Nob Hill'],
  'Seattle': ['Capitol Hill', 'Ballard', 'Queen Anne', 'Fremont', 'Downtown', 'West Seattle'],
  'Austin': ['Downtown', 'South Congress', 'East Austin', 'Zilker', 'West Lake Hills', 'Tarrytown']
};

const ADJECTIVES = [
  'Elegant', 'Modern', 'Cozy', 'Spacious', 'Luxurious', 'Minimalist', 'Charming', 'Sun-drenched', 
  'Stunning', 'Classic', 'Contemporary', 'Executive', 'Premium', 'Quiet', 'Beautiful', 'Sleek', 
  'Gorgeous', 'Grand', 'Renovated', 'Artistic', 'Splendid', 'Serene', 'Exquisite', 'Vibrant'
];

const NOUNS: Record<string, string[]> = {
  apartment: ['Condo', 'Penthouse', 'Loft', 'Apartment', 'Studio Suite', 'Duplex'],
  house: ['Family Home', 'Cottage', 'Townhouse', 'Residencial', 'Suburban Home', 'Bungalow'],
  villa: ['Luxury Villa', 'Estate', 'Retreat', 'Mansion', 'Scenic Villa', 'Oasis'],
  plot: ['Residential Plot', 'Development Land', 'Scenic Lot', 'Prime Plot', 'Building Site', 'Parcel']
};

export async function seedProperties() {
  try {
    const propertyCount = await Property.countDocuments();
    if (propertyCount > 10) {
      console.log(`Database already has ${propertyCount} properties. Skipping seeding.`);
      return;
    }

    console.log('Seeding database with default user and 100 dummy properties...');

    // Find or create an agent user
    let agent = await User.findOne({ role: 'agent' });
    if (!agent) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);
      agent = await User.create({
        name: 'Sarah Jenkins',
        email: 'sarah.jenkins@estatehub.co',
        password: hashedPassword,
        role: 'agent',
        favorites: []
      });
      console.log('Created default agent user: sarah.jenkins@estatehub.co');
    }

    const propertiesToInsert = [];
    const types: ('apartment' | 'house' | 'villa' | 'plot')[] = ['apartment', 'house', 'villa', 'plot'];

    for (let i = 1; i <= 100; i++) {
      // Determine type sequentially or semi-randomly to guarantee exact distribution
      const propertyType = types[(i - 1) % types.length];
      const city = CITIES[(i - 1) % CITIES.length];
      const neighborhoods = NEIGHBORHOODS[city];
      const neighborhood = neighborhoods[Math.floor(Math.random() * neighborhoods.length)];
      
      const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
      const nounList = NOUNS[propertyType];
      const noun = nounList[Math.floor(Math.random() * nounList.length)];
      const title = `${adjective} ${noun} in ${neighborhood}`;

      const status = i % 2 === 0 ? 'for-sale' : 'for-rent';

      // Setup specs
      let bedrooms = 0;
      let bathrooms = 0;
      let area = 0;
      let price = 0;

      if (propertyType === 'apartment') {
        bedrooms = Math.floor(Math.random() * 3) + 1; // 1 to 3 bedrooms
        bathrooms = Math.floor(Math.random() * 2) + 1; // 1 to 2 bathrooms
        area = 600 + Math.floor(Math.random() * 1200); // 600 to 1800 sq ft
        if (status === 'for-rent') {
          price = 1500 + Math.floor(Math.random() * 3500); // 1500 to 5000
        } else {
          price = 220000 + Math.floor(Math.random() * 680000); // 220k to 900k
        }
      } else if (propertyType === 'house') {
        bedrooms = Math.floor(Math.random() * 3) + 3; // 3 to 5 bedrooms
        bathrooms = Math.floor(Math.random() * 2) + 2; // 2 to 3 bathrooms
        area = 1500 + Math.floor(Math.random() * 2500); // 1500 to 4000 sq ft
        if (status === 'for-rent') {
          price = 2500 + Math.floor(Math.random() * 5500); // 2500 to 8000
        } else {
          price = 450000 + Math.floor(Math.random() * 1250000); // 450k to 1.7m
        }
      } else if (propertyType === 'villa') {
        bedrooms = Math.floor(Math.random() * 4) + 4; // 4 to 7 bedrooms
        bathrooms = Math.floor(Math.random() * 4) + 3; // 3 to 6 bathrooms
        area = 3500 + Math.floor(Math.random() * 6500); // 3500 to 10000 sq ft
        if (status === 'for-rent') {
          price = 6000 + Math.floor(Math.random() * 14000); // 6k to 20k
        } else {
          price = 1200000 + Math.floor(Math.random() * 4800000); // 1.2m to 6m
        }
      } else if (propertyType === 'plot') {
        bedrooms = 0;
        bathrooms = 0;
        area = 2000 + Math.floor(Math.random() * 18000); // 2000 to 20000 sq ft
        if (status === 'for-rent') {
          price = 500 + Math.floor(Math.random() * 2500); // 500 to 3000
        } else {
          price = 80000 + Math.floor(Math.random() * 620000); // 80k to 700k
        }
      }

      // Images matching the property type
      const imageList = IMAGES[propertyType];
      // Select 2-4 unique images
      const shuffled = [...imageList].sort(() => 0.5 - Math.random());
      const selectedImages = shuffled.slice(0, Math.min(3, shuffled.length));

      const description = `This exceptional ${propertyType} offers a perfect blend of style, comfort, and convenience. Nestled in the sought-after neighborhood of ${neighborhood} in ${city}, this property boasts exquisite design elements and a functional layout. \n\nInside, you will find light-filled living spaces, modern premium fixtures, and ample room for entertainment or relaxation. The area has great proximity to high-rated local schools, premium dining spots, boutique shopping, and excellent transit links. Perfect for discerning buyers or renters seeking the ultimate living experience.`;

      const address = `${Math.floor(Math.random() * 9800) + 100} ${neighborhood} Blvd`;

      propertiesToInsert.push({
        title,
        description,
        price,
        location: {
          city,
          address
        },
        propertyType,
        bedrooms,
        bathrooms,
        area,
        images: selectedImages,
        status,
        createdBy: agent._id
      });
    }

    await Property.insertMany(propertiesToInsert);
    console.log(`Successfully seeded 100 property listings inside the database!`);
  } catch (error) {
    console.error('Error seeding properties:', error);
  }
}
