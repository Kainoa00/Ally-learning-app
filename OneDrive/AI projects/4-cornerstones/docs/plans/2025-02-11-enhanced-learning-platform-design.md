# Enhanced 4 Cornerstones Learning Platform - Design Document

**Date**: February 11, 2025
**Status**: Approved for Implementation
**Implementation Approach**: Phased Rollout (4 phases)

---

## Executive Summary

This design enhances the 4 Cornerstones learning platform from a simple VARK-based content transformer into a comprehensive learning management system with:

- **Enhanced VARK Assessment**: 12-15 questions across 5 learning domains with percentage-based scoring
- **Dual Role System**: Separate student and teacher views with distinct capabilities
- **Hybrid Content Model**: Both teachers and students can upload content; flexible sharing
- **Collaborative Learning**: Study groups, discussions, peer review
- **Advanced AI Personalization**: Adaptive content sequencing based on detailed learner profiles
- **Comprehensive Analytics**: Teacher insights on student progress and content effectiveness
- **Full LMS Capabilities**: Multiple content types, interactive quizzes, rich text editor

---

## System Architecture

### High-Level Architecture

**Three-Tier Architecture**:

1. **Frontend Layer (React 19 + Vite + Tailwind CSS v4)**
   - Two main application modes: Student View and Teacher View
   - Shared component library for common UI elements
   - Role-based routing and access control
   - Responsive design for mobile and desktop

2. **Backend Layer (Node.js/Express + Supabase)**
   - REST API for file uploads and AI processing
   - Supabase for authentication, database, and real-time features
   - OpenAI GPT-4 integration for content transformation
   - Background job processing for heavy AI operations

3. **Data Layer (Supabase PostgreSQL)**
   - User profiles with role information
   - Classes and membership management
   - Content library with flexible sharing permissions
   - Analytics and interaction tracking
   - Study groups and collaborative features

### Key Architectural Decisions

- **Single User Table**: One `profiles` table with `role` field rather than separate tables
- **Flexible Content Permissions**: `content_sharing` junction table for granular control
- **Real-time Features**: Leverage Supabase subscriptions for live updates
- **Trust-First Verification**: Teachers get immediate access with background verification

---

## Database Schema

### Phase 1 Tables

#### Enhanced Profiles Table
```sql
profiles (extends existing):
- id (uuid, references auth.users)
- role (text: 'student', 'teacher', 'admin')
- verification_status (text: 'pending', 'verified', 'flagged')
- vark_visual (integer 0-100, percentage)
- vark_auditory (integer 0-100)
- vark_reading_writing (integer 0-100)
- vark_kinesthetic (integer 0-100)
- assessment_completed_at (timestamp)
- username, avatar_url, created_at, updated_at
```

#### Classes Table
```sql
classes:
- id (uuid, primary key)
- teacher_id (uuid, references profiles)
- name (text, e.g., "Biology 101 - Spring 2024")
- description (text)
- invite_code (text, unique, auto-generated)
- is_active (boolean)
- created_at, updated_at
```

#### Class Memberships Table
```sql
class_memberships:
- id (uuid, primary key)
- class_id (uuid, references classes)
- student_id (uuid, references profiles)
- joined_at (timestamp)
- status (text: 'active', 'archived', 'removed')
- UNIQUE(class_id, student_id)
```

#### VARK Assessments Table
```sql
vark_assessments:
- id (uuid, primary key)
- user_id (uuid, references profiles)
- responses (jsonb, stores all question/answer pairs)
- scores (jsonb, stores detailed breakdown)
- completed_at (timestamp)
```

### Phase 2 Tables (Content & Assignments)

```sql
content:
- id (uuid)
- creator_id (uuid, references profiles)
- title, description, content_type
- raw_content (text/jsonb)
- estimated_time_minutes (integer)
- created_at, updated_at

content_sharing:
- id (uuid)
- content_id (uuid, references content)
- shared_with_type (text: 'class', 'student', 'public')
- shared_with_id (uuid, references classes or profiles)
- sharing_type (text: 'library', 'assignment')
- due_date (timestamp, nullable)
- is_required (boolean)

content_transformations:
- id (uuid)
- content_id (uuid, references content)
- user_id (uuid, references profiles, nullable for generic)
- vark_style (text)
- transformed_content (jsonb)
- generated_at (timestamp)

interactions:
- id (uuid)
- user_id (uuid, references profiles)
- content_id (uuid, references content)
- difficulty_rating (integer 1-5)
- time_spent_seconds (integer)
- completed_at (timestamp)
```

### Phase 3 Tables (Collaboration)

```sql
study_groups:
- id (uuid)
- name, description
- creator_id (uuid, references profiles)
- group_type (text: 'open', 'invite_only')
- class_id (uuid, nullable, references classes)
- created_at

study_group_members:
- id (uuid)
- group_id (uuid, references study_groups)
- user_id (uuid, references profiles)
- role (text: 'member', 'moderator')
- joined_at

discussions:
- id (uuid)
- content_id (uuid, references content, nullable)
- study_group_id (uuid, references study_groups, nullable)
- author_id (uuid, references profiles)
- parent_id (uuid, references discussions, nullable for threading)
- message (text)
- is_resolved (boolean)
- created_at

collaborative_notes:
- id (uuid)
- study_group_id (uuid, references study_groups)
- title, content (jsonb)
- created_by (uuid, references profiles)
- last_edited_by (uuid)
- version_number (integer)
- created_at, updated_at
```

### Phase 4 Tables (Interactive Content)

```sql
quizzes:
- id (uuid)
- content_id (uuid, references content)
- questions (jsonb array)
- passing_score (integer)
- created_at

quiz_attempts:
- id (uuid)
- quiz_id (uuid, references quizzes)
- user_id (uuid, references profiles)
- answers (jsonb)
- score (integer)
- completed_at

flashcard_decks:
- id (uuid)
- content_id (uuid, references content)
- cards (jsonb array)
- created_by (uuid, references profiles)
- created_at
```

---

## Enhanced VARK Assessment

### Question Structure (15 Questions Total)

**5 Learning Domains, 3 Questions Each:**

1. **Information Processing**
   - How you prefer to receive new information
   - How you process complex concepts
   - How you remember important details

2. **Problem Solving**
   - How you approach solving difficult problems
   - How you work through challenges
   - How you verify your understanding

3. **Collaboration & Communication**
   - How you prefer to explain concepts to others
   - How you work in group settings
   - How you share ideas

4. **Study & Review**
   - How you prepare for assessments
   - How you review material
   - How you organize study materials

5. **Application & Practice**
   - How you apply new knowledge
   - How you practice skills
   - How you test your understanding

### Scoring Methodology

- Each question offers 4 options (one for each VARK style)
- Students select one primary option (gets full weight)
- Each style accumulates points across all questions
- Domain-weighted scoring (some domains count more)
- Final scores normalized to percentages (sum to 100%)
- Results show: Dominant style (highest %), Secondary style (25%+ of score)

### User Experience Flow

1. Welcome screen explaining VARK and purpose
2. Questions presented one at a time with progress bar
3. Domain introduction before each set of 3 questions
4. Results page with visual chart (bar or pie chart)
5. Interpretation guide: "You are primarily a Visual learner..."
6. Option to retake assessment anytime (updates profile)

---

## User Roles & Authentication

### Role System

**Three Roles**:
- **Student**: Can join classes, upload personal content, complete assessments
- **Teacher**: Can create classes, share content, view analytics
- **Admin**: Platform management, teacher verification (future)

### Signup & Verification Flow

**Student Signup**:
1. User selects "I'm a Student" during registration
2. Immediate full access after email verification
3. Prompted to take VARK assessment

**Teacher Signup**:
1. User selects "I'm a Teacher" during registration
2. Immediate full access (trust-first approach)
3. Verification status shows "Pending Verification" badge
4. Background verification process:
   - Email domain check (edu domains auto-verify)
   - Manual review for others
   - Update to "Verified" or "Flagged" status
5. Flagged accounts reviewed by admin

### Account Features

- Users can update their role (student → teacher requires verification)
- VARK assessment can be retaken anytime
- Profile includes: name, avatar, bio, role, verification status, VARK scores

---

## Navigation & UI Structure

### Student View Navigation

```
Dashboard | My Classes | Library | Study Groups | Profile
```

**Dashboard**:
- Upcoming assignments with due dates
- Recent activity from classes
- Personalized content recommendations based on VARK
- Progress summary

**My Classes**:
- List of joined classes
- Each class shows: recent materials, assignments, teacher info
- "Browse Class Library" option per class
- Quick join class with code button

**Library**:
- Personal uploaded content
- Bookmarked content from classes
- Organized by folders/tags
- AI-transformed versions of all content

**Study Groups**:
- Active study groups
- Create/join groups interface
- Shared materials and discussions

**Profile**:
- Personal information
- VARK results with chart
- Retake assessment option
- Settings and preferences

### Teacher View Navigation

```
Dashboard | My Classes | Content Library | Analytics | Profile
```

**Dashboard**:
- Classes overview with student counts
- Recent student activity across all classes
- Content performance metrics
- Verification status badge (if pending)

**My Classes**:
- List of created classes with management options
- Create new class button (generates invite code)
- View/edit class details
- Student roster per class

**Content Library**:
- All uploaded/created content
- Share/assign to classes or students interface
- Content analytics preview
- Create new content (upload or rich editor)

**Analytics**:
- Cross-class insights dashboard
- Student progress tracking
- Learning style distribution charts
- Content effectiveness reports

**Profile**:
- Same as student profile
- Additional: verification status, teaching stats

---

## Content Sharing & Assignment Workflow

### Teacher Content Upload Flow

**Step 1: Upload/Create Content**
- Drag-and-drop or file picker for uploads
- Or use rich text editor for direct creation
- Add metadata: title, description, estimated time
- Content auto-saves to teacher's private library

**Step 2: AI Processing**
- Background processing for AI transformation into 4 VARK styles
- Status indicator: "Processing" → "Ready"
- Teacher can preview all versions
- Edit/refine AI-generated content if needed

**Step 3: Sharing Options**
Modal with checkboxes:
- ☐ **Add to Class Library**: Select class(es), students can browse and self-assign
- ☐ **Assign to Students**: Select class(es) or specific students
  - Due date (optional)
  - Mark as: Required / Optional
  - Send notification

**Step 4: Confirmation**
- Shows sharing summary
- "Share Now" or "Schedule for Later" options

### Student Content Discovery

**Class Library Tab** (within each class view):
- Grid/list of available content
- Filters: Topic, Type, Difficulty, VARK Style
- Each item shows: Title, description, teacher, estimated time
- "Add to My Library" button
- Preview before adding

**Assignments Tab** (within each class view):
- Prioritized list: Required → Optional → Suggested
- Due dates prominently displayed
- Status badges: "Not Started", "In Progress", "Completed"
- Quick action: "Start Learning" button

### Student Self-Upload Flow

- Simple upload to personal library
- AI processing happens automatically
- Organize into personal folders
- Can share with study groups (Phase 3)
- Cannot share to classes (only teachers can)

---

## Teacher Analytics Dashboard

### Overview Page Metrics

**Top-Level Cards**:
- Total Students
- Active Classes
- Content Items Shared
- Average Completion Rate
- Engagement Rate
- Materials Shared This Week

### Visualizations

**1. Learning Style Distribution**
- Stacked bar chart showing VARK distribution across all students
- Filterable by class
- Helps teachers understand their audience composition
- Example: 35% Visual, 28% Kinesthetic, 22% Reading/Writing, 15% Auditory

**2. Content Effectiveness Heat Map**
- Matrix: Content items (rows) × VARK styles (columns)
- Color intensity = completion rate + average rating
- Identifies which content works best for which learning styles
- Click to drill down to student-level data

**3. Student Progress Timeline**
- Line graph showing completion rates over time
- Compare multiple classes
- Identify engagement drops (correlate with deadlines, holidays)

**4. Difficulty Ratings Analysis**
- Bar chart of content items by average difficulty rating (1-5)
- Identifies content that needs improvement
- Shows spread: too easy vs. too challenging

### Drill-Down Views

**Class-Specific Analytics**:
- Student roster with individual progress percentages
- Assignment completion matrix (students × assignments)
- At-risk student identification (low engagement flags)

**Content-Specific Analytics**:
- View count, time spent, completion rate
- Learning style breakdown of who accessed it
- Student ratings and feedback
- Version comparison if content was updated

### Actionable Insights Panel

AI-generated recommendations based on data:
- "Students struggle with Module 5 - consider adding more visual aids"
- "Kinesthetic learners (18% of students) have low engagement - add hands-on exercises"
- "Class B outperforming Class A on same content - compare teaching approaches"
- "This content rated too easy by 80% of students - consider increasing depth"

---

## AI Content Transformation & Personalization

### Personalized Content Generation

**Input Factors**:
1. VARK percentages (e.g., 40% Visual, 30% Kinesthetic, 20% R/W, 10% Auditory)
2. Prior performance on similar content
3. Historical difficulty ratings from similar learners
4. Time of day and session length patterns (future enhancement)

**Generation Process**:

**Step 1: Primary Content Layer**
- Generate content optimized for dominant style (e.g., 40% Visual)
- For Visual: Rich diagrams, flowcharts, infographics, mind maps
- Include visual memory aids and spatial organization

**Step 2: Supplementary Layers**
- Add secondary style elements proportionally
- Kinesthetic (30%): "Try It Yourself" exercises, scenarios
- Reading/Writing (20%): Note-taking templates, summaries
- Auditory (10%): Brief audio explanations for key concepts

**Step 3: Adaptive Sequencing**
Example sequence for Visual-Kinesthetic learner:
```
1. Visual Overview (Mermaid diagram)
2. Concept Introduction (text + images)
3. Kinesthetic Exercise (hands-on activity)
4. Deep Dive (detailed visual + text explanation)
5. Practice Problem (scenario-based)
6. Summary Notes (note-taking template)
7. Audio Recap (optional, for auditory component)
```

**Step 4: Difficulty Adaptation**
- Start with baseline difficulty
- Monitor: time spent, completion rate, difficulty ratings
- Adjust subsequent content:
  - Simplify if struggling (more examples, slower pace)
  - Add challenges if excelling (advanced problems, deeper analysis)
- Generate additional practice exercises tailored to learning style

### Content Viewing Experience

**Adaptive Content Player**:
- Main content area shows personalized sequence
- Sidebar: "Try Other Styles" quick switcher
- Progress indicator showing sections completed
- Inline difficulty rating: "How challenging was this section?" (1-5 scale)
- Bookmark feature for key sections
- AI chat assistant: "Ask me anything about this content" (future)

**Practice Exercise Generation**:
After each major section, AI generates style-appropriate practice:

- **Visual**: "Label this diagram", "Match concepts to images", "Create a visual summary"
- **Auditory**: "Explain this concept aloud", "Listen and summarize", "Discuss with a peer"
- **Reading/Writing**: "Write a summary", "Create study notes", "Answer comprehension questions"
- **Kinesthetic**: "Build/simulate this", "Role-play scenario", "Hands-on experiment"

### AI Prompts Strategy

**Base Prompt Structure**:
```
You are an educational content transformer specializing in [VARK_STYLE] learning.

Student Profile:
- Dominant Style: [VARK_STYLE] ([PERCENTAGE]%)
- Secondary Style: [SECONDARY_STYLE] ([PERCENTAGE]%)
- Prior Performance: [CONTEXT]
- Difficulty Preference: [LEVEL]

Original Content:
[RAW_CONTENT]

Generate a personalized learning module that:
1. Emphasizes [DOMINANT_STYLE] techniques
2. Incorporates [SECONDARY_STYLE] elements
3. Sequences content optimally for this learner
4. Includes practice exercises
5. Adapts difficulty to [LEVEL]
```

---

## Collaborative Learning Features (Phase 3)

### Study Groups

**Creation & Management**:
- Any student can create a study group
- Group types: "Open" (anyone can join) or "Invite-only"
- Group settings: name, subject/topic, class affiliation (optional)
- Members can invite others, share materials
- Group owner can moderate (remove members, archive group)

**Study Group Workspace**:
- **Materials Tab**: Shared content uploaded by members
- **Discussion Tab**: Threaded conversations
- **Notes Tab**: Collaborative note-taking documents
- Member list with roles (owner, moderator, member)

**Study Group Features**:
- Real-time presence indicators (who's online)
- Activity feed (recent uploads, messages, edits)
- Notifications for new content or messages
- Export group materials to personal library

### Discussion Threads

**Content-Level Discussions**:
- Every piece of content has a discussion tab
- Students can:
  - Ask questions about specific sections (quote/link to section)
  - Share insights or alternative explanations
  - Rate helpful responses (upvote system)
- Teachers can monitor and participate
- AI can suggest relevant discussions when student struggles

**Thread Features**:
- Markdown support for formatting
- Attach images, links, or content snippets
- Tag other students or teachers (@mention)
- Mark as "Resolved" when question answered
- Filter: All, Unanswered, Following, My Questions
- Sort: Recent, Most Helpful, Unanswered

**Notification System**:
- Get notified when someone responds to your question
- Get notified when tagged
- Teachers notified of unanswered questions in their classes

### Collaborative Note-Taking

**Shared Note Documents**:
- Real-time collaborative editing (like Google Docs)
- Each study group can create shared notes per topic
- Color-coded cursors show who's editing
- Version history with restore capability
- Export to personal library or PDF

**Note Features**:
- Rich text formatting (bold, italic, headings, lists)
- Embed images and diagrams
- Link to source content
- AI assistant can summarize or expand notes
- Convert between VARK styles (notes → diagrams, text → audio script)

**Note Templates**:
- Cornell Notes
- Mind Map
- Outline
- Summary + Questions
- Custom

### Peer Review System

**Content Rating & Feedback**:
- Students can rate peer-uploaded content (1-5 stars)
- Leave constructive feedback (text)
- Tags: "Clear", "Helpful", "Needs Work", "Comprehensive"
- High-rated student content can be featured in class library (teacher approval)

**Quality Indicators**:
- Badge system: "Top Contributor", "Helpful Peer", "Study Group Leader"
- Leaderboards (optional, can be disabled)
- Points/gamification system (optional)

**Teacher Oversight**:
- Teachers can see peer ratings
- Flag inappropriate content
- Highlight excellent student-created materials
- Use peer ratings as participation metric

---

## Multiple Content Types & Interactive Features (Phase 4)

### Content Type Support

**Document Types**:
- **PDF**: Extract text → AI transform (current functionality)
- **Word/Google Docs**: Import via API → process like PDF
- **PowerPoint/Slides**: Extract slides + speaker notes → generate study guide
- **Rich Text**: Direct creation in platform with WYSIWYG editor

**Multimedia Types**:

**Video** (YouTube, Vimeo, uploaded):
- Auto-generate transcript using AI
- AI creates chapter markers and timestamps
- Generate study guide with timestamped sections
- Extract key frames as visual summaries
- Create quiz questions from video content

**Audio** (podcasts, lectures):
- Transcription using OpenAI Whisper
- Transform transcript to all VARK styles
- Generate visual timeline of topics
- Create reading/writing notes with timestamps
- Speed controls and playback features

**Images/Diagrams**:
- AI vision analysis and explanation
- Generate text descriptions
- Create quiz questions from diagrams
- Add annotations and labels
- OCR text extraction if applicable

**External Resources**:
- **Links** (articles, websites):
  - Fetch content and AI summarize
  - Generate multi-style study version
  - Track as "external resource" with preview
  - Archive snapshots in case link breaks

### Interactive Content Types

**AI-Generated Quizzes**:

**Quiz Settings**:
- Number of questions: 5-20
- Question types: Multiple choice, True/False, Short answer, Fill-in-blank
- Difficulty: Adaptive based on student level
- VARK-aligned questions:
  - Visual: Questions with diagrams, charts
  - Kinesthetic: Scenario-based, application questions
  - Reading/Writing: Definition, explanation questions
  - Auditory: Questions from audio clips (future)

**Quiz Features**:
- Immediate feedback with explanations
- Show correct answer with "learning moment" explanation
- Track scores and retry attempts
- Spaced repetition scheduling
- Teacher can review class performance analytics
- Export quiz results

**Flashcards**:
- Auto-generated from content
- Front/back customizable (edit AI suggestions)
- Study modes: Random, spaced repetition, focus on missed cards
- VARK-styled cards:
  - Visual: Image-based
  - Auditory: Audio pronunciation
  - Reading/Writing: Definition cards
  - Kinesthetic: Application scenarios
- Share flashcard decks with study groups
- Print flashcards

**Interactive Simulations** (for Kinesthetic learners):
- **Scenario-based learning**: "What would you do in this situation?"
- **Virtual labs**: "Mix these chemicals and observe the reaction"
- **Role-play exercises**: "Respond to this customer complaint"
- **Drag-and-drop activities**: "Organize this process in the correct order"
- **Interactive diagrams**: "Click on parts to learn more"

### Rich Content Editor (for Teachers)

**WYSIWYG Editor Features**:
- Formatting toolbar: headings, bold, italic, lists, alignment
- Insert: images, videos (embed or upload), audio, links, tables
- Embed interactive elements: quizzes, flashcards, simulations
- Split content into sections with learning objectives
- Add discussion prompts or reflection questions

**AI Assistant Features**:
- "Generate quiz from this section" → creates 5-10 questions
- "Create visual summary" → generates Mermaid diagram or infographic
- "Suggest practice exercises" → creates VARK-aligned activities
- "Simplify this text" → rewrites for lower reading level
- "Expand this concept" → adds more detail and examples

**Content Preview**:
- See how content will look in all VARK styles before publishing
- Edit AI-generated versions
- A/B test different versions with students (track which performs better)
- Mobile preview mode

**Collaboration Features**:
- Co-teaching: Multiple teachers can edit same content
- Version control with change history
- Comments and suggestions (like Google Docs)
- Template library for common lesson structures

---

## Technical Implementation Details

### API Routes Structure

```
Authentication & Users:
POST   /api/auth/signup                 # Role selection during signup
POST   /api/auth/verify-teacher         # Background verification
GET    /api/users/profile               # Get current user profile
PATCH  /api/users/profile               # Update profile, VARK scores

VARK Assessment:
GET    /api/assessment/questions        # Get all 15 questions
POST   /api/assessment/submit           # Submit answers, calculate & store scores
GET    /api/assessment/history/:userId  # View past assessment attempts

Classes:
POST   /api/classes                     # Create new class (teacher only)
GET    /api/classes                     # List my classes (as teacher or student)
GET    /api/classes/:id                 # Get class details
PATCH  /api/classes/:id                 # Update class (teacher only)
POST   /api/classes/:id/join            # Student joins with invite code
DELETE /api/classes/:id/members/:userId # Remove student (teacher only)
GET    /api/classes/:id/members         # List class members

Content Management:
POST   /api/content                     # Upload/create new content
GET    /api/content                     # List content (filtered by permissions)
GET    /api/content/:id                 # Get specific content
PATCH  /api/content/:id                 # Update content
DELETE /api/content/:id                 # Delete content
POST   /api/content/:id/share           # Share with class/students
POST   /api/content/:id/assign          # Create assignment with due date

AI Transformation:
POST   /api/ai/transform                # Generate personalized content
POST   /api/ai/practice                 # Generate practice exercises
POST   /api/ai/quiz                     # Generate quiz questions
POST   /api/ai/summary                  # Generate summary/notes

Analytics:
GET    /api/analytics/teacher           # Teacher dashboard data
GET    /api/analytics/class/:id         # Class-specific analytics
GET    /api/analytics/content/:id       # Content performance metrics
GET    /api/analytics/student           # Personal student insights

Interactions:
POST   /api/interactions                # Track content interactions
PATCH  /api/interactions/:id            # Update interaction (e.g., mark complete)

Study Groups (Phase 3):
POST   /api/groups                      # Create study group
GET    /api/groups                      # List my groups
GET    /api/groups/:id                  # Get group details
POST   /api/groups/:id/join             # Join group
POST   /api/groups/:id/members/:userId  # Add member
DELETE /api/groups/:id/members/:userId  # Remove member

Discussions (Phase 3):
POST   /api/discussions                 # Create discussion thread
GET    /api/discussions                 # List discussions (filtered)
GET    /api/discussions/:id             # Get thread with replies
POST   /api/discussions/:id/replies     # Reply to thread
PATCH  /api/discussions/:id             # Update/resolve thread

Collaborative Notes (Phase 3):
POST   /api/notes                       # Create shared note
GET    /api/notes/:id                   # Get note with realtime connection
PATCH  /api/notes/:id                   # Update note content
GET    /api/notes/:id/history           # View version history

Quizzes (Phase 4):
POST   /api/quizzes                     # Create quiz
GET    /api/quizzes/:id                 # Get quiz
POST   /api/quizzes/:id/attempts        # Submit quiz attempt
GET    /api/quizzes/:id/attempts        # Get quiz attempts (with scores)
```

### Frontend Component Architecture

**Directory Structure**:
```
src/
├── components/
│   ├── shared/                   # Reusable UI components
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── Card.jsx
│   │   ├── Modal.jsx
│   │   ├── ContentCard.jsx
│   │   ├── VarkIndicator.jsx
│   │   ├── AssignmentBadge.jsx
│   │   ├── LoadingSpinner.jsx
│   │   └── ErrorBoundary.jsx
│   │
│   ├── student/                  # Student-specific components
│   │   ├── StudentDashboard/
│   │   │   ├── UpcomingAssignments.jsx
│   │   │   ├── RecentActivity.jsx
│   │   │   ├── RecommendedContent.jsx
│   │   │   └── ProgressSummary.jsx
│   │   │
│   │   ├── StudentClasses/
│   │   │   ├── ClassList.jsx
│   │   │   ├── ClassDetail.jsx
│   │   │   ├── ClassLibrary.jsx
│   │   │   └── JoinClassModal.jsx
│   │   │
│   │   ├── ContentViewer/
│   │   │   ├── AdaptiveContentPlayer.jsx
│   │   │   ├── StyleSwitcher.jsx
│   │   │   ├── PracticeExercises.jsx
│   │   │   ├── DifficultyRating.jsx
│   │   │   └── DiscussionTab.jsx
│   │   │
│   │   └── StudyGroups/
│   │       ├── GroupList.jsx
│   │       ├── GroupWorkspace.jsx
│   │       ├── CollaborativeNotes.jsx
│   │       └── DiscussionThread.jsx
│   │
│   ├── teacher/                  # Teacher-specific components
│   │   ├── TeacherDashboard/
│   │   │   ├── ClassesOverview.jsx
│   │   │   ├── StudentActivity.jsx
│   │   │   ├── ContentPerformance.jsx
│   │   │   └── VerificationBadge.jsx
│   │   │
│   │   ├── ClassManagement/
│   │   │   ├── CreateClassModal.jsx
│   │   │   ├── ClassSettings.jsx
│   │   │   ├── StudentRoster.jsx
│   │   │   └── InviteCodeDisplay.jsx
│   │   │
│   │   ├── ContentLibrary/
│   │   │   ├── ContentGrid.jsx
│   │   │   ├── UploadModal.jsx
│   │   │   ├── ShareModal.jsx
│   │   │   └── ContentEditor.jsx
│   │   │
│   │   └── Analytics/
│   │       ├── AnalyticsDashboard.jsx
│   │       ├── LearningStyleChart.jsx
│   │       ├── EffectivenessHeatMap.jsx
│   │       └── StudentProgressTable.jsx
│   │
│   └── assessment/               # VARK assessment components
│       ├── AssessmentIntro.jsx
│       ├── QuestionCard.jsx
│       ├── ProgressBar.jsx
│       └── ResultsDisplay.jsx
│
├── pages/                        # Top-level page components
│   ├── StudentDashboardPage.jsx
│   ├── TeacherDashboardPage.jsx
│   ├── ClassPage.jsx
│   ├── ContentViewPage.jsx
│   ├── AnalyticsPage.jsx
│   └── AssessmentPage.jsx
│
├── contexts/                     # React Context providers
│   ├── AuthContext.jsx           # User, role, session
│   ├── ClassContext.jsx          # Current class data
│   ├── ContentContext.jsx        # Content library state
│   └── AnalyticsContext.jsx      # Cached analytics
│
├── hooks/                        # Custom React hooks
│   ├── useAuth.js
│   ├── useClasses.js
│   ├── useContent.js
│   ├── useAnalytics.js
│   └── useSupabaseRealtime.js
│
├── services/                     # API service layer
│   ├── api.js                    # Base API client
│   ├── authService.js
│   ├── classService.js
│   ├── contentService.js
│   ├── analyticsService.js
│   └── aiService.js
│
└── utils/                        # Utility functions
    ├── varkCalculator.js         # VARK scoring logic
    ├── dateHelpers.js
    ├── contentHelpers.js
    └── constants.js
```

### State Management Strategy

**Context Providers**:
- `AuthContext`: Current user, role, session management
- `ClassContext`: Current class data, members, settings
- `ContentContext`: Content library, filters, search
- `AnalyticsContext`: Cached analytics data to reduce API calls

**React Query for Data Fetching**:
- Use `@tanstack/react-query` for server state management
- Automatic caching with stale-while-revalidate
- Optimistic updates for better UX
- Background refetching on window focus
- Error handling and retry logic built-in

**Local State**:
- Component-level state with `useState` for UI state
- Form state with controlled inputs or react-hook-form

### Real-Time Features (Supabase)

**Subscriptions**:
- Class member changes (new students joining)
- Assignment updates (new assignments, due dates)
- Discussion thread messages
- Collaborative note edits
- Student progress updates (for teacher dashboards)

**Implementation**:
```javascript
// Example: Subscribe to class updates
const channel = supabase
  .channel(`class:${classId}`)
  .on('postgres_changes',
    { event: '*', schema: 'public', table: 'class_memberships', filter: `class_id=eq.${classId}` },
    (payload) => {
      // Update UI when members change
    }
  )
  .subscribe()
```

---

## Phase 1 Implementation Plan (Weeks 1-9)

### Week 1-2: Database & Authentication

**Tasks**:
1. Create and run database migration script
   - Add role, verification_status to profiles
   - Create classes, class_memberships, vark_assessments tables
   - Set up RLS policies for all new tables

2. Extend authentication flow
   - Add role selection to signup form (radio buttons)
   - Implement background teacher verification (email domain check)
   - Create simple admin panel for manual verification
   - Update signup form UI

3. Update Supabase client utilities
   - Helper functions: `isTeacher()`, `isStudent()`, `isVerified()`
   - Class membership queries: `getMyClasses()`, `getClassMembers()`
   - Error handling wrappers

**Deliverables**:
- ✅ Migration script executed successfully
- ✅ Users can sign up with role selection
- ✅ Teacher verification badge displays
- ✅ Auth helper functions available

### Week 3-4: Enhanced VARK Assessment

**Tasks**:
1. Create question bank
   - Write 15 questions across 5 domains
   - Ensure each question has 4 clear VARK-aligned options
   - Store in `src/data/varkQuestions.json` or database

2. Build assessment UI components
   - `AssessmentIntro.jsx`: Welcome screen
   - `QuestionCard.jsx`: Single question display
   - `ProgressBar.jsx`: Domain-based progress indicator
   - `ResultsDisplay.jsx`: Chart showing percentages

3. Implement scoring algorithm
   - `varkCalculator.js`: Calculate weighted scores
   - Normalize to percentages (sum to 100%)
   - Update profile with results via API
   - Store full assessment in vark_assessments table

**Deliverables**:
- ✅ 15-question assessment functional
- ✅ Users can complete assessment
- ✅ Results display as percentage breakdown
- ✅ Profile updates with VARK scores

### Week 5-6: Class Management - Teacher Side

**Tasks**:
1. Teacher Dashboard
   - Create `TeacherDashboardPage.jsx`
   - Display classes overview (cards or list)
   - "Create Class" button → modal
   - Show student counts per class

2. Create Class Flow
   - `CreateClassModal.jsx`: Form with name, description
   - Generate unique invite code (6-character alphanumeric)
   - Save to database via API
   - Display invite code prominently after creation

3. Class Detail View
   - `ClassPage.jsx` (teacher view)
   - Class settings: edit name, description, archive class
   - Student roster table (read-only for Phase 1)
   - Placeholder cards for "Content" and "Analytics" (Phase 2)

4. Teacher Verification Badge
   - Display verification status in header/profile
   - "Pending Verification" badge with tooltip
   - Option to check verification status

**Deliverables**:
- ✅ Teachers can create classes
- ✅ Invite codes generated and displayed
- ✅ Teachers can view class details and student list
- ✅ Verification status visible

### Week 7-8: Class Management - Student Side

**Tasks**:
1. Student Dashboard
   - Create `StudentDashboardPage.jsx`
   - Display joined classes (cards with teacher, member count)
   - "Join Class" button → modal
   - Empty state: "You haven't joined any classes yet"

2. Join Class Flow
   - `JoinClassModal.jsx`: Input field for invite code
   - Validate code via API
   - Show class preview (name, teacher, member count)
   - Confirm and join
   - Success message with redirect to class

3. My Classes Page
   - List of joined classes
   - Class cards showing:
     - Class name
     - Teacher name and avatar
     - Member count
     - "View Class" button
   - Filter/search classes (if many)

4. Class Detail View (Student)
   - `ClassPage.jsx` (student view)
   - Tabs: Overview, Library (empty), Assignments (empty)
   - Overview: Class description, teacher info, classmates
   - Placeholder: "No materials yet" for Library/Assignments

**Deliverables**:
- ✅ Students can join classes with invite code
- ✅ Students can view joined classes
- ✅ Students can see class details and member list
- ✅ Empty states for content (ready for Phase 2)

### Week 9: Polish, Testing, Bug Fixes

**Tasks**:
1. Error handling throughout application
   - Graceful error messages for failed API calls
   - Validation on all forms
   - Handle edge cases (deleted classes, removed members)

2. Loading states and transitions
   - Spinners for async operations
   - Skeleton screens for data loading
   - Smooth transitions between pages

3. Mobile responsiveness
   - Test on mobile devices
   - Adjust layouts for small screens
   - Touch-friendly buttons and interactions

4. User testing
   - Test with 5-10 real users
   - Gather feedback on flow and UX
   - Identify confusing elements

5. Bug fixes and refinements
   - Fix reported issues
   - Improve performance (memoization, code splitting)
   - Accessibility improvements (ARIA labels, keyboard navigation)

**Deliverables**:
- ✅ No critical bugs
- ✅ Mobile-responsive on all screens
- ✅ User feedback incorporated
- ✅ Ready for Phase 2 development

### Phase 1 Success Criteria

**Functional Requirements**:
- ✅ Users can sign up as student or teacher
- ✅ Teachers receive verification status (pending/verified)
- ✅ Complete 15-question VARK assessment
- ✅ Assessment results display as percentage breakdown
- ✅ VARK scores stored in profile
- ✅ Teachers can create classes and generate invite codes
- ✅ Students can join classes with codes
- ✅ Both roles can view class details and member rosters
- ✅ Basic navigation works for both roles

**Technical Requirements**:
- ✅ Database migration successful
- ✅ RLS policies enforced
- ✅ API routes functional and secure
- ✅ Error handling implemented
- ✅ Loading states throughout
- ✅ Mobile-responsive

**UX Requirements**:
- ✅ Intuitive navigation
- ✅ Clear role distinction
- ✅ Helpful empty states
- ✅ User feedback gathered and positive

---

## Phase 2 Overview (Content & Analytics)

### Scope
- Content upload and library management
- Open library + assignment system
- Content sharing workflow (teacher)
- Content discovery (student)
- Teacher analytics dashboard
- Basic interaction tracking

### Estimated Timeline
- 8-10 weeks
- Will be planned in detail after Phase 1 completion

---

## Phase 3 Overview (Collaboration)

### Scope
- Study groups creation and management
- Discussion threads on content
- Collaborative note-taking
- Peer review and ratings

### Estimated Timeline
- 6-8 weeks
- Will be planned in detail after Phase 2 completion

---

## Phase 4 Overview (Advanced Features)

### Scope
- Multiple content types (video, audio, images, rich text)
- Interactive quizzes and flashcards
- Simulations for kinesthetic learners
- Rich content editor for teachers
- Advanced AI features (chat assistant, content recommendations)

### Estimated Timeline
- 10-12 weeks
- Will be planned in detail after Phase 3 completion

---

## Risk Assessment & Mitigation

### Technical Risks

**Risk**: OpenAI API rate limits or costs
- **Mitigation**: Implement caching for AI-generated content, queue system for heavy load, set spending alerts

**Risk**: Supabase real-time scaling issues
- **Mitigation**: Start with polling fallback, upgrade Supabase plan if needed, implement connection pooling

**Risk**: Large file uploads slow or fail
- **Mitigation**: Chunk uploads, use Supabase storage, implement resume capability, set file size limits

**Risk**: Database performance with many users
- **Mitigation**: Index key columns, use materialized views for analytics, implement pagination

### UX Risks

**Risk**: Teachers overwhelmed by analytics
- **Mitigation**: Progressive disclosure, start with simple metrics, add "Learn More" tooltips

**Risk**: Students confused by multiple VARK styles
- **Mitigation**: Clear onboarding, highlight dominant style, provide style switcher education

**Risk**: Content discovery too complex
- **Mitigation**: Start with simple filters, add search gradually, user testing before adding features

### Business Risks

**Risk**: Low adoption by teachers
- **Mitigation**: Clear value proposition, easy onboarding, showcase success stories, provide templates

**Risk**: Content quality issues (inappropriate content)
- **Mitigation**: Report/flag system, teacher moderation tools, content guidelines, review flagged content

---

## Future Enhancements (Post-Phase 4)

- **LMS Integrations**: Canvas, Blackboard, Google Classroom
- **Mobile Apps**: Native iOS and Android apps
- **Offline Mode**: Download content for offline access
- **Parent Portal**: Parents view student progress (K-12 focus)
- **Accessibility Features**: Screen reader optimization, dyslexia-friendly fonts, color contrast options
- **Gamification**: Badges, streaks, leaderboards (optional, toggle per class)
- **Content Marketplace**: Teachers share/sell content
- **AI Tutoring**: Chatbot for personalized help
- **Video Conferencing**: Integrated virtual classroom
- **Calendar Integration**: Sync assignments with Google Calendar, Outlook

---

## Appendix: Technology Stack

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite 8
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **State Management**: React Context + React Query
- **Routing**: React Router v7
- **Forms**: React Hook Form (Phase 2+)
- **Charts**: Recharts or Chart.js (for analytics)
- **Rich Text Editor**: TipTap or Lexical (Phase 4)
- **Real-time**: Supabase Realtime

### Backend
- **API Server**: Node.js + Express
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage (for file uploads)
- **AI**: OpenAI GPT-4 API
- **PDF Processing**: pdf-parse
- **Video Processing**: FFmpeg (Phase 4)
- **Audio Transcription**: OpenAI Whisper API (Phase 4)

### DevOps
- **Hosting**: Vercel (frontend), Fly.io or Railway (backend)
- **Database Hosting**: Supabase cloud
- **CI/CD**: GitHub Actions
- **Monitoring**: Sentry (error tracking), Supabase logs
- **Analytics**: PostHog or Mixpanel (product analytics)

### Development Tools
- **Version Control**: Git + GitHub
- **Package Manager**: npm
- **Code Quality**: ESLint, Prettier
- **Testing**: Vitest (unit), Playwright (e2e)
- **Documentation**: Markdown in `/docs`

---

## Conclusion

This design provides a comprehensive roadmap for transforming 4 Cornerstones into a full-featured, adaptive learning management system. The phased approach allows for:

1. **Quick Value Delivery**: Phase 1 ships in 9 weeks with core features
2. **Iterative Improvement**: Each phase builds on feedback from previous phases
3. **Risk Mitigation**: Technical and UX risks addressed early
4. **Scalability**: Architecture supports growth in users and features
5. **User-Centric**: Focus on student learning outcomes and teacher insights

The combination of detailed VARK assessment, role-based experiences, flexible content sharing, collaborative features, and advanced AI personalization positions 4 Cornerstones as a unique player in the educational technology space.

**Next Steps**: Begin Phase 1 implementation with database migration and enhanced authentication flow.
