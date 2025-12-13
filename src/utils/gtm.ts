/**
 * Google Tag Manager utilities
 * All analytics events should go through GTM, not direct GA4 calls
 * Container ID: GTM-TV3LK7CJ
 */

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
  }
}

// Initialize dataLayer if not exists
if (typeof window !== 'undefined') {
  window.dataLayer = window.dataLayer || [];
}

// Track page views to prevent duplicates on rapid navigation
let lastPagePath: string | null = null;

/**
 * Push event to GTM data layer
 */
export const pushEvent = (eventName: string, eventData?: Record<string, unknown>) => {
  if (typeof window === 'undefined') return;
  
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: eventName,
    timestamp: new Date().toISOString(),
    ...eventData,
  });
  
  // Debug log in development
  if (import.meta.env.DEV) {
    console.log(`[GTM] ${eventName}`, eventData);
  }
};

/**
 * Get current page path
 */
const getPagePath = () => {
  if (typeof window === 'undefined') return '';
  return window.location.pathname;
};

// Blog-specific events with enhanced payloads
export const gtmEvents = {
  /**
   * Fire page_view - prevents duplicate fires on same path
   */
  pageView: (pageData?: { page_path?: string; page_title?: string }) => {
    const pagePath = pageData?.page_path || getPagePath();
    
    // Prevent duplicate page_view on same path (rapid navigation)
    if (pagePath === lastPagePath) {
      return;
    }
    lastPagePath = pagePath;
    
    pushEvent('page_view', {
      page_path: pagePath,
      page_title: pageData?.page_title || document.title,
      page_location: window.location.href,
    });
  },
  
  /**
   * Reset page tracking (call on unmount if needed)
   */
  resetPageTracking: () => {
    lastPagePath = null;
  },
  
  scroll25: (postId: string, postTitle: string) => {
    pushEvent('scroll_25', { 
      page_path: getPagePath(),
      scroll_depth: 25,
      post_id: postId, 
      post_title: postTitle 
    });
  },
  
  scroll40: (postId: string, postTitle: string) => {
    pushEvent('scroll_40', { 
      page_path: getPagePath(),
      scroll_depth: 40,
      post_id: postId, 
      post_title: postTitle 
    });
  },
  
  scroll75: (postId: string, postTitle: string) => {
    pushEvent('scroll_75', { 
      page_path: getPagePath(),
      scroll_depth: 75,
      post_id: postId, 
      post_title: postTitle 
    });
  },
  
  scroll100: (postId: string, postTitle: string) => {
    pushEvent('scroll_100', { 
      page_path: getPagePath(),
      scroll_depth: 100,
      post_id: postId, 
      post_title: postTitle 
    });
  },
  
  subscriptionGateShown: (postId: string, postTitle: string) => {
    pushEvent('subscription_gate_shown', { 
      page_path: getPagePath(),
      gate_threshold: 40,
      post_id: postId, 
      post_title: postTitle,
      source: 'blog_gate',
    });
  },
  
  subscriptionCompleted: (postId: string, postTitle: string, source: string) => {
    pushEvent('subscription_completed', { 
      page_path: getPagePath(),
      gate_threshold: 40,
      post_id: postId, 
      post_title: postTitle, 
      source 
    });
  },
  
  readMoreClicked: (postId: string, postTitle: string, targetPostId: string) => {
    pushEvent('read_more_clicked', { 
      page_path: getPagePath(),
      post_id: postId, 
      post_title: postTitle, 
      target_post_id: targetPostId 
    });
  },
  
  viewMoreClicked: (currentPage: number) => {
    pushEvent('view_more_clicked', { 
      page_path: getPagePath(),
      list_context: 'blog_listing',
      current_page: currentPage 
    });
  },
};

/**
 * Create scroll depth tracker with duplicate prevention via Set
 * Each milestone (25, 40, 75, 100) fires exactly once per page load
 */
export const createScrollTracker = (
  postId: string, 
  postTitle: string,
  onMilestone?: (milestone: number) => void
) => {
  // Use Set to track fired milestones - prevents double-firing
  const firedMilestones = new Set<number>();
  
  return () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    
    const checkMilestone = (threshold: number, eventFn: () => void) => {
      if (scrollPercent >= threshold && !firedMilestones.has(threshold)) {
        firedMilestones.add(threshold);
        eventFn();
        onMilestone?.(threshold);
      }
    };
    
    checkMilestone(25, () => gtmEvents.scroll25(postId, postTitle));
    checkMilestone(40, () => gtmEvents.scroll40(postId, postTitle));
    checkMilestone(75, () => gtmEvents.scroll75(postId, postTitle));
    checkMilestone(100, () => gtmEvents.scroll100(postId, postTitle));
  };
};

/**
 * Hook helper for SPA route change tracking
 * Call this on route changes to fire page_view
 */
export const trackRouteChange = (path: string, title?: string) => {
  // Reset to allow new page view
  gtmEvents.resetPageTracking();
  gtmEvents.pageView({ page_path: path, page_title: title });
};
