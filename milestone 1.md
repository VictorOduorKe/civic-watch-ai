# CivicWatch AI Kenya — Milestone 1

## Public Landing Page

You are continuing development of **CivicWatch AI Kenya**, a civic technology platform developed for **Open Civic Lab (OCL)**.

**Milestone 0 — Project Foundation is already complete and working.**

Your task is to implement **Milestone 1 only: the complete public landing page**.

Do not implement authentication, incident reporting, dashboards, AI verification, maps, alerts, or other future modules.

---

# 1. OBJECTIVE

Build a professional, modern, responsive public landing page for CivicWatch AI Kenya.

The landing page should clearly communicate:

* What CivicWatch AI Kenya is
* Who it is for
* What citizens can do with the platform
* How the platform works
* The role of Open Civic Lab
* Available civic features
* Responsible use of AI
* How citizens can get started

The result should feel like a serious Kenyan civic-tech platform rather than a generic AI-generated website or a government portal.

The page must work well on:

* Desktop
* Laptop
* Tablet
* Mobile

---

# 2. EXISTING SYSTEM

Milestone 0 already provides:

* React + Vite
* JavaScript/JSX
* Tailwind CSS
* React Router
* Express backend
* MySQL
* API service
* Environment configuration
* Security foundation
* Project documentation

Before making changes:

1. Inspect the existing project.
2. Understand the current frontend structure.
3. Reuse the existing architecture.
4. Reuse the existing API service.
5. Do not replace working foundation code unnecessarily.
6. Do not recreate configuration that already exists.

If something from M0 is broken, fix it before implementing M1.

---

# 3. STRICT SCOPE

This milestone is ONLY for the public landing page.

Implement:

* Landing page
* Navigation
* Hero section
* Feature section
* How It Works section
* Civic impact/value section
* AI responsibility section
* Open Civic Lab section
* Call-to-action sections
* Footer
* Responsive navigation
* Responsive layouts
* Accessibility states
* Basic page-level SEO metadata

Do NOT implement:

* Login
* Registration
* Authentication
* User accounts
* Citizen dashboard
* Incident reporting
* Admin dashboard
* Admin login
* AI verification
* Gemini API
* AI assistant
* CivicWatch map
* Alerts
* Notifications
* Surveys
* Petitions
* Database tables
* New backend feature APIs

---

# 4. BRAND IDENTITY

Use the name:

**CIVICWATCH AI KENYA**

Organization:

**Open Civic Lab (OCL)**

The design should communicate:

* Civic participation
* Trust
* Transparency
* Community
* Technology
* Accessibility
* Responsibility
* Kenyan identity

Avoid making the platform look like:

* A government ministry website
* A political campaign
* A news website
* A cryptocurrency project
* A generic SaaS dashboard
* A generic AI startup landing page

---

# 5. VISUAL DIRECTION

Use a clean, human-designed civic-tech aesthetic.

The interface should feel:

* Professional
* Modern
* Warm
* Trustworthy
* Accessible
* Clear
* Mobile-first

Use strong visual hierarchy rather than excessive decoration.

## Color direction

Use a restrained palette inspired by Kenya:

* Deep green
* White
* Black/dark charcoal
* Warm neutral tones
* Red only where appropriate for urgent civic/emergency indicators

Do not use excessive colors.

Do not use gradients.

Do not use rainbow effects.

Do not use glowing neon effects.

Do not make every section a different color.

Use solid colors and subtle borders/shadows where appropriate.

---

# 6. TYPOGRAPHY

Choose a clean, highly readable font.

The typography should support:

* Large hero heading
* Clear section headings
* Comfortable body text
* Mobile readability
* Accessible contrast

Avoid excessive:

* ALL CAPS
* Tiny text
* Decorative fonts
* Very thin text

Use typography to create hierarchy.

---

# 7. NAVIGATION

Create a responsive navigation bar.

Desktop navigation should include:

```text
Home
How It Works
Features
Reports
Alerts
About
```

Right side:

```text
Login
Get Started
```

For this milestone:

* `Home` should work.
* Section links should scroll to the appropriate sections.
* `Reports`, `Alerts`, and other future-feature navigation may point to appropriate placeholder routes/sections only if necessary.
* `Login` and `Get Started` must NOT implement authentication.

If those actions are shown, make their future purpose clear without pretending authentication already exists.

Prefer navigation that does not create broken routes.

---

# 8. HERO SECTION

Create a strong hero section.

Primary headline:

**YOUR VOICE. YOUR COMMUNITY. YOUR KENYA.**

Supporting message should explain that CivicWatch AI Kenya helps citizens:

* Raise civic concerns
* Follow public-service issues
* Access civic information
* Verify information
* Participate in civic activities
* Receive relevant civic alerts

Do not imply that CivicWatch is a government agency.

Include primary CTA:

**Report an Incident**

Because incident reporting belongs to Milestone 4, this button must NOT implement reporting yet.

For now, either:

* route to a clearly marked future reporting page, or
* provide a controlled placeholder interaction explaining that reporting will be available soon.

Do not create fake report submission functionality.

Secondary CTA:

**Explore CivicWatch**

This should scroll to the features/how-it-works content.

---

# 9. HERO SUPPORTING MESSAGE

Use human language.

Avoid exaggerated claims such as:

* "Revolutionizing democracy"
* "The world's most advanced civic platform"
* "AI that changes everything"
* "Guaranteed justice"
* "Instant government action"

CivicWatch should be presented accurately as a civic technology platform.

The messaging should emphasize:

> Helping citizens connect civic concerns, trusted information, public participation, and community action in one place.

---

# 10. FEATURE SECTION

Create a section explaining the main CivicWatch capabilities.

Use six feature cards.

### 1. Report Issues

Citizens will be able to submit concerns involving public services, infrastructure, safety, environmental issues, and other civic matters.

### 2. Verify Information

Users will be able to submit claims or information for structured verification and context.

### 3. Civic Participation

Support participation in surveys, consultations, petitions, and community discussions.

### 4. Civic Alerts

Provide relevant public-service, safety, health, community, and other civic notices.

### 5. AI Civic Assistant

Provide accessible guidance about civic participation and using the CivicWatch platform.

### 6. Track Issues

Allow citizens to follow the progress of reports they submit.

These are product descriptions for the planned platform.

Do not pretend that these modules already work if they have not been implemented.

---

# 11. HOW IT WORKS

Create a clear four-step section.

### Step 1 — Speak Up

A citizen identifies a civic concern or wants to participate in a civic activity.

### Step 2 — CivicWatch Processes

The platform organizes the information and routes it through the appropriate workflow.

### Step 3 — Review & Action

Relevant authorized teams or organizations can review the issue and take appropriate action where applicable.

### Step 4 — Stay Informed

Citizens can receive updates, access information, and follow relevant civic developments.

Use a simple visual timeline or numbered layout.

Do not imply automatic government action.

---

# 12. RESPONSIBLE CIVIC TECHNOLOGY

Create a dedicated section explaining how CivicWatch approaches sensitive civic information.

Include principles such as:

### Human review matters

AI can assist with information processing, but important decisions require appropriate human review.

### Reports are not automatic proof

A submitted report represents a citizen's reported concern or allegation. It does not automatically establish that wrongdoing occurred.

### Privacy matters

Only information necessary for the platform's purpose should be collected and exposed.

### AI can make mistakes

AI-generated information may contain errors and should be verified, especially for important decisions.

This section is important because CivicWatch may eventually process sensitive reports.

Use careful language.

Do not make legal conclusions.

---

# 13. CIVIC IMPACT SECTION

Create a section explaining the broader purpose of CivicWatch.

Possible themes:

* Better access to civic information
* Easier reporting of community concerns
* More transparent issue tracking
* Improved civic participation
* Better access to trusted information
* Stronger connections between communities and relevant organizations

Do not claim measured impact.

Do not invent statistics.

Do not display fake numbers such as:

```text
10,000+
Citizens helped

5,000+
Issues resolved

47
Counties covered
```

unless those values actually exist in the database.

For M1, use qualitative messaging instead.

---

# 14. OPEN CIVIC LAB SECTION

Create a section introducing:

**Open Civic Lab (OCL)**

Explain that CivicWatch AI Kenya is being developed as a civic technology initiative associated with Open Civic Lab.

Use a concise description focused on:

* Civic innovation
* Technology
* Community participation
* Responsible use of digital tools
* Open civic collaboration

Do not invent:

* Awards
* Partnerships
* Government contracts
* Funding
* Membership numbers
* Impact statistics
* Official government relationships

Only include information that is actually known.

---

# 15. CALL TO ACTION

Create a strong final CTA.

Suggested heading:

**BE PART OF THE CIVIC CONVERSATION**

Supporting message should encourage users to explore the platform and participate in civic life.

Include:

**Get Started**

and

**Learn How It Works**

Again, do not implement authentication during this milestone.

The CTA should not pretend a working registration system exists.

---

# 16. FOOTER

Create a professional footer.

Include:

### Brand

CIVICWATCH AI KENYA

Open Civic Lab (OCL)

### Navigation

* Home
* How It Works
* Features
* About

### Platform

* Reports
* Alerts
* Civic Participation
* AI Civic Assistant

### Responsible Use

Include a short statement that CivicWatch is a civic technology platform and does not replace emergency services, government authorities, legal professionals, or other responsible institutions.

### Copyright

Use the current year dynamically rather than hardcoding an outdated year.

Example:

```javascript
new Date().getFullYear()
```

Do not add fake social media links.

---

# 17. ICONS

Use a consistent icon library if one is already installed.

If no icon library exists, add a lightweight one such as Lucide React.

Icons should:

* Support comprehension
* Match the content
* Have accessible labels where needed
* Not be used excessively

Avoid random decorative icons.

---

# 18. IMAGERY

Use imagery carefully.

The landing page should not become an image gallery.

If imagery is used, it should support:

* Kenyan communities
* Civic participation
* Public services
* Community interaction
* Responsible technology

Do not use stereotypical or exploitative imagery.

Do not use fake screenshots of features that have not been implemented.

Do not create fake statistics as visual decoration.

If external images are used, ensure the implementation is appropriate for the project and document their source.

Prefer optimized assets.

---

# 19. RESPONSIVE DESIGN

The page must work across:

### Mobile

Approximately:

```text
320px+
```

### Tablet

Approximately:

```text
768px+
```

### Desktop

Approximately:

```text
1024px+
```

### Large screens

Approximately:

```text
1440px+
```

Check:

* Navigation
* Hero
* Cards
* Buttons
* Typography
* Footer
* Section spacing
* Horizontal overflow

There must be no accidental horizontal scrolling.

---

# 20. MOBILE NAVIGATION

Create a proper mobile navigation.

Use:

* Menu button
* Expand/collapse navigation
* Accessible focus behavior
* Clear close behavior

Do not allow the mobile menu to cover the entire application incorrectly.

When a navigation item is selected:

1. Navigate/scroll to the correct section.
2. Close the mobile menu.

---

# 21. ACCESSIBILITY

Follow basic accessibility practices.

Use:

* Semantic HTML
* Proper headings
* `<nav>`
* `<main>`
* `<section>`
* `<footer>`
* Accessible buttons
* Form labels if forms are introduced
* Keyboard navigation
* Visible focus states
* Sufficient contrast
* Meaningful link text

Do not rely on color alone to communicate meaning.

For decorative images:

```text
alt=""
```

For meaningful images:

provide descriptive alt text.

Do not overuse ARIA.

Use native HTML semantics whenever possible.

---

# 22. SEO FOUNDATION

Add appropriate page metadata.

At minimum:

### Title

```text
CivicWatch AI Kenya | Your Voice. Your Community. Your Kenya.
```

### Description

Write a concise description explaining CivicWatch AI Kenya as a civic technology platform supporting civic participation, public-service reporting, trusted information, and community engagement.

Do not make unsupported claims.

---

# 23. COMPONENT ARCHITECTURE

Do not place the entire landing page inside one enormous component.

Break it into reusable components.

For example:

```text
frontend/src/
├── components/
│   ├── Navbar.jsx
│   ├── Footer.jsx
│   ├── SectionHeading.jsx
│   └── ...
│
├── pages/
│   └── Home.jsx
│
└── ...
```

Additional components may include:

```text
HeroSection.jsx
FeaturesSection.jsx
HowItWorksSection.jsx
ResponsibleTechnologySection.jsx
ImpactSection.jsx
OclSection.jsx
CallToAction.jsx
```

Use sensible component boundaries.

Do not create dozens of unnecessary components.

---

# 24. DATA AND CONTENT

For this milestone, static landing-page content is acceptable.

Do not create a database table simply to store landing-page text.

Do not create backend APIs for landing-page sections.

Do not hardcode fake platform statistics.

Keep content easy to modify later.

If repeated feature information is represented as an array, use a clean data structure.

---

# 25. ROUTING

The existing React Router foundation should remain intact.

The landing page should be available at:

```text
/
```

Do not implement authentication routes.

Do not implement dashboard routes.

Do not create fake protected pages.

Future routes may be documented but should not be implemented unless necessary for the landing page to function correctly.

---

# 26. BACKEND

The backend should remain essentially unchanged.

Do not add new CivicWatch business APIs.

Do not add database tables.

Do not modify the authentication foundation because authentication belongs to M2.

Only make backend changes if something from M0 is required for the frontend to function correctly.

If no backend changes are needed, leave the backend untouched.

---

# 27. SECURITY

Even though this is a public page:

* Do not expose environment variables.
* Do not expose backend secrets.
* Do not expose database credentials.
* Do not put API keys in frontend code.
* Do not introduce unnecessary third-party scripts.
* Do not disable existing security middleware.
* Do not bypass CORS.
* Do not weaken the M0 security configuration.

---

# 28. PERFORMANCE

Keep the landing page lightweight.

Avoid:

* Huge image files
* Unnecessary libraries
* Heavy animation libraries
* Autoplay video
* Excessive JavaScript
* Large unused dependencies

Use:

* Lazy loading where useful
* Optimized images
* Reusable components
* Efficient CSS
* Proper responsive images if needed

Do not optimize prematurely at the cost of maintainability.

---

# 29. ANIMATION

Use subtle animation only where it improves usability.

Examples:

* Navigation transitions
* Button hover
* Card hover
* Section reveal

Avoid:

* Excessive motion
* Constant floating elements
* Large parallax effects
* Distracting animations

Respect:

```text
prefers-reduced-motion
```

where practical.

---

# 30. EMPTY / ERROR STATES

The landing page should not depend on dynamic backend data.

Therefore, it should not show fake loading states for content that is static.

If a future feature button points to an unavailable feature, make the state clear.

Never show:

```text
Success
Report submitted
```

when no report was actually submitted.

---

# 31. TESTING

After implementation, test the landing page thoroughly.

### Functional testing

Verify:

* `/` loads correctly.
* Navigation works.
* Anchor links work.
* Mobile menu works.
* Buttons behave correctly.
* No broken links.
* No JavaScript errors.
* No console errors.
* No failed API calls caused by the landing page.

### Responsive testing

Test:

* Mobile
* Tablet
* Desktop
* Large desktop

Check for:

* Overflow
* Broken layouts
* Overlapping elements
* Text clipping
* Unusable buttons
* Navigation problems

### Accessibility

Check:

* Keyboard navigation
* Focus states
* Heading hierarchy
* Button labels
* Image alt text
* Contrast
* Mobile navigation accessibility

### Performance

Check:

* Initial load
* Image sizes
* Unnecessary dependencies
* Browser console warnings

---

# 32. VISUAL QUALITY CHECK

Before finishing, inspect the page as a real user would.

Ask:

* Does the first screen immediately explain CivicWatch?
* Is the primary message clear?
* Does the page feel Kenyan without becoming stereotypical?
* Does it look like a civic technology platform?
* Is the typography readable?
* Are sections visually connected?
* Are there too many colors?
* Are there gradients?
* Are there unnecessary decorations?
* Does the mobile layout feel intentionally designed?
* Are buttons clearly distinguishable?
* Does the page feel trustworthy?

Make improvements where necessary.

---

# 33. DO NOT OVERBUILD

This is extremely important.

Do NOT use this milestone as an excuse to implement future features.

Do not create:

```text
users table
reports table
alerts table
notifications table
verification table
participation table
admin table
```

Those belong to later milestones.

Do not create:

```text
/auth
/dashboard
/admin
/reports
/alerts
/verify
```

unless a simple placeholder route is absolutely necessary.

The purpose of M1 is the **public presentation layer**.

---

# 34. DEFINITION OF DONE

Milestone 1 is complete only when:

* [ ] Existing M0 foundation remains intact.
* [ ] Public landing page is implemented.
* [ ] `/` loads correctly.
* [ ] Responsive navigation exists.
* [ ] Hero section exists.
* [ ] Features section exists.
* [ ] How It Works section exists.
* [ ] Civic impact/purpose section exists.
* [ ] Responsible technology section exists.
* [ ] Open Civic Lab section exists.
* [ ] Final CTA exists.
* [ ] Footer exists.
* [ ] Mobile navigation works.
* [ ] Anchor navigation works.
* [ ] Accessibility basics are implemented.
* [ ] SEO metadata exists.
* [ ] No gradients are used.
* [ ] No fake statistics are displayed.
* [ ] No fake report submissions occur.
* [ ] No authentication is implemented.
* [ ] No database schema is added for future features.
* [ ] No unnecessary backend changes are made.
* [ ] No secrets are exposed.
* [ ] Frontend compiles successfully.
* [ ] Backend still starts successfully.
* [ ] MySQL connectivity still works.
* [ ] Browser console has no application errors.
* [ ] Responsive testing is completed.
* [ ] Documentation is updated if necessary.

---

# 35. FINAL VERIFICATION

Before finishing:

1. Start the backend.
2. Confirm MySQL connection.
3. Start the frontend.
4. Open `/`.
5. Test desktop layout.
6. Test mobile layout.
7. Test navigation.
8. Test all CTA behavior.
9. Check browser console.
10. Check backend console.
11. Confirm M0 health endpoint still works.
12. Fix any errors discovered.

Do not proceed to Milestone 2 automatically.

Stop after M1 is fully working.

---

# 36. FINAL IMPLEMENTATION REPORT

When finished, provide:

```text
Milestone:
M1 — Landing Page

Frontend changes:
...

Components created:
...

Routes:
...

Backend changes:
...

Database changes:
...

Accessibility:
...

Responsive testing:
...

Security:
...

Known issues:
...

M0 health check:
Working / Not working

M1 status:
Complete / Incomplete

Ready for:
M2 — Authentication
```

Only report functionality that was actually implemented and tested.

Do not claim that future CivicWatch features are operational.

The project should be left in a clean state ready for:

**M2 — Authentication**
