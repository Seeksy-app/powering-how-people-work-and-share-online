/**
 * My Day OS - Navigation Configuration
 * 
 * User-centered navigation aligned with daily workflows
 * instead of technical modules.
 */

export type UserRole = 'creator' | 'subscriber' | 'advertiser' | 'influencer' | 'agency' | 'admin' | 'super_admin';

export interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  roles: UserRole[];
  description?: string;
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
    "admin",
    "super_admin"
  ],
  "navigation": [
    {
      "group": "My Day OS",
      "description": "Your personalized daily workflow",
      "items": [
        {
          "id": "my_day",
          "label": "My Day",
          "icon": "sparkles",
          "path": "/my-day",
          "roles": ["creator", "influencer", "agency", "advertiser", "admin"],
          "description": "Your personalized dashboard"
        },
        {
          "id": "inbox",
          "label": "Inbox",
          "icon": "inbox",
          "path": "/inbox",
          "roles": ["creator", "influencer", "agency", "advertiser", "admin"],
          "description": "Unified communications"
        },
        {
          "id": "audience",
          "label": "Contacts & Audience",
          "icon": "users",
          "path": "/audience",
          "roles": ["creator", "influencer", "agency", "admin"],
          "description": "Manage your audience"
        },
        {
          "id": "content",
          "label": "Content & Media",
          "icon": "video",
          "path": "/content",
          "roles": ["creator", "influencer", "agency", "admin"],
          "description": "All creation tools"
        },
        {
          "id": "monetization",
          "label": "Monetization Hub",
          "icon": "dollar-sign",
          "path": "/monetization",
          "roles": ["creator", "influencer", "agency", "advertiser", "admin"],
          "description": "Revenue & deals"
        },
        {
          "id": "settings",
          "label": "Settings",
          "icon": "settings",
          "path": "/settings",
          "roles": ["creator", "subscriber", "influencer", "agency", "advertiser", "admin"],
          "description": "Account settings"
        }
      ]
    },

    {
      "group": "Admin",
      "description": "System administration",
      "items": [
        {
          "id": "admin_dashboard",
          "label": "Admin Dashboard",
          "icon": "shield",
          "path": "/admin",
          "roles": ["admin", "super_admin"]
        },
        {
          "id": "admin_users",
          "label": "Users & Roles",
          "icon": "users",
          "path": "/admin/users",
          "roles": ["admin", "super_admin"]
        },
        {
          "id": "admin_analytics",
          "label": "Analytics",
          "icon": "bar-chart",
          "path": "/admin/analytics",
          "roles": ["admin", "super_admin"]
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
