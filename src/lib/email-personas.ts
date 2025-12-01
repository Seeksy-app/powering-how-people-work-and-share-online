import { Bot, Calendar, Mic, Video, Users, Mail, Shield } from "lucide-react";

export const EMAIL_PERSONAS = {
  Lex: {
    name: "Lex",
    role: "Identity & Rights Guardian",
    icon: Shield,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
    signature: "Sent with ❤️ by Lex — Your Seeksy Identity Guardian",
  },
  Mia: {
    name: "Mia",
    role: "Meetings & Events Coordinator",
    icon: Calendar,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    signature: "Sent with ❤️ by Mia — Your Seeksy Meeting Assistant",
  },
  Echo: {
    name: "Echo",
    role: "Studio Production Assistant",
    icon: Mic,
    color: "text-green-600",
    bgColor: "bg-green-100",
    signature: "Sent with ❤️ by Echo — Your Seeksy Studio Assistant",
  },
  Reel: {
    name: "Reel",
    role: "Clips & Social Manager",
    icon: Video,
    color: "text-pink-600",
    bgColor: "bg-pink-100",
    signature: "Sent with ❤️ by Reel — Your Seeksy Clips Assistant",
  },
  Castor: {
    name: "Castor",
    role: "Podcast Distribution Manager",
    icon: Mic,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
    signature: "Sent with ❤️ by Castor — Your Seeksy Podcast Assistant",
  },
  Atlas: {
    name: "Atlas",
    role: "Audience & Contacts Manager",
    icon: Users,
    color: "text-indigo-600",
    bgColor: "bg-indigo-100",
    signature: "Sent with ❤️ by Atlas — Your Seeksy Audience Assistant",
  },
  Scribe: {
    name: "Scribe",
    role: "Email & Marketing Manager",
    icon: Mail,
    color: "text-cyan-600",
    bgColor: "bg-cyan-100",
    signature: "Sent with ❤️ by Scribe — Your Seeksy Marketing Assistant",
  },
} as const;

export const EMAIL_CATEGORIES = [
  "Identity & Rights",
  "Meetings & Events",
  "Podcasting",
  "Studio & Clips",
  "Subscribers & Audience",
  "System / Admin",
  "Marketing / Campaigns",
] as const;

export type EmailPersona = keyof typeof EMAIL_PERSONAS;
export type EmailCategory = typeof EMAIL_CATEGORIES[number];

export const PREFERENCE_CHANNELS = {
  general_updates: "General Updates",
  meeting_notifications: "Meeting Notifications",
  event_updates: "Event Updates",
  podcast_notifications: "Podcast Notifications",
  studio_updates: "Studio Updates",
  subscriber_updates: "Subscriber Updates",
  marketing_emails: "Marketing Emails",
  identity_notifications: "Identity Notifications",
} as const;

export const MERGE_TAGS = [
  { tag: "{{creator_name}}", description: "Creator's full name" },
  { tag: "{{recipient_name}}", description: "Recipient's full name" },
  { tag: "{{recipient_email}}", description: "Recipient's email address" },
  { tag: "{{meeting_time}}", description: "Meeting scheduled time" },
  { tag: "{{event_name}}", description: "Event name" },
  { tag: "{{podcast_title}}", description: "Podcast show title" },
  { tag: "{{episode_title}}", description: "Episode title" },
  { tag: "{{cta_url}}", description: "Call-to-action URL" },
  { tag: "{{unsubscribe_url}}", description: "Unsubscribe URL" },
  { tag: "{{persona_signature}}", description: "Persona signature line" },
  { tag: "{{base_url}}", description: "Seeksy platform URL" },
] as const;
