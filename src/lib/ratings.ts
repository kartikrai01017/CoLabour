import { type Review } from './supabase';

export interface StarBreakdownItem {
  star: number;
  count: number;
  percentage: number;
}

export interface DynamicRatingResult {
  averageRating: number;
  formattedRating: string;
  totalReviews: number;
  starBreakdown: StarBreakdownItem[];
}

/**
 * Calculates the displayed rating dynamically from a worker's reviews array:
 * (sum of ratings / total reviews).toFixed(1)
 */
export function calculateDynamicRating(
  reviews?: Review[],
  fallbackRating: number = 5.0,
  fallbackCount: number = 0
): DynamicRatingResult {
  if (!reviews || reviews.length === 0) {
    const total = fallbackCount > 0 ? fallbackCount : 0;
    const avg = total > 0 ? fallbackRating : 5.0;
    const formatted = avg.toFixed(1);
    
    return {
      averageRating: avg,
      formattedRating: formatted,
      totalReviews: total,
      starBreakdown: [
        { star: 5, count: total > 0 ? total : 0, percentage: total > 0 ? 100 : 0 },
        { star: 4, count: 0, percentage: 0 },
        { star: 3, count: 0, percentage: 0 },
        { star: 2, count: 0, percentage: 0 },
        { star: 1, count: 0, percentage: 0 },
      ],
    };
  }

  const total = reviews.length;
  const sum = reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
  const average = total > 0 ? sum / total : fallbackRating;
  const formattedRating = (total > 0 ? average : fallbackRating).toFixed(1);

  const starCounts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((r) => {
    const star = Math.min(5, Math.max(1, Math.round(Number(r.rating) || 5)));
    starCounts[star] = (starCounts[star] || 0) + 1;
  });

  const starBreakdown: StarBreakdownItem[] = [5, 4, 3, 2, 1].map((star) => {
    const count = starCounts[star] || 0;
    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
    return { star, count, percentage };
  });

  return {
    averageRating: parseFloat(formattedRating),
    formattedRating,
    totalReviews: total,
    starBreakdown,
  };
}

// Trade Media & Project Thumbnail Mapping
export interface TradeMediaInfo {
  heroImage: string;
  avatarImage: string;
  projectGallery: { title: string; imageUrl: string }[];
  verifiedSpecialty: string;
}

export const TRADE_MEDIA_MAP: Record<string, TradeMediaInfo> = {
  Electrician: {
    heroImage: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
    avatarImage: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=300&q=80',
    verifiedSpecialty: 'Certified High-Voltage & Residential Wiring',
    projectGallery: [
      { title: 'Modular MCB Distribution Box', imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=400&q=80' },
      { title: 'Concealed LED Strip Lighting', imageUrl: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=400&q=80' },
      { title: 'Inverter & Solar Grid Setup', imageUrl: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=400&q=80' },
    ],
  },
  Plumber: {
    heroImage: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=800&q=80',
    avatarImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    verifiedSpecialty: 'PPR/CPVC Hydro-Piping & Sanitary Fixtures',
    projectGallery: [
      { title: 'Concealed Diverter Bath Fitting', imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=400&q=80' },
      { title: 'High-Pressure Booster Pump', imageUrl: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=400&q=80' },
      { title: 'Under-Sink RO Filter Plumbing', imageUrl: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=400&q=80' },
    ],
  },
  Carpenter: {
    heroImage: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=800&q=80',
    avatarImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    verifiedSpecialty: 'Modular Kitchens & Teak Wood Joinery',
    projectGallery: [
      { title: 'Custom Marine-Ply Wardrobe', imageUrl: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=400&q=80' },
      { title: 'Soft-Close Modular Cabinetry', imageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=400&q=80' },
      { title: 'Solid Teak Door Architrave', imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&q=80' },
    ],
  },
  Painter: {
    heroImage: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80',
    avatarImage: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=300&q=80',
    verifiedSpecialty: 'Airless Spray, Stencil Textures & Waterproofing',
    projectGallery: [
      { title: 'Royal Luxury Emulsion Finish', imageUrl: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=400&q=80' },
      { title: 'Geometric Accent Feature Wall', imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&q=80' },
      { title: 'Exterior Weatherproof Coat', imageUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=400&q=80' },
    ],
  },
  Cleaner: {
    heroImage: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80',
    avatarImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    verifiedSpecialty: 'Deep Steam Sanitization & Marble Buffing',
    projectGallery: [
      { title: 'Industrial Steam Kitchen Degrease', imageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=400&q=80' },
      { title: 'Italian Marble Polishing', imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80' },
      { title: 'Fabric Sofa Shampoo Sanitization', imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=400&q=80' },
    ],
  },
  Driver: {
    heroImage: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=800&q=80',
    avatarImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80',
    verifiedSpecialty: 'Commercial LMV Badge & Inter-City Route Expert',
    projectGallery: [
      { title: 'Airport Outstation Chauffeur', imageUrl: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=400&q=80' },
      { title: 'Executive EV Sedan Service', imageUrl: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=400&q=80' },
      { title: 'Long-Haul Highway Escort', imageUrl: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=400&q=80' },
    ],
  },
  Gardener: {
    heroImage: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=800&q=80',
    avatarImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80',
    verifiedSpecialty: 'Bonsai Pruning, Organic Hydroponics & Terrace Lawns',
    projectGallery: [
      { title: 'Terrace Hydroponic Garden', imageUrl: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=400&q=80' },
      { title: 'Automated Drip Irrigation Turf', imageUrl: 'https://images.unsplash.com/photo-1557429287-b2e26467fc2b?auto=format&fit=crop&w=400&q=80' },
      { title: 'Ornamental Topiary Pruning', imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=400&q=80' },
    ],
  },
  Caregiver: {
    heroImage: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=800&q=80',
    avatarImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    verifiedSpecialty: 'Geriatric Nursing, Vitals Monitoring & Post-Op Care',
    projectGallery: [
      { title: 'Geriatric Mobility Support', imageUrl: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=400&q=80' },
      { title: 'Digital Vitals & Medication Log', imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=400&q=80' },
      { title: 'Physical Rehab Physiotherapy', imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=400&q=80' },
    ],
  },
  Technician: {
    heroImage: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    avatarImage: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80',
    verifiedSpecialty: 'Inverter Inverter AC Gas Charge, PCB Repair & Diagnostics',
    projectGallery: [
      { title: 'Inverter Split AC PCB Circuit Repair', imageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=400&q=80' },
      { title: 'HVAC Jet Pressure Service', imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80' },
      { title: 'Digital Multimeter Calibration', imageUrl: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=400&q=80' },
    ],
  },
};

export function getTradeMedia(category: string): TradeMediaInfo {
  return TRADE_MEDIA_MAP[category] || TRADE_MEDIA_MAP['Technician'];
}

// Initial customer reviews generator (returns empty array for real database reviews)
export function getInitialReviewsForWorker(): Review[] {
  return [];
}
