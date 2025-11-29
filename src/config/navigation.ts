/**
 * Master Navigation Configuration
 * 
 * This is the source of truth for all navigation items across Seeksy.
 * Each item has a roles array that controls which user types can see it.
 * 
 * To add new modules or update navigation, edit this file.
 */

export type UserRole = 'creator' | 'subscriber' | 'advertiser' | 'influencer' | 'agency' | 'admin' | 'super_admin';

export interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  roles: UserRole[];
}

export interface NavigationGroup {
  group: string;
  description?: string;
  items: NavigationItem[];
}

export const NAVIGATION_CONFIG: {
  roles: UserRole[];
  navigation: NavigationGroup[];
} = {
  "roles": [
    "creator",
    "subscriber",
    "advertiser",
    "influencer",
    "agency",
    "admin"
  ],
  "navigation": [
    {
      "group": "Main",
      "items": [
        {
          "id": "dashboard",
          "label": "Dashboard",
          "icon": "home",
          "path": "/dashboard",
          "roles": ["creator", "influencer", "agency", "advertiser", "admin"]
        },
        {
          "id": "my_page",
          "label": "My Page",
          "icon": "user",
          "path": "/my-page",
          "roles": ["creator", "influencer", "agency", "subscriber", "admin"]
        },
        {
          "id": "profile_settings",
          "label": "Profile Settings",
          "icon": "settings",
          "path": "/settings",
          "roles": ["creator", "subscriber", "influencer", "agency", "advertiser", "admin"]
        }
      ]
    },

    {
      "group": "Seekies",
      "description": "App Marketplace",
      "items": [
        {
          "id": "seekies_marketplace",
          "label": "Seekies",
          "icon": "apps",
          "path": "/seekies",
          "roles": ["creator", "influencer", "agency", "advertiser", "admin"]
        }
      ]
    },

    {
      "group": "Engagement",
      "items": [
        {
          "id": "contacts",
          "label": "Contacts",
          "icon": "contacts",
          "path": "/engagement/contacts",
          "roles": ["creator", "influencer", "agency", "admin"]
        },
        {
          "id": "communication_history",
          "label": "Communication History",
          "icon": "history",
          "path": "/engagement/communication-history",
          "roles": ["creator", "influencer", "agency", "admin"]
        },
        {
          "id": "forms",
          "label": "Forms",
          "icon": "form",
          "path": "/engagement/forms",
          "roles": ["creator", "influencer", "agency", "admin"]
        },
        {
          "id": "marketing",
          "label": "Marketing",
          "icon": "megaphone",
          "path": "/engagement/marketing",
          "roles": ["creator", "advertiser", "agency", "admin"]
        },
        {
          "id": "sms",
          "label": "SMS",
          "icon": "sms",
          "path": "/engagement/sms",
          "roles": ["creator", "agency", "admin"]
        },
        {
          "id": "lead_pixel",
          "label": "Lead Pixel",
          "icon": "target",
          "path": "/engagement/lead-pixel",
          "roles": ["creator", "advertiser", "agency", "admin"]
        }
      ]
    },

    {
      "group": "Media",
      "items": [
        {
          "id": "master_studio",
          "label": "Master Studio",
          "icon": "studio",
          "path": "/media/studio",
          "roles": ["creator", "influencer", "agency", "admin"]
        },
        {
          "id": "media_library",
          "label": "Media Library",
          "icon": "library",
          "path": "/media/library",
          "roles": ["creator", "influencer", "agency", "admin"]
        },
        {
          "id": "create_clips",
          "label": "Create Clips",
          "icon": "scissors",
          "path": "/media/create-clips",
          "roles": ["creator", "influencer", "agency", "admin"]
        },
        {
          "id": "voice_identity",
          "label": "My Voice Identity",
          "icon": "mic",
          "path": "/media/voice-identity",
          "roles": ["creator", "influencer", "agency", "admin"]
        },
        {
          "id": "transcripts",
          "label": "Transcripts",
          "icon": "document",
          "path": "/media/transcripts",
          "roles": ["creator", "influencer", "agency", "admin"]
        },
        {
          "id": "podcasts",
          "label": "Podcasts",
          "icon": "podcast",
          "path": "/media/podcasts",
          "roles": ["creator", "influencer", "agency", "admin"]
        }
      ]
    },

    {
      "group": "Monetization",
      "items": [
        {
          "id": "ad_library",
          "label": "Ad Library",
          "icon": "folder",
          "path": "/monetization/ad-library",
          "roles": ["advertiser", "creator", "agency", "admin"]
        },
        {
          "id": "create_ad",
          "label": "Create Ad",
          "icon": "plus",
          "path": "/monetization/create-ad",
          "roles": ["advertiser", "creator", "agency", "admin"]
        },
        {
          "id": "revenue",
          "label": "Revenue",
          "icon": "dollar",
          "path": "/monetization/revenue",
          "roles": ["creator", "influencer", "agency", "advertiser", "admin"]
        }
      ]
    },

    {
      "group": "Blog",
      "items": [
        {
          "id": "blog_library",
          "label": "Blog Library",
          "icon": "book",
          "path": "/blog",
          "roles": ["creator", "influencer", "agency", "admin"]
        },
        {
          "id": "add_post",
          "label": "Add Post",
          "icon": "add",
          "path": "/blog/new",
          "roles": ["creator", "influencer", "agency", "admin"]
        }
      ]
    },

    {
      "group": "Account Settings",
      "items": [
        {
          "id": "team",
          "label": "Team",
          "icon": "group",
          "path": "/settings/team",
          "roles": ["creator", "agency", "admin"]
        },
        {
          "id": "seekies_settings",
          "label": "Seekies",
          "icon": "puzzle",
          "path": "/settings/seekies",
          "roles": ["creator", "agency", "admin"]
        },
        {
          "id": "system_status",
          "label": "System Status",
          "icon": "status",
          "path": "/settings/system-status",
          "roles": ["admin"]
        },
        {
          "id": "help_center",
          "label": "Help Center",
          "icon": "help",
          "path": "/settings/help",
          "roles": ["creator", "subscriber", "influencer", "agency", "advertiser", "admin"]
        },
        {
          "id": "architecture",
          "label": "Architecture",
          "icon": "layers",
          "path": "/settings/architecture",
          "roles": ["admin"]
        },
        {
          "id": "tech_stack",
          "label": "Tech Stack",
          "icon": "code",
          "path": "/settings/tech-stack",
          "roles": ["admin"]
        }
      ]
    },

    {
      "group": "Footer",
      "items": [
        {
          "id": "ask_spark",
          "label": "Ask Spark",
          "icon": "sparkles",
          "path": "/ask-spark",
          "roles": ["creator", "subscriber", "influencer", "agency", "advertiser", "admin"]
        }
      ]
    }
  ]
};

/**
 * Filter navigation items by user roles
 */
export function filterNavigationByRoles(
  navigation: NavigationGroup[],
  userRoles: UserRole[]
): NavigationGroup[] {
  if (!userRoles || userRoles.length === 0) {
    return [];
  }

  return navigation
    .map(group => ({
      ...group,
      items: group.items.filter(item => 
        item.roles.some(role => userRoles.includes(role))
      )
    }))
    .filter(group => group.items.length > 0);
}
