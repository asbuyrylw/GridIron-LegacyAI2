/**
 * College Database for the College Matcher Tool
 * Contains comprehensive information about colleges for better matching.
 */

export interface College {
  id: number;
  name: string;
  division: 'D1' | 'D2' | 'D3' | 'NAIA' | 'JUCO';
  conference?: string;
  region: 'Northeast' | 'Southeast' | 'South' | 'Midwest' | 'West' | 'Northwest' | 'Southwest';
  state: string;
  city: string;
  isPublic: boolean;
  enrollment: number;
  admissionRate?: number;
  averageGPA?: number;
  athleticRanking?: number; // 1-100, higher is better
  programs: string[];
  tuition: {
    inState: number;
    outOfState: number;
  };
  athleticScholarships: boolean;
  sportOfferings: string[];
  athleticFacilities?: string[];
  academicSupport?: string[];
  recruitingProfile?: {
    activelyRecruiting: string[]; // List of positions they're actively recruiting
    offensiveStyle?: string;
    defensiveStyle?: string;
    recentSuccess?: string;
  };
  website?: string;
  imageUrl?: string;
  notes?: string;
}

export const colleges: College[] = [
  {
    id: 1,
    name: "Alabama University",
    division: "D1",
    conference: "SEC",
    region: "South",
    state: "Alabama",
    city: "Tuscaloosa",
    isPublic: true,
    enrollment: 38100,
    admissionRate: 0.83,
    averageGPA: 3.71,
    athleticRanking: 95,
    programs: ["Business", "Engineering", "Communications", "Exercise Science", "Sports Management"],
    tuition: {
      inState: 10780,
      outOfState: 30250
    },
    athleticScholarships: true,
    sportOfferings: ["Football", "Basketball", "Baseball", "Track & Field"],
    athleticFacilities: ["State-of-the-art weight room", "Indoor practice facility", "100,000+ seat stadium"],
    academicSupport: ["Dedicated athlete tutoring", "Academic success center"],
    recruitingProfile: {
      activelyRecruiting: ["Quarterback (QB)", "Offensive Line (OL)", "Defensive Back (DB)"],
      offensiveStyle: "Pro-style with spread elements",
      defensiveStyle: "3-4 base defense",
      recentSuccess: "National championship contender"
    },
    website: "https://www.alabama.edu/",
    imageUrl: "https://cdn.britannica.com/24/65324-050-34423E2C/view-Denny-Chimes-side-Gorgas-Library-University.jpg",
    notes: "Elite football program with extensive resources and national visibility"
  },
  {
    id: 2,
    name: "Ohio State University",
    division: "D1",
    conference: "Big Ten",
    region: "Midwest",
    state: "Ohio",
    city: "Columbus",
    isPublic: true,
    enrollment: 61170,
    admissionRate: 0.68,
    averageGPA: 3.83,
    athleticRanking: 94,
    programs: ["Psychology", "Business", "Computer Science", "Engineering", "Communications"],
    tuition: {
      inState: 11518,
      outOfState: 33502
    },
    athleticScholarships: true,
    sportOfferings: ["Football", "Basketball", "Wrestling", "Baseball"],
    athleticFacilities: ["Elite training complex", "Indoor facility", "100,000+ seat stadium"],
    academicSupport: ["Student-Athlete Support Services Office", "Extensive tutoring program"],
    recruitingProfile: {
      activelyRecruiting: ["Quarterback (QB)", "Wide Receiver (WR)", "Defensive End (DE)"],
      offensiveStyle: "Spread offense with power elements",
      defensiveStyle: "4-3 base with multiple fronts",
      recentSuccess: "Consistent playoff contender"
    },
    website: "https://www.osu.edu/",
    imageUrl: "https://news.osu.edu/export/sites/news/.galleries/images/2019/fall-campus.jpg_1641333099.jpg"
  },
  {
    id: 3,
    name: "Michigan State University",
    division: "D1",
    conference: "Big Ten",
    region: "Midwest",
    state: "Michigan",
    city: "East Lansing",
    isPublic: true,
    enrollment: 49300,
    admissionRate: 0.76,
    averageGPA: 3.75,
    athleticRanking: 87,
    programs: ["Agriculture", "Business", "Engineering", "Communications", "Exercise Science"],
    tuition: {
      inState: 14524,
      outOfState: 39766
    },
    athleticScholarships: true,
    sportOfferings: ["Football", "Basketball", "Hockey", "Baseball"],
    athleticFacilities: ["Modern training facility", "Indoor practice field"],
    recruitingProfile: {
      activelyRecruiting: ["Running Back (RB)", "Linebacker (LB)", "Offensive Line (OL)"],
      offensiveStyle: "Pro-style with power running",
      defensiveStyle: "4-3 base defense"
    },
    website: "https://msu.edu/",
    imageUrl: "https://admissions.msu.edu/_assets/images/campus-buildings/beaumont-tower.jpg"
  },
  {
    id: 4,
    name: "Florida State University",
    division: "D1",
    conference: "ACC",
    region: "Southeast",
    state: "Florida",
    city: "Tallahassee",
    isPublic: true,
    enrollment: 43960,
    admissionRate: 0.32,
    averageGPA: 4.1,
    athleticRanking: 88,
    programs: ["Business", "Criminal Justice", "Communications", "Computer Science", "Psychology"],
    tuition: {
      inState: 6517,
      outOfState: 21683
    },
    athleticScholarships: true,
    sportOfferings: ["Football", "Basketball", "Baseball", "Swimming"],
    athleticFacilities: ["Indoor practice facility", "Renovated stadium"],
    recruitingProfile: {
      activelyRecruiting: ["Quarterback (QB)", "Defensive Back (DB)", "Wide Receiver (WR)"],
      offensiveStyle: "Spread offense",
      defensiveStyle: "4-2-5 defense"
    },
    website: "https://www.fsu.edu/",
    imageUrl: "https://www.tallahassee.com/gcdn/presto/2021/08/24/PTAL/41f6b43f-ea98-470b-b216-7c1b602d4dad-FSUcampus.jpg"
  },
  {
    id: 5,
    name: "Stanford University",
    division: "D1",
    conference: "Pac-12",
    region: "West",
    state: "California",
    city: "Stanford",
    isPublic: false,
    enrollment: 17381,
    admissionRate: 0.04,
    averageGPA: 3.96,
    athleticRanking: 89,
    programs: ["Computer Science", "Engineering", "Business", "Medicine", "Political Science"],
    tuition: {
      inState: 56169,
      outOfState: 56169
    },
    athleticScholarships: true,
    sportOfferings: ["Football", "Swimming", "Water Polo", "Basketball"],
    academicSupport: ["Comprehensive academic support", "Career development programs"],
    recruitingProfile: {
      activelyRecruiting: ["Tight End (TE)", "Linebacker (LB)", "Offensive Line (OL)"],
      offensiveStyle: "Pro-style offense",
      defensiveStyle: "3-4 defense"
    },
    website: "https://www.stanford.edu/",
    imageUrl: "https://wp.stanforddaily.com/wp-content/uploads/2020/01/DJI_0230.jpg",
    notes: "Exceptional academic standards with strong athletic tradition"
  },
  {
    id: 6,
    name: "Grand Valley State",
    division: "D2",
    conference: "GLIAC",
    region: "Midwest",
    state: "Michigan",
    city: "Allendale",
    isPublic: true,
    enrollment: 24033,
    admissionRate: 0.83,
    averageGPA: 3.6,
    athleticRanking: 75,
    programs: ["Business", "Health Sciences", "Education", "Engineering", "Criminal Justice"],
    tuition: {
      inState: 13368,
      outOfState: 19323
    },
    athleticScholarships: true,
    sportOfferings: ["Football", "Basketball", "Soccer", "Track & Field"],
    recruitingProfile: {
      activelyRecruiting: ["Running Back (RB)", "Defensive Line (DL)", "Defensive Back (DB)"],
      offensiveStyle: "Multiple offensive schemes",
      defensiveStyle: "4-3 defense",
      recentSuccess: "D2 powerhouse program"
    },
    website: "https://www.gvsu.edu/",
    imageUrl: "https://www.gvsu.edu/cms4/asset/DD30780B-A045-6D02-661A0AD290D316B3/gvsu-allendale-campus.jpg"
  },
  {
    id: 7,
    name: "Slippery Rock University",
    division: "D2",
    conference: "PSAC",
    region: "Northeast",
    state: "Pennsylvania",
    city: "Slippery Rock",
    isPublic: true,
    enrollment: 8500,
    admissionRate: 0.7,
    averageGPA: 3.4,
    athleticRanking: 68,
    programs: ["Physical Therapy", "Education", "Exercise Science", "Business", "Communications"],
    tuition: {
      inState: 10154,
      outOfState: 14317
    },
    athleticScholarships: true,
    sportOfferings: ["Football", "Basketball", "Soccer", "Baseball"],
    recruitingProfile: {
      activelyRecruiting: ["Quarterback (QB)", "Wide Receiver (WR)", "Linebacker (LB)"],
      offensiveStyle: "Spread offense",
      defensiveStyle: "Multiple fronts"
    },
    website: "https://www.sru.edu/",
    imageUrl: "https://www.sru.edu/images/news/2021/september/old-main-091621-web.jpg"
  },
  {
    id: 8,
    name: "University of Mount Union",
    division: "D3",
    conference: "OAC",
    region: "Midwest",
    state: "Ohio",
    city: "Alliance",
    isPublic: false,
    enrollment: 2300,
    admissionRate: 0.75,
    averageGPA: 3.3,
    athleticRanking: 60,
    programs: ["Engineering", "Business", "Health Sciences", "Sport Management", "Education"],
    tuition: {
      inState: 33480,
      outOfState: 33480
    },
    athleticScholarships: false,
    sportOfferings: ["Football", "Basketball", "Swimming", "Baseball"],
    recruitingProfile: {
      activelyRecruiting: ["Defensive Back (DB)", "Wide Receiver (WR)", "Offensive Line (OL)"],
      offensiveStyle: "Spread offense",
      defensiveStyle: "Multiple defenses",
      recentSuccess: "D3 powerhouse, multiple national championships"
    },
    website: "https://www.mountunion.edu/",
    imageUrl: "https://www.mountunion.edu/sites/default/files/styles/blog_header/public/media/campus-life/chapman-hall-2021-web.jpg"
  },
  {
    id: 9,
    name: "Wisconsin-Whitewater",
    division: "D3",
    conference: "WIAC",
    region: "Midwest",
    state: "Wisconsin",
    city: "Whitewater",
    isPublic: true,
    enrollment: 12430,
    admissionRate: 0.8,
    averageGPA: 3.2,
    athleticRanking: 58,
    programs: ["Business", "Education", "Communications", "Arts", "Sciences"],
    tuition: {
      inState: 7692,
      outOfState: 16265
    },
    athleticScholarships: false,
    sportOfferings: ["Football", "Basketball", "Baseball", "Track & Field"],
    recruitingProfile: {
      activelyRecruiting: ["Running Back (RB)", "Linebacker (LB)", "Offensive Line (OL)"],
      offensiveStyle: "Multiple offensive schemes",
      defensiveStyle: "4-3 defense",
      recentSuccess: "D3 national championship contender"
    },
    website: "https://www.uww.edu/",
    imageUrl: "https://www.uww.edu/images/default-source/mar-comm-photos/campus-photos/aerial-4.jpg"
  },
  {
    id: 10,
    name: "Morningside University",
    division: "NAIA",
    conference: "GPAC",
    region: "Midwest",
    state: "Iowa",
    city: "Sioux City",
    isPublic: false,
    enrollment: 2800,
    admissionRate: 0.65,
    averageGPA: 3.2,
    athleticRanking: 50,
    programs: ["Business", "Nursing", "Education", "Agriculture", "Communications"],
    tuition: {
      inState: 33900,
      outOfState: 33900
    },
    athleticScholarships: true,
    sportOfferings: ["Football", "Basketball", "Baseball", "Swimming"],
    recruitingProfile: {
      activelyRecruiting: ["Quarterback (QB)", "Defensive Back (DB)", "Wide Receiver (WR)"],
      offensiveStyle: "High-powered spread offense",
      defensiveStyle: "4-2-5 defense",
      recentSuccess: "NAIA national champions"
    },
    website: "https://www.morningside.edu/",
    imageUrl: "https://www.morningside.edu/assets/uploads/general/Campus-Beauty-Shot-2021.jpg"
  },
  {
    id: 11,
    name: "Iowa Western CC",
    division: "JUCO",
    conference: "ICCAC",
    region: "Midwest",
    state: "Iowa",
    city: "Council Bluffs",
    isPublic: true,
    enrollment: 5900,
    admissionRate: 1.0,
    averageGPA: 2.5,
    athleticRanking: 45,
    programs: ["Business", "General Studies", "Computer Science", "Liberal Arts", "Criminal Justice"],
    tuition: {
      inState: 6976,
      outOfState: 8736
    },
    athleticScholarships: true,
    sportOfferings: ["Football", "Basketball", "Baseball", "Soccer"],
    recruitingProfile: {
      activelyRecruiting: ["All positions - transfer development program"],
      offensiveStyle: "Multiple offenses",
      defensiveStyle: "Multiple defenses",
      recentSuccess: "Top JUCO program, strong transfer success rate to D1"
    },
    website: "https://www.iwcc.edu/",
    imageUrl: "https://bloximages.chicago2.vip.townnews.com/nonpareilonline.com/content/tncms/assets/v3/editorial/1/ab/1ab79fe2-1493-11ea-968c-4b03c41a0c7d/5de56eb7de8dd.image.jpg",
    notes: "Excellent pathway to D1 programs with strong placement record"
  },
  {
    id: 12,
    name: "Clemson University",
    division: "D1",
    conference: "ACC",
    region: "Southeast",
    state: "South Carolina",
    city: "Clemson",
    isPublic: true,
    enrollment: 25822,
    admissionRate: 0.51,
    averageGPA: 4.18,
    athleticRanking: 93,
    programs: ["Engineering", "Business", "Communications", "Sciences", "Agriculture"],
    tuition: {
      inState: 15558,
      outOfState: 38550
    },
    athleticScholarships: true,
    sportOfferings: ["Football", "Basketball", "Baseball", "Soccer"],
    athleticFacilities: ["State-of-the-art football complex", "Indoor practice facility"],
    academicSupport: ["Nieri Family Student-Athlete Enrichment Center"],
    recruitingProfile: {
      activelyRecruiting: ["Quarterback (QB)", "Defensive Line (DL)", "Wide Receiver (WR)"],
      offensiveStyle: "Spread offense with power elements",
      defensiveStyle: "4-3 defense with multiple fronts",
      recentSuccess: "Multiple national championships"
    },
    website: "https://www.clemson.edu/",
    imageUrl: "https://www.clemson.edu/brand/resources/logos-images/photos/tillman-beauty.jpg"
  },
  {
    id: 13,
    name: "Northwest Missouri State",
    division: "D2",
    conference: "MIAA",
    region: "Midwest",
    state: "Missouri",
    city: "Maryville",
    isPublic: true,
    enrollment: 7870,
    admissionRate: 0.73,
    averageGPA: 3.37,
    athleticRanking: 74,
    programs: ["Business", "Education", "Agriculture", "Computer Science", "Psychology"],
    tuition: {
      inState: 11338,
      outOfState: 18887
    },
    athleticScholarships: true,
    sportOfferings: ["Football", "Basketball", "Baseball", "Track & Field"],
    recruitingProfile: {
      activelyRecruiting: ["Defensive Back (DB)", "Offensive Line (OL)", "Linebacker (LB)"],
      offensiveStyle: "Pro-style offense",
      defensiveStyle: "4-3 defense",
      recentSuccess: "Multiple D2 national championships"
    },
    website: "https://www.nwmissouri.edu/",
    imageUrl: "https://www.nwmissouri.edu/media/news/2022/01/images/220119InvestigationFiles-5.jpg"
  },
  {
    id: 14,
    name: "North Dakota State",
    division: "D1",
    conference: "MVFC (FCS)",
    region: "Midwest",
    state: "North Dakota",
    city: "Fargo",
    isPublic: true,
    enrollment: 13173,
    admissionRate: 0.95,
    averageGPA: 3.47,
    athleticRanking: 85,
    programs: ["Engineering", "Business", "Agriculture", "Health Sciences", "Education"],
    tuition: {
      inState: 9736,
      outOfState: 13393
    },
    athleticScholarships: true,
    sportOfferings: ["Football", "Basketball", "Wrestling", "Baseball"],
    recruitingProfile: {
      activelyRecruiting: ["Offensive Line (OL)", "Linebacker (LB)", "Running Back (RB)"],
      offensiveStyle: "Power running with play-action",
      defensiveStyle: "4-3 defense",
      recentSuccess: "Multiple FCS national championships"
    },
    website: "https://www.ndsu.edu/",
    imageUrl: "https://www.ndsu.edu/fileadmin/www.ndsu.edu/compress_resize/resize/communication/images/web_photo/2560x1440_landscape/NDSU_Web_1440x810_210209_0002_51553596742_o_7c47b03b3b.jpg",
    notes: "FCS powerhouse with strong NFL development pipeline"
  },
  {
    id: 15,
    name: "Ferris State University",
    division: "D2",
    conference: "GLIAC",
    region: "Midwest",
    state: "Michigan",
    city: "Big Rapids",
    isPublic: true,
    enrollment: 14000,
    admissionRate: 0.87,
    averageGPA: 3.36,
    athleticRanking: 73,
    programs: ["Business", "Healthcare", "Engineering Technology", "Education", "Criminal Justice"],
    tuition: {
      inState: 12376,
      outOfState: 13128
    },
    athleticScholarships: true,
    sportOfferings: ["Football", "Basketball", "Hockey", "Volleyball"],
    recruitingProfile: {
      activelyRecruiting: ["Quarterback (QB)", "Defensive Line (DL)", "Wide Receiver (WR)"],
      offensiveStyle: "Up-tempo spread offense",
      defensiveStyle: "Multiple defenses",
      recentSuccess: "D2 national champions"
    },
    website: "https://www.ferris.edu/",
    imageUrl: "https://www.ferris.edu/HTMLS/future/visit/campus-tour/quad.jpg"
  }
];

// Helper function to get colleges by division
export function getCollegesByDivision(division: string): College[] {
  return colleges.filter(college => college.division === division);
}

// Helper function to get colleges by region
export function getCollegesByRegion(region: string): College[] {
  return colleges.filter(college => college.region === region);
}

// Helper function to get colleges by state
export function getCollegesByState(state: string): College[] {
  return colleges.filter(college => college.state.toLowerCase() === state.toLowerCase());
}

// Helper to find schools actively recruiting specific positions
export function getCollegesRecruitingPosition(position: string): College[] {
  return colleges.filter(
    college => college.recruitingProfile?.activelyRecruiting.some(
      pos => pos.toLowerCase().includes(position.toLowerCase())
    )
  );
}