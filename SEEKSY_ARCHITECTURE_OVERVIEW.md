# Seeksy Platform Architecture Overview

## Executive Summary

Seeksy is a unified creator platform that connects podcast recording, content certification, advertising monetization, and distribution into a single seamless workflow. This document provides a high-level overview of the system architecture, data flows, and key integrations.

---

## Core Platform Areas

### 1. Media & Recording

**Podcast Studio** - Professional multitrack recording environment
- Routes: `/podcast-studio/*`
- Features: Mic setup, live recording, AI cleanup, episode export
- Outputs: Multitrack audio files with metadata

**Media Library** - Centralized content management
- Routes: `/media-library`
- Features: Video/audio storage, organization, search

**Create Clips** - Social media content generation
- Routes: `/create-clips`
- Features: Clip extraction, text overlays, social format optimization

### 2. Podcasts & Distribution

**Podcasts Home** - Podcast management dashboard
- Route: `/podcasts`
- Features: Podcast list, analytics summary, RSS feed management

**Podcast Details** - Individual podcast management
- Route: `/podcasts/:id`
- Features: Episode list, settings, RSS feed, email verification

**Episode Creation** - Manual episode upload
- Route: `/podcasts/:id/upload`
- Features: Audio upload, metadata entry, scheduling

**Episode from Studio** - Studio-to-podcast integration
- Route: `/podcasts/:podcastId/episodes/new-from-studio`
- Features: Pre-filled episode form with studio metadata

**Episode Details** - Episode viewing and management
- Route: `/podcasts/:podcastId/episodes/:episodeId`
- Features: Episode metadata, ad reads, playback (coming soon)

**Podcast Analytics** - Performance tracking
- Route: `/podcasts/:podcastId/stats`
- Features: Episode-level metrics, revenue estimation, ad read tracking

**RSS Import** - Migrate existing podcasts
- Route: `/podcasts/import`
- Features: RSS feed import, 301 redirect support

### 3. Content Certification

**Voice Certification** - Voice fingerprint and blockchain NFT
- Route: `/voice-protection`
- Features: 4-step wizard, voice recording, ElevenLabs cloning, Polygon NFT minting

**Content Certification** - Episode authenticity verification
- Route: `/content-certification`
- Features: Content upload, AI fingerprint matching, tamper detection, blockchain certificate

**Episode Details (Creator)** - Studio recording metadata
- Route: `/episodes/:id`
- Features: View episode details, ad read events, certification status

### 4. Advertiser System

**Advertiser Dashboard** - Campaign management
- Route: `/advertiser`
- Features: Campaign list, create new campaigns

**Campaign Details** - Manage ad scripts
- Route: `/advertiser/campaigns/:id`
- Features: Ad script list, create new scripts

**Create Script** - Build ad content
- Route: `/advertiser/scripts/new`
- Features: Brand name, script text, read time estimation

### 5. Voice Monetization

**Voice Cloning** - Create voice profiles for licensing
- Route: `/voice-cloning`
- Features: 4-step wizard, instant/professional cloning, pricing settings

**Voice Credentials** - Voice licensing management
- Route: `/voice-credentials`
- Features: Listening analytics, licensing proposals, social media monitoring

---

## Key Data Entities

### Podcast
```
- id: string
- user_id: string
- title: string
- description: string
- cover_image_url: string
- is_published: boolean
- slug: string (for RSS URLs)
- verification_email: string (for Spotify compliance)
- created_at: timestamp
```

### Episode
```
- id: string
- podcast_id: string
- title: string
- description: string
- audio_url: string
- duration_seconds: number
- episode_number: number
- season_number: number
- episode_type: 'full' | 'trailer' | 'bonus'
- is_explicit: boolean
- is_published: boolean
- publish_date: timestamp
- studio_metadata: json (optional, from studio recordings)
- ad_reads: json[] (AdReadEvent array)
```

### AudioTrack
```
- trackId: string
- participantName: string
- audioBlob: Blob
- audioUrl: string
```

### RecordingSession
```
- sessionId: string
- participants: Participant[]
- startTime: Date
- endTime: Date
- isRecording: boolean
```

### AdScript
```
- id: string
- campaignId: string
- brandName: string
- title: string
- scriptText: string
- readLengthSeconds: number
- tags: string[]
```

### Campaign
```
- id: string
- advertiserId: string
- name: string
- status: 'draft' | 'active' | 'paused'
- targeting: string[]
- budget: number
```

### AdReadEvent
```
- timestamp: number (seconds into episode)
- scriptId: string
- brandName: string
- scriptTitle: string
- duration: number (estimated read duration)
```

### VoiceProfile
```
- id: string
- creator_id: string
- voice_name: string
- clone_type: 'instant' | 'professional'
- elevenlabs_voice_id: string
- price_per_use: number
- is_available: boolean
```

### BlockchainCertificate
```
- id: string
- voice_profile_id: string (or episode_id)
- creator_id: string
- voice_fingerprint_hash: string
- token_id: string
- transaction_hash: string
- nft_metadata: json
- certification_status: string
```

---

## Data Flow Architectures

### Flow 1: Studio Recording → Podcast Episode

```
1. User starts recording session
   └─ POST /api/initializeRecordingSession
   └─ Creates RecordingSession with participants

2. Recording captures multitrack audio
   └─ Each participant generates separate AudioTrack
   └─ Marks ad reads with AdReadEvent timestamps

3. User applies AI cleanup
   └─ POST /api/applyAICleanup
   └─ Processes audio tracks (basic or advanced)

4. User saves episode metadata
   └─ POST /api/saveEpisode
   └─ Stores episodeId, title, tracks, cleanupMethod, adReadEvents

5. User exports processed audio
   └─ POST /api/exportEpisode
   └─ Generates downloadUrls for processed files

6. User clicks "Send to Podcasts"
   └─ Opens sheet with user's podcast list
   └─ User selects target podcast

7. Navigation to pre-filled episode form
   └─ Route: /podcasts/:podcastId/episodes/new-from-studio
   └─ State includes: episodeId, audioUrl, title, duration, tracks, adReadEvents

8. User completes episode details and saves
   └─ POST to episodes table
   └─ Stores episode with studio_metadata and ad_reads

9. Episode appears in podcast feed
   └─ Accessible at /podcasts/:podcastId/episodes/:episodeId
   └─ RSS feed includes episode
   └─ Ad reads visible in episode details
```

### Flow 2: Advertiser → Script → Podcast Studio → Episode

```
1. Advertiser creates campaign
   └─ Route: /advertiser/campaigns/new
   └─ POST /api/createCampaign

2. Advertiser uploads ad scripts
   └─ Route: /advertiser/scripts/new
   └─ POST /api/uploadAdScript
   └─ Stores: brandName, title, scriptText, readLengthSeconds

3. Scripts become available in Studio
   └─ GET /api/listAdScriptsForAllShows
   └─ Dropdown in recording console

4. Creator marks ad reads during recording
   └─ User selects script from dropdown
   └─ Clicks "Mark Ad Read" at timestamp
   └─ Creates AdReadEvent: { timestamp, scriptId, brandName, scriptTitle, duration }

5. Ad reads flow to episode
   └─ Stored in episode.ad_reads JSON array
   └─ Visible in episode details
   └─ Included in certification metadata

6. Content certification includes ad verification
   └─ Route: /content-certification
   └─ AI scans for voice matches and ad authenticity
   └─ Blockchain certificate includes ad_reads metadata
```

### Flow 3: Voice Cloning → Licensing → Monetization

```
1. Creator records voice sample
   └─ Route: /voice-cloning (4-step wizard)
   └─ Captures voice recording (2min or 30min)

2. Voice fingerprint generation
   └─ POST to generate-voice-fingerprint edge function
   └─ Creates cryptographic hash of voice

3. ElevenLabs voice cloning
   └─ POST to create-voice-clone edge function
   └─ Generates elevenlabs_voice_id

4. Blockchain NFT minting
   └─ POST to mint-voice-nft edge function
   └─ Polygon network (gasless via Biconomy)
   └─ Stores: token_id, transaction_hash, voice_fingerprint_hash

5. Voice becomes available for licensing
   └─ Displayed in /voice-credentials
   └─ Advertisers browse voice marketplace

6. Licensing proposal workflow
   └─ Advertiser submits proposal
   └─ Creator receives notification
   └─ Accept/decline/counter-offer

7. Usage tracking and analytics
   └─ Social media monitoring detects voice usage
   └─ Listening analytics track plays
   └─ Revenue calculated based on usage terms
```

---

## Integration Points

### Supabase (Backend)
- **Database**: PostgreSQL tables for all entities
- **Storage**: episode-files, podcast-covers, audio-ads-generated buckets
- **Edge Functions**: Voice fingerprinting, blockchain minting, AI script generation
- **Authentication**: User management, RLS policies
- **Realtime**: Live updates for notifications

### ElevenLabs (Voice AI)
- Voice cloning (instant and professional)
- Voice marketplace integration
- Text-to-speech for intro/outro generation

### Polygon (Blockchain)
- NFT minting for voice profiles
- Gasless transactions via Biconomy
- Content authenticity certificates

### Google Gemini (AI)
- Script generation
- Content analysis
- Voice fingerprint matching (future)

---

## Revenue Model

### Ad-Based Revenue
```
Revenue per Episode = (Impressions / 1000) × CPM × Ad Read Multiplier

Default CPM: $25
Ad Read Multiplier: 1.0 (configurable)
Base impressions: 1,000 per episode (mock, will be real data)
```

### Voice Licensing Revenue
```
Creator sets price_per_use for voice profile
Platform takes percentage (TBD)
Payment via licensing proposals
```

### Subscription Revenue (Future)
```
Creator tiers with credit-based usage
Advertiser tiers with impression packages
Platform fees on ad spending
```

---

## Security & Compliance

### Row Level Security (RLS)
- Episodes visible only to podcast owner
- Voice profiles private to creator
- Ad scripts accessible only to campaign owner
- Blockchain certificates publicly verifiable

### Email Verification (Spotify Compliance)
- Temporary verification (48h expiry)
- Permanent verification option
- Auto-clearing of expired emails

### Content Authenticity
- Voice fingerprinting on all recordings
- Blockchain certificates for ownership proof
- Tamper detection via AI scanning
- C2PA-style provenance manifests (roadmap)

---

## Future Roadmap

### Near-Term
- Real-time impression tracking (replace mock data)
- Live audience engagement (chat, polls, Q&A)
- Distribution to YouTube, Spotify video
- Automated clip generation with text overlays

### Mid-Term
- Cross-platform social media monitoring
- Dynamic ad insertion (programmatic)
- Advanced voice marketplace with bidding
- Subscription tiers and credit system

### Long-Term
- Full C2PA manifest implementation
- Multi-language support and translation
- Enterprise team collaboration features
- API for third-party integrations

---

## Technology Stack

**Frontend**
- React 18 + TypeScript
- Vite (build tool)
- TanStack Query (data fetching)
- React Router (navigation)
- Tailwind CSS (styling)
- shadcn/ui (component library)

**Backend**
- Supabase (PostgreSQL, Storage, Edge Functions, Auth)
- Deno (edge function runtime)

**AI/ML**
- ElevenLabs (voice cloning, TTS)
- Google Gemini (text generation, analysis)

**Blockchain**
- Polygon (L2 for low-cost NFTs)
- Biconomy (gasless transactions)
- Infura (Web3 provider)

**Storage**
- Supabase Storage (audio, images, covers)
- IPFS (planned for metadata permanence)

---

## Contact & Support

For technical questions or partnership inquiries:
- Email: support@seeksy.io
- Documentation: https://docs.seeksy.io (coming soon)
