export const KENYAN_COUNTIES = [
  'All',
  'National',
  'Baringo', 'Bomet', 'Bungoma', 'Busia', 'Elgeyo Marakwet', 'Embu',
  'Garissa', 'Homa Bay', 'Isiolo', 'Kajiado', 'Kakamega', 'Kericho',
  'Kiambu', 'Kilifi', 'Kirinyaga', 'Kisii', 'Kisumu', 'Kitui',
  'Kwale', 'Laikipia', 'Lamu', 'Machakos', 'Makueni', 'Mandera',
  'Marsabit', 'Meru', 'Migori', 'Mombasa', "Murang'a", 'Nairobi',
  'Nakuru', 'Nandi', 'Narok', 'Nyamira', 'Nyandarua', 'Nyeri',
  'Samburu', 'Siaya', 'Taita Taveta', 'Tana River', 'Tharaka Nithi',
  'Trans Nzoia', 'Turkana', 'Uasin Gishu', 'Vihiga', 'Wajir', 'West Pokot'
];

export const ALERT_CATEGORIES = [
  { key: 'ALL', label: 'All Alerts' },
  { key: 'OFFICIAL', label: 'Official Notices' },
  { key: 'UTILITIES', label: 'Utility Downtime' },
  { key: 'SAFETY', label: 'Public Safety' },
  { key: 'WEATHER', label: 'Weather & Climate' },
  { key: 'COMMUNITY', label: 'Community Advisories' }
];

export const ALERT_TYPES = [
  'OFFICIAL_COUNTY_ALERT',
  'GOVERNMENT_ADVISORY',
  'UTILITY_DOWNTIME',
  'PUBLIC_SAFETY',
  'WEATHER_ENVIRONMENTAL',
  'COMMUNITY_ADVISORY'
];

export const ALERT_SEVERITIES = ['CRITICAL', 'HIGH', 'MODERATE', 'LOW', 'INFO'];

export const ALERT_TYPE_LABELS = {
  OFFICIAL_COUNTY_ALERT: 'Official County Alert',
  GOVERNMENT_ADVISORY: 'Government Advisory',
  UTILITY_DOWNTIME: 'Utility Downtime',
  PUBLIC_SAFETY: 'Public Safety Notice',
  WEATHER_ENVIRONMENTAL: 'Weather / Environmental',
  COMMUNITY_ADVISORY: 'Community Advisory'
};

export const SEVERITY_CONFIG = {
  CRITICAL: {
    label: 'Critical',
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    badge: 'bg-red-100 text-red-800 border-red-200',
    dot: 'bg-red-600'
  },
  HIGH: {
    label: 'High Severity',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
    badge: 'bg-amber-100 text-amber-800 border-amber-200',
    dot: 'bg-amber-500'
  },
  MODERATE: {
    label: 'Moderate',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    badge: 'bg-blue-100 text-blue-800 border-blue-200',
    dot: 'bg-blue-500'
  },
  LOW: {
    label: 'Low',
    bg: 'bg-stone-50',
    text: 'text-stone-700',
    border: 'border-stone-200',
    badge: 'bg-stone-100 text-stone-700 border-stone-200',
    dot: 'bg-stone-400'
  },
  INFO: {
    label: 'Informational',
    bg: 'bg-stone-50',
    text: 'text-stone-600',
    border: 'border-stone-200',
    badge: 'bg-stone-100 text-stone-600 border-stone-200',
    dot: 'bg-stone-400'
  }
};

export const UTILITY_SERVICE_LABELS = {
  ELECTRICITY: 'Electricity / Power',
  WATER: 'Water & Sewerage',
  ROAD_INFRASTRUCTURE: 'Roads & Bridges',
  WASTE_SANITATION: 'Waste & Sanitation',
  INTERNET_TELECOM: 'Internet / Telecom',
  OTHER: 'Public Infrastructure'
};

export const DOWNTIME_STATUS_CONFIG = {
  PLANNED: {
    label: 'Planned Outage',
    badge: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  ONGOING: {
    label: 'Active Disruption',
    badge: 'bg-amber-100 text-amber-800 border-amber-200'
  },
  RESTORED: {
    label: 'Service Restored',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-200'
  },
  CANCELLED: {
    label: 'Cancelled',
    badge: 'bg-stone-100 text-stone-600 border-stone-200'
  }
};
