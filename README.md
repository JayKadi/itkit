ITKit is a modern, self-service IT knowledge base built to reduce support ticket volume by empowering users to solve common IT problems themselves. It features instant search with quick answers, categorized articles, and user feedback tracking.
🔗 Live Demo: https://itkit.vercel.app
🔗 Backend API: https://itkit-production.up.railway.app

📋 Table of Contents

Features
Tech Stack
Architecture
Getting Started
Environment Variables
API Documentation
Project Structure
Deployment
Future Improvements
Author


✨ Features
🔍 Intelligent Search

Live Search: Results appear as you type with 300ms debounce
Quick Answers: Instant step-by-step solutions displayed at the top of search results (hybrid approach)
Full-Text Search: Search across article titles, content, and quick answers
Real-time Results: Articles update automatically as you type

📚 Knowledge Base

Categorized Articles: 6 IT categories (VPN & Network, Email & Communication, Hardware, Software & Applications, Security & Access, Printers & Scanning)
Rich Content: HTML-formatted articles with headings, lists, and formatting
View Tracking: Automatic view count increment on article reads
Related Articles: Discover similar content from the same category
Estimated Read Time: Auto-calculated based on word count

👍 User Feedback

Helpful/Not Helpful: Vote on article usefulness
Problem Solved Tracking: Track when articles solve problems and prevent tickets
Feedback Metrics: Display helpfulness percentage on each article

📱 User Experience

Responsive Design: Works seamlessly on desktop, tablet, and mobile
Instant Search: Search from homepage with autocomplete
Breadcrumb Navigation: Easy navigation back to categories and home
Loading States: Clear visual feedback during data fetching
Clean UI: Modern design with TailwindCSS


🚀 Tech Stack
Frontend

React 18 - UI framework
TypeScript - Type safety and better developer experience
Vite - Lightning-fast build tool
TailwindCSS - Utility-first CSS framework
React Router - Client-side routing
Axios - HTTP client for API requests

Backend

Node.js - Runtime environment
Express - Minimal and flexible web framework
TypeScript - Type-safe backend development
CORS - Cross-origin resource sharing

Database

Supabase (PostgreSQL) - Managed PostgreSQL database
Full-text Search - Fast article search using PostgreSQL
Auto-incrementing Counters - View count, helpful count tracking

Deployment

Frontend: Vercel (auto-deploy from GitHub)
Backend: Railway (auto-deploy from GitHub)
Database: Supabase Cloud
🛠️ Getting Started
Prerequisites

Node.js 18+ and npm
Supabase account (free tier works)
Git

1. Clone the Repository
bashgit clone https://github.com/yourusername/itkit.git
cd itkit
2. Backend Setup
bashcd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
Edit .env with your credentials:
envPORT=5000
NODE_ENV=development
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
Run database schema in Supabase SQL Editor:
Go to Supabase Dashboard → SQL Editor → Run the schema from backend/database/schema.sql
Start development server:
bashnpm run dev
Backend runs at: http://localhost:5000
3. Frontend Setup
bashcd frontend

# Install dependencies
npm install

# Start development server
npm run dev
Frontend runs at: http://localhost:5173
4. Create Sample Articles
You can create articles directly in Supabase Table Editor:

Go to Supabase Dashboard → Table Editor
Select articles table
Click "Insert row"
Fill in:

title: "How to Connect to VPN"
slug: "how-to-connect-to-vpn"
content: Your HTML content
quick_answer: "1. Open VPN\n2. Enter credentials\n3. Click Connect"
status: "published"
category_id: (copy from categories table)
🔐 Environment Variables
Backend (.env)
env# Server Configuration
PORT=5000
NODE_ENV=development

# Supabase Database
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here

# CORS (optional - defaults to allow all)
FRONTEND_URL=http://localhost:5173
Frontend
No environment variables needed. The API URL is configured in src/services/api.ts:
typescriptconst API_BASE_URL = 'https://itkit-production.up.railway.app/api';
For local development, you can change this to http://localhost:5000/api

📡 API Documentation
Base URL

Production: https://itkit-production.up.railway.app/api
Development: http://localhost:5000/api

Endpoints
Articles
MethodEndpointDescriptionParametersGET/articlesGet all published articles?limit=20&offset=0&category=slug&status=publishedGET/articles/:slugGet single article by slug-POST/articles/:id/viewIncrement article view count-
Example:
bashGET /api/articles?limit=10&category=vpn-network

Response:
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 15,
    "limit": 10,
    "offset": 0,
    "hasMore": true
  }
}
Categories
MethodEndpointDescriptionGET/categoriesGet all categoriesGET/categories/:slug/articlesGet articles by category
Example:
bashGET /api/categories

Response:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "VPN & Network",
      "slug": "vpn-network",
      "icon": "🌐",
      "description": "VPN setup and network issues"
    }
  ]
}
Search
MethodEndpointDescriptionParametersGET/searchSearch articles with quick answer?q=search_term
Example:
bashGET /api/search?q=vpn

Response:
{
  "success": true,
  "data": {
    "quickAnswer": "1. Open VPN client\n2. Enter credentials\n3. Click Connect",
    "sourceArticle": {
      "title": "How to Connect to VPN",
      "slug": "how-to-connect-to-vpn"
    },
    "articles": [...],
    "searchTerm": "vpn",
    "totalResults": 3
  }
}
```

#### **Feedback**

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| POST | `/feedback/helpful` | Submit helpful/not helpful vote | `{ "article_id": "uuid", "is_helpful": true }` |
| POST | `/feedback/ticket-prevented` | Mark article as preventing ticket | `{ "article_id": "uuid", "issue_type": "VPN issue" }` |

---

## 📁 Project Structure
```
itkit/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── articleController.ts    # Article CRUD logic
│   │   │   ├── categoryController.ts   # Category logic
│   │   │   ├── searchController.ts     # Search with quick answers
│   │   │   └── feedbackController.ts   # Feedback handling
│   │   ├── routes/
│   │   │   ├── articles.ts
│   │   │   ├── categories.ts
│   │   │   ├── search.ts
│   │   │   └── feedback.ts
│   │   ├── services/
│   │   │   └── supabaseClient.ts       # Database connection
│   │   ├── types/
│   │   │   └── index.ts                # TypeScript interfaces
│   │   ├── app.ts                      # Express app setup
│   │   └── server.ts                   # Server entry point
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.tsx
│   │   │   │   └── Footer.tsx
│   │   │   └── articles/
│   │   │       ├── QuickAnswerBox.tsx
│   │   │       ├── FeedbackButtons.tsx
│   │   │       └── RelatedArticles.tsx
│   │   ├── pages/
│   │   │   ├── HomePage.tsx            # Homepage with live search
│   │   │   ├── ArticleDetailPage.tsx   # Article view
│   │   │   ├── SearchPage.tsx          # Search results
│   │   │   └── CategoryPage.tsx        # Category browse
│   │   ├── services/
│   │   │   ├── api.ts                  # Axios instance
│   │   │   ├── articleService.ts       # Article API calls
│   │   │   └── categoryService.ts      # Category API calls
│   │   ├── types/
│   │   │   └── index.ts                # TypeScript types
│   │   ├── App.tsx                     # Routes
│   │   ├── main.tsx                    # Entry point
│   │   └── index.css                   # TailwindCSS
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
│
└── README.md

📊 Database Schema
sqlcategories
├── id (uuid, primary key)
├── name (string)
├── slug (string, unique)
├── icon (string)
├── description (text)
└── created_at (timestamp)

articles
├── id (uuid, primary key)
├── title (string)
├── slug (string, unique)
├── content (text, HTML formatted)
├── quick_answer (text, optional)
├── category_id (uuid, foreign key → categories)
├── status (enum: draft, published, archived)
├── view_count (integer, default 0)
├── helpful_count (integer, default 0)
├── not_helpful_count (integer, default 0)
├── estimated_read_time (integer, minutes)
├── created_at (timestamp)
└── updated_at (timestamp)

article_feedback
├── id (uuid, primary key)
├── article_id (uuid, foreign key → articles)
├── is_helpful (boolean)
├── comment (text, optional)
└── created_at (timestamp)

search_logs
├── id (uuid, primary key)
├── search_term (string)
├── results_count (integer)
├── top_result_id (uuid, foreign key → articles)
└── created_at (timestamp)

ticket_preventions
├── id (uuid, primary key)
├── article_id (uuid, foreign key → articles)
├── issue_type (string, optional)
└── created_at (timestamp)
```

---

## 🚢 Deployment

### **Backend (Railway)**

1. Create account at [railway.app](https://railway.app)
2. Create new project → Deploy from GitHub
3. Select your repository
4. Add environment variables:
```
   SUPABASE_URL=your_url
   SUPABASE_ANON_KEY=your_key
   NODE_ENV=production

Deploy automatically on git push

Build Command: npm install && npm run build
Start Command: npm start
Frontend (Vercel)

Create account at vercel.com
Import GitHub repository
Framework: Vite
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
Deploy

Database (Supabase)

Create project at supabase.com
Go to SQL Editor
Run the schema from your repository
Copy Project URL and anon key
Add to Railway environment variables


📈 Current Features
User-Facing Features
✅ Browse articles by category
✅ Search articles with live results
✅ View article details with view tracking
✅ Quick answer box for instant solutions
✅ Vote articles helpful/not helpful
✅ Mark when article solves problem
✅ Related articles suggestions
✅ Responsive mobile design
✅ Fast performance with debounced search
Technical Features
✅ Full TypeScript implementation
✅ RESTful API architecture
✅ PostgreSQL full-text search
✅ Auto-generated article slugs
✅ Auto-calculated read time
✅ CORS configuration
✅ Error handling
✅ Loading states

🔮 Future Improvements
Phase 1: Authentication & Admin Dashboard

 JWT-based authentication
 User registration and login
 Role-based access control (user, IT staff, admin)
 Admin dashboard for IT staff
 Rich text editor (WYSIWYG) for creating articles
 Article editing and deletion
 Draft/publish workflow

Phase 2: Enhanced Features

 Article commenting system
 Tag system for better organization
 Article versioning and history
 Advanced search filters (by date, category, author)
 Bookmark/favorite articles
 Recently viewed articles
 Article rating (1-5 stars)

Phase 3: Analytics & Insights

 Admin analytics dashboard
 Most viewed articles
 Most helpful articles
 Popular search terms
 Ticket prevention metrics
 User engagement tracking
 Export analytics to CSV

Phase 4: Advanced Capabilities

 Multi-language support
 Email notifications (article updates, comments)
 PDF export of articles
 Print-friendly article view
 Article attachments (images, files)
 Video embed support
 Integration with ticketing system
 Chatbot integration


💡 Usage Tips
Creating Articles (via Supabase)
Articles are created directly in Supabase Table Editor:
Required fields:

title: Clear, descriptive title
slug: URL-friendly version (auto-suggested from title)
content: HTML-formatted content
status: Set to "published" to make visible
Built with ❤️ using React, Node.js, TypeScript, and Supabase

ITKit - Empowering users to solve IT problems themselves 🧰
