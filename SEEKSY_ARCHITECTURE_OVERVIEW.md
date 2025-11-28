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

## Monetization Engine

The Monetization Engine is the financial backbone of Seeksy, connecting podcast creation, advertising, voice certification, and creator payouts into a unified revenue system.

### Core Components

#### 1. Revenue Event Tracking
- **Episode Revenue**: Automatically calculated when episodes are published
- **Ad Read Revenue**: Tracked per ad-read event with timestamp precision
- **Voice Certification Uplift**: 25% CPM bonus for certified voices
- **Platform Fees**: 30% platform fee, 70% creator payout

#### 2. CPM Tier System
Three-tier CPM pricing model:
- **Host-Read Ads**: $30 CPM base (certified voice: $37.50)
- **Announcer Ads**: $20 CPM base
- **Dynamic Insertion**: $15 CPM base

#### 3. Ad Marketplace Revenue Flow

```
Advertiser → Campaign → Ad Script → Podcast Studio Recording → Episode Publication → Revenue Distribution
```

**Detailed Flow:**

1. **Script Creation Phase**
   - Advertiser creates campaign and uploads ad scripts
   - Scripts include: brand name, script text, estimated read duration
   - Scripts become available in Podcast Studio dropdown

2. **Recording Phase**
   - Creator selects ad script during recording
   - "Mark Ad Read" captures exact timestamp in episode
   - AdReadEvent stores: timestamp, scriptId, brandName, duration

3. **Publication Phase**
   - Episode is saved and published
   - `track-episode-revenue` edge function calculates:
     - Base impressions (1000 + bonuses)
     - CPM rate (with voice certification multiplier if applicable)
     - Ad read count multiplier (10% per ad)
     - Total revenue = (impressions / 1000) × CPM × multipliers
   - Revenue split: 70% creator, 30% platform

4. **Financial Recording**
   - Revenue event recorded in `revenue_events` table
   - Individual ad reads tracked in `ad_revenue_events` table
   - Creator payout queued in `creator_payouts` table

#### 4. Voice Certification Revenue Uplift

**Certification Impact:**
- Base CPM: $25
- Certified Voice CPM: $31.25 (25% uplift)
- Applied automatically when creator has certified voice profile

**Integration Flow:**
```
Voice Recording → Fingerprint Generation → Blockchain NFT → Certification Status → CPM Multiplier
```

When episode is published:
- System checks if creator has certified voice (via `creator_voice_profiles` table)
- If certified, applies `certifiedVoiceCpmMultiplier` (1.25x)
- Uplift displayed on:
  - Episode stats page
  - Podcast analytics dashboard
  - CFO financial reports

#### 5. Impression Calculation Model

**Base Formula:**
```javascript
impressions = baseImpressionsPerEpisode × bonuses

Bonuses:
- New Episode (< 30 days): 1.5x
- Per Ad Read: 1 + (adReadCount × 0.1)

Example:
Episode with 3 ad reads, 10 days old:
impressions = 1000 × 1.5 × 1.3 = 1,950
```

**Revenue Formula:**
```javascript
baseRevenue = (impressions / 1000) × cpm
totalRevenue = baseRevenue × adReadMultiplier

Platform Fee: totalRevenue × 0.30
Creator Payout: totalRevenue × 0.70
```

#### 6. Financial APIs for CFO Dashboard

Six API endpoints provide unified financial data:

**`/api/financials/revenue/by-episode`**
- Query: `?id=episodeId`
- Returns: revenue events, impressions, ad reads, payout amount

**`/api/financials/revenue/by-podcast`**
- Query: `?id=podcastId`
- Returns: aggregated revenue, total impressions, episode-level breakdown

**`/api/financials/ad-spend`**
- Query: `?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`
- Returns: advertiser spending, campaign performance, impression delivery

**`/api/financials/forecasts`**
- Returns: 30-day revenue projections, confidence scores

**`/api/financials/cpm-tiers`**
- Returns: active CPM tiers, base rates, certification multipliers

**`/api/financials/creator-payouts`**
- Query: `?id=creatorId`
- Returns: payout history, pending amounts, payment status

#### 7. Advertiser Billing Flow

```
Campaign Created → Budget Allocated → Scripts Approved → Ad Reads Delivered → Impressions Tracked → Billing Processed
```

**Billing Events:**
- `script_created`: Ad script uploaded to campaign
- `script_approved`: Script available for creators
- `ad_marked`: Creator marks ad read during recording
- `ad_read_complete`: Episode published with ad read

**Cost Calculation:**
```javascript
costPerAdRead = (impressionsDelivered / 1000) × advertiserCPM

Advertiser CPM Rates:
- Host-read: $30
- Announcer: $20
```

#### 8. Creator Payout Flow

**Payout Cycle:**
1. Revenue events accumulate throughout month
2. At month end, system aggregates:
   - Total revenue from all episodes
   - Platform fees deducted (30%)
   - Net payout calculated (70%)
3. Payout record created with status "pending"
4. Payment processed via configured method (PayPal, Stripe, etc.)
5. Status updated to "completed" and `processed_at` timestamp set

**Payout Record Structure:**
```javascript
{
  creator_id: UUID,
  payout_period_start: Date,
  payout_period_end: Date,
  total_revenue: Decimal,
  platform_fee: Decimal,
  payout_amount: Decimal,
  status: 'pending' | 'processing' | 'completed' | 'failed',
  payment_reference: String
}
```

### Integration Architecture

#### Connected Systems

**1. Podcast Studio ↔ Monetization Engine**
- Ad script selection during recording
- Real-time ad-read timestamp capture
- Revenue tracking on episode export

**2. Content Certification ↔ Monetization Engine**
- Voice certification status verification
- CPM uplift application for certified voices
- Blockchain certificate metadata in revenue events

**3. Advertiser Portal ↔ Monetization Engine**
- Campaign budget tracking
- Script performance analytics
- Ad delivery confirmation

**4. Podcast Analytics ↔ Monetization Engine**
- Episode-level revenue display
- Podcast-level revenue aggregation
- Impression and ad-read metrics

**5. CFO Dashboard ↔ Monetization Engine**
- Unified financial API consumption
- Revenue forecasting models
- Creator payout management
- Platform fee tracking

### Data Flow Diagram

```
┌─────────────────┐
│  Podcast Studio │
│   (Recording)   │
└────────┬────────┘
         │ Ad Read Events
         │ Episode Metadata
         ▼
┌─────────────────┐
│  Episode Saved  │◄────────── Voice Certification
│   & Published   │              (CPM Uplift)
└────────┬────────┘
         │
         │ Triggers Revenue Tracking
         ▼
┌─────────────────────────────┐
│ Monetization Engine         │
│  • Calculate Impressions    │
│  • Apply CPM Tier           │
│  • Apply Voice Multiplier   │
│  • Calculate Revenue        │
└──────┬─────────┬─────────┬──┘
       │         │         │
       │         │         │
       ▼         ▼         ▼
┌──────────┐ ┌──────────┐ ┌──────────┐
│ Revenue  │ │   Ad     │ │ Creator  │
│  Events  │ │ Revenue  │ │ Payouts  │
│  Table   │ │  Events  │ │  Table   │
└────┬─────┘ └────┬─────┘ └────┬─────┘
     │            │             │
     └────────────┴─────────────┘
                  │
                  ▼
         ┌─────────────────┐
         │  CFO Dashboard  │
         │   Financial     │
         │     APIs        │
         └─────────────────┘
```

### Financial Configuration

All monetization parameters centralized in `revenueModelConfig.ts`:

```typescript
{
  defaultCpm: 25,
  adReadMultiplier: 1.0,
  baseImpressionsPerEpisode: 1000,
  certifiedVoiceCpmMultiplier: 1.25,
  advertiserHostReadCpm: 30,
  platformRevenueShare: 0.30,
  creatorRevenueShare: 0.70,
}
```

Easily adjustable for:
- Market rate changes
- Promotional campaigns
- A/B testing revenue models
- Investor financial modeling

---

## Awards Platform Architecture

### Overview
The Awards Platform enables creators to host awards programs (e.g., Veteran Podcast Awards) with full nomination, voting, and revenue management capabilities integrated into the Monetization Engine.

### Routes

**Awards Program Management**
- `/awards` — Awards programs dashboard
- `/awards/create` — Create new awards program
- `/awards/:programId` — Program details and management
- `/awards/:programId/categories` — Manage categories
- `/awards/:programId/nominees` — Manage nominees
- `/awards/:programId/settings` — Program settings

**Public Voting & Engagement**
- `/awards/:programId/vote/:nomineeSlug` — Public voting page (shareable)
- `/awards/:programId/results` — Results page (live or admin-only)
- `/awards/:programId/register` — Event registration

### Data Entities

**AwardProgram**
```typescript
{
  id: string;
  title: string;
  description: string;
  cover_image_url: string;
  user_id: string; // program creator
  status: 'draft' | 'published' | 'voting_open' | 'voting_closed' | 'completed';
  
  // Nomination Settings
  nomination_type: 'public' | 'paid' | 'jury_only' | 'hybrid';
  allow_public_nominations: boolean;
  self_nomination_fee: number;
  
  // Voting Settings
  voting_method: 'public' | 'registered' | 'jury' | 'hybrid';
  require_voter_registration: boolean;
  max_votes_per_voter: number;
  show_live_results: boolean;
  
  // Registration Settings
  registration_fee: number;
  
  // Important Dates
  nominations_open_date: Date;
  nominations_close_date: Date;
  voting_open_date: Date;
  voting_close_date: Date;
  ceremony_date: Date;
  payout_scheduled_date: Date;
  
  // Financial
  stripe_connect_account_id: string;
}
```

**AwardCategory**
```typescript
{
  id: string;
  program_id: string;
  name: string;
  description: string;
  display_order: number;
  max_nominees: number;
  allow_media_submission: boolean;
}
```

**Nominee**
```typescript
{
  id: string;
  program_id: string;
  category_id: string;
  nominee_name: string;
  nominee_description: string;
  nominee_image_url: string;
  nominee_email: string;
  audio_url: string;
  video_url: string;
  rss_feed_url: string;
  podcast_episode_id: string; // link to episode
  total_votes: number;
  unique_voting_link: string; // shareable slug
  status: 'pending' | 'approved' | 'rejected';
  submitted_by_user_id: string;
}
```

**Vote**
```typescript
{
  id: string;
  program_id: string;
  category_id: string;
  nominee_id: string;
  voter_id: string; // if authenticated
  voter_ip_hash: string; // if anonymous
  voter_email: string;
  voter_name: string;
  vote_weight: number;
  rank_position: number; // for ranked voting
  voted_at: Date;
}
```

**AwardRevenue**
```typescript
{
  // Self-Nominations
  award_self_nominations: {
    amount_paid: number;
    status: 'pending' | 'paid' | 'refunded';
    nominee_id: string;
  };
  
  // Registrations
  award_registrations: {
    amount_paid: number;
    attendee_name: string;
    attendee_email: string;
  };
  
  // Sponsorships
  award_sponsorships: {
    amount_paid: number;
    sponsor_name: string;
    package_id: string;
  };
  
  // Payouts
  award_payouts: {
    amount: number;
    net_amount: number;
    platform_fee: number;
    status: 'pending' | 'processing' | 'completed';
    hold_until_date: Date;
  };
}
```

### Data Flows

#### 1. Awards Program Creation Flow
```
Creator → Create Program → Set Nomination/Voting/Registration Settings
  → Create Categories → Add Initial Nominees (optional)
  → Publish Program → Generate Shareable Links
```

#### 2. Nomination Flow (Public or Paid)
```
Public User → Visit Program Page → Submit Nomination
  → (If Paid) Process Payment via Stripe
  → Create Nominee Record (status: pending)
  → Admin Reviews → Approve/Reject
  → Approved Nominees → Generate Voting Links
```

#### 3. Voting Flow
```
Voter → Visit /awards/:programId/vote/:nomineeSlug
  → Check Voting Window (open/close dates)
  → (If Required) Authenticate/Register
  → Check Max Votes Per Voter
  → Submit Vote
  → Hash IP or User ID for Fraud Prevention
  → Update nominee.total_votes
  → Record in award_votes table
```

#### 4. Results & Winner Announcement Flow
```
Admin → Close Voting → Calculate Final Tallies
  → Select Winners → Announce Winners
  → (If show_live_results = true) → Public Views Live Results
  → (If false) → Admin-Only Until Ceremony
```

#### 5. Revenue Flow
```
Self-Nomination Fee → Stripe Payment → award_self_nominations
Registration Fee → Stripe Payment → award_registrations
Sponsorship Package → Stripe Payment → award_sponsorships
  ↓
All Revenue → Monetization Engine → revenue_events
  ↓
Platform Fee (10%) → Seeksy
Creator Net Amount → award_payouts (held until payout_date)
  ↓
After Ceremony → Process Payout → Stripe Connect Transfer
```

### Fraud Prevention & Voting Integrity

**IP Hashing**
- Anonymous votes: Hash IP + User Agent → `voter_ip_hash`
- Prevents simple duplicate votes from same device

**User Authentication**
- Registered voting: Requires user login → `voter_id`
- Tracks votes per authenticated user

**Max Votes Enforcement**
- Check `max_votes_per_voter` before accepting vote
- Count votes by `voter_id` OR `voter_ip_hash`

**Voting Window Validation**
- Enforce `voting_open_date` and `voting_close_date`
- Reject votes outside window

### Awards → Podcasts Integration

**Episode Submission to Awards**
- From Episode Detail Page → "Submit to Awards" button
- Pre-fills nominee form with:
  - Episode title → nominee_name
  - Episode description → nominee_description
  - Episode audio_url → nominee audio
  - Episode cover image → nominee image
- Links `nominee.podcast_episode_id` to episode

**Nominee → Episode Linking**
- Nominee page displays linked episode details
- "Listen to Episode" button → episode player
- Drives podcast engagement from awards traffic

### Awards → Monetization Engine Integration

**Revenue Tracking**
Awards revenue feeds into the central Monetization Engine via:

1. **Revenue Events**
   - `track-awards-revenue` edge function
   - Logs all awards transactions to `revenue_events` table
   - Categories: `awards_self_nomination`, `awards_registration`, `awards_sponsorship`

2. **Financial APIs**
   - GET `/api/financials/revenue/by-episode?id={episodeId}` → Episode-level revenue with impressions and ad reads
   - GET `/api/financials/revenue/by-podcast?id={podcastId}` → Podcast-level aggregated revenue
   - GET `/api/financials/ad-spend?startDate={date}&endDate={date}` → Ad campaign spending with date filters
   - GET `/api/financials/forecasts` → Revenue forecast projections (30-day rolling)
   - GET `/api/financials/cpm-tiers` → Active CPM pricing tiers
   - GET `/api/financials/creator-payouts?id={creatorId}` → Creator payout history
   - GET `/api/financials/awards/by-program?id={programId}` → Revenue breakdown per program
   - GET `/api/financials/awards/summary` → All awards revenue summary
   - GET `/api/financials/awards/submissions/count` → Total submissions count

3. **CFO Dashboard Integration**
   - Awards revenue appears in Revenue by Source
   - Awards programs listed in Revenue Breakdown
   - Awards forecasts included in 3-Year Pro Forma
   - Custom assumptions adjustable via CFO AI
   - Real-time data toggle for live metrics vs. projections

4. **Impression & Listen Tracking**
   - **Impressions**: Tracked via `ad_impressions` table on episode view/load
   - **Listens**: Tracked via `listen_events` table for audio playback with duration and completion percentage
   - **Analytics Dashboard**: Admin → Analytics → Impressions & Listens
   - **Revenue Calculation**: Impressions directly feed CPM-based revenue calculations
   - **Episode-to-Podcast Aggregation**: Individual episode metrics roll up to podcast-level analytics
   - **Geographic Data**: IP-based city/country tracking for audience insights
   - **Privacy**: IP hashing for anonymous tracking with session-based identifiers

5. **Revenue Sources**
   ```
   Awards Total Revenue = Self-Nominations + Registrations + Sponsorships
   Platform Revenue (10%) = Total Revenue × 0.10
   Creator Net Revenue = Total Revenue - Platform Fee
   ```

6. **Payout Management**
   - All awards revenue held until `payout_scheduled_date`
   - Payouts processed via `award_payouts` table
   - Integrated with creator payout dashboard

7. **Podcast → Awards Integration**
   - "Submit to Awards" button on episode detail pages
   - Pre-fills nomination with episode metadata (title, description, audio, cover image)
   - Links `nominee.podcast_episode_id` to episode for cross-referencing
   - Drives engagement and cross-promotion between Podcasts and Awards modules

### Awards Ecosystem Position

```
                    ┌─────────────────┐
                    │  Awards Program │
                    └────────┬────────┘
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
     ┌────▼─────┐      ┌────▼─────┐      ┌────▼─────┐
     │Nominations│      │  Voting  │      │Registration│
     └────┬─────┘      └────┬─────┘      └────┬─────┘
          │                  │                  │
          │            ┌─────▼─────┐           │
          │            │Vote Tally │           │
          │            │& Results  │           │
          │            └─────┬─────┘           │
          │                  │                  │
          └──────────────────┼──────────────────┘
                             │
                    ┌────────▼────────┐
                    │Revenue Tracking │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  Monetization   │
                    │     Engine      │
                    └────────┬────────┘
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
     ┌────▼─────┐      ┌────▼─────┐      ┌────▼─────┐
     │ Revenue  │      │   CFO    │      │ Creator  │
     │Forecasts │      │Dashboard │      │ Payouts  │
     └──────────┘      └──────────┘      └──────────┘
```

### Integration Points

**With Podcast Studio**
- Episodes recorded in Studio can be submitted to Awards
- Award nominees link to podcast episodes
- Awards drive podcast discovery and engagement

**With Content Certification**
- Award-winning content can be certified
- Certified nominees display authenticity badges
- Certification adds credibility to awards

**With Advertiser Module**
- Award ceremony sponsorships
- Sponsored categories
- Advertiser packages tied to award programs

**With Voice Certification**
- Certified creator voices highlighted in nominations
- Voice authenticity verification for award content
- CPM uplift for certified award-winning podcasts

**With Media Library**
- Award ceremony recordings stored in Media Library
- Highlight reels auto-generated from winner announcements
- Social clips created from award moments

### Use Cases

1. **Industry Awards** (e.g., Veteran Podcast Awards)
   - Recognize excellence in podcast categories
   - Drive community engagement
   - Generate revenue from nominations, registrations, sponsorships

2. **Community Recognition**
   - User-voted awards for favorite creators
   - Category-based voting (Best Interview, Best Series, etc.)
   - Public engagement and discovery

3. **Monetization Showcase**
   - Awards as revenue-generating product
   - Demonstrates platform versatility
   - Investor showcase asset

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
