/**
 * Google Tag Manager utilities
 * All analytics events should go through GTM, not direct GA4 calls
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

/**
 * Push event to GTM data layer
 */
export const pushEvent = (eventName: string, eventData?: Record<string, unknown>) => {
  if (typeof window === 'undefined') return;
  
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: eventName,
    ...eventData,
  });
};

// Blog-specific events
export const gtmEvents = {
  pageView: (pageData?: { page_path?: string; page_title?: string }) => {
    pushEvent('page_view', pageData);
  },
  
  scroll25: (postId: string, postTitle: string) => {
    pushEvent('scroll_25', { post_id: postId, post_title: postTitle });
  },
  
  scroll40: (postId: string, postTitle: string) => {
    pushEvent('scroll_40', { post_id: postId, post_title: postTitle });
  },
  
  scroll75: (postId: string, postTitle: string) => {
    pushEvent('scroll_75', { post_id: postId, post_title: postTitle });
  },
  
  scroll100: (postId: string, postTitle: string) => {
    pushEvent('scroll_100', { post_id: postId, post_title: postTitle });
  },
  
  subscriptionGateShown: (postId: string, postTitle: string) => {
    pushEvent('subscription_gate_shown', { post_id: postId, post_title: postTitle });
  },
  
  subscriptionCompleted: (postId: string, postTitle: string, source: string) => {
    pushEvent('subscription_completed', { post_id: postId, post_title: postTitle, source });
  },
  
  readMoreClicked: (postId: string, postTitle: string, targetPostId: string) => {
    pushEvent('read_more_clicked', { post_id: postId, post_title: postTitle, target_post_id: targetPostId });
  },
  
  viewMoreClicked: (currentPage: number) => {
    pushEvent('view_more_clicked', { current_page: currentPage });
  },
};

/**
 * Hook for scroll depth tracking
 */
export const createScrollTracker = (
  postId: string, 
  postTitle: string,
  onMilestone: (milestone: number) => void
) => {
  const milestones = new Set<number>();
  
  return () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    
    if (scrollPercent >= 25 && !milestones.has(25)) {
      milestones.add(25);
      gtmEvents.scroll25(postId, postTitle);
      onMilestone(25);
    }
    if (scrollPercent >= 40 && !milestones.has(40)) {
      milestones.add(40);
      gtmEvents.scroll40(postId, postTitle);
      onMilestone(40);
    }
    if (scrollPercent >= 75 && !milestones.has(75)) {
      milestones.add(75);
      gtmEvents.scroll75(postId, postTitle);
      onMilestone(75);
    }
    if (scrollPercent >= 100 && !milestones.has(100)) {
      milestones.add(100);
      gtmEvents.scroll100(postId, postTitle);
      onMilestone(100);
    }
  };
};
