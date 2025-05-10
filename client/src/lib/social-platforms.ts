import { 
  FaTwitter, 
  FaInstagram, 
  FaFacebook, 
  FaTiktok, 
  FaYoutube, 
  FaSnapchat
} from "react-icons/fa";

export interface SocialPlatform {
  id: string;
  name: string;
  icon: React.ComponentType;
  color: string;
  baseUrl: string;
  needsAuthentication: boolean;
  description: string;
}

export const SOCIAL_PLATFORMS: SocialPlatform[] = [
  {
    id: "twitter",
    name: "Twitter/X",
    icon: FaTwitter,
    color: "#1DA1F2",
    baseUrl: "https://twitter.com/",
    needsAuthentication: true,
    description: "Connect your Twitter account to share achievements and stats"
  },
  {
    id: "instagram",
    name: "Instagram",
    icon: FaInstagram,
    color: "#E1306C",
    baseUrl: "https://instagram.com/",
    needsAuthentication: true,
    description: "Share your football journey and connect with coaches"
  },
  {
    id: "facebook",
    name: "Facebook",
    icon: FaFacebook,
    color: "#4267B2",
    baseUrl: "https://facebook.com/",
    needsAuthentication: true,
    description: "Share updates with family and friends"
  },
  {
    id: "tiktok",
    name: "TikTok",
    icon: FaTiktok,
    color: "#000000",
    baseUrl: "https://tiktok.com/@",
    needsAuthentication: true,
    description: "Share highlight clips and training videos"
  },
  {
    id: "youtube",
    name: "YouTube",
    icon: FaYoutube,
    color: "#FF0000",
    baseUrl: "https://youtube.com/c/",
    needsAuthentication: true,
    description: "Share your game footage and highlight reels"
  },
  {
    id: "snapchat",
    name: "Snapchat",
    icon: FaSnapchat,
    color: "#FFFC00",
    baseUrl: "https://snapchat.com/add/",
    needsAuthentication: false,
    description: "Connect with teammates and friends"
  }
];

// Helper function to get platform by ID
export function getPlatformById(id: string): SocialPlatform | undefined {
  return SOCIAL_PLATFORMS.find(platform => platform.id === id);
}

// Helper function to format social media username 
export function formatSocialMediaUrl(platform: SocialPlatform, username: string): string {
  if (!username) return "";
  
  // Remove @ symbol if present
  const formattedUsername = username.startsWith('@') ? username.substring(1) : username;
  
  // Return the full URL
  return `${platform.baseUrl}${formattedUsername}`;
}