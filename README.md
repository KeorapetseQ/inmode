# InMode: Your Smart Workspace

Build a modern, full-stack web application called InMode.

1. PRODUCT OVERVIEW

InMode is a modern, intelligent productivity and personal management platform designed to help users organize their digital life in one place.

The application should combine task management, notes, personal organization, productivity tracking, and an AI-powered assistant into a single clean and intuitive platform.

The goal of InMode is to give users a centralized workspace where they can manage what they need to do, keep important information, plan their time, and interact with an AI assistant that understands their context.

The application should feel like a combination of a productivity dashboard, personal workspace, and AI assistant rather than simply being a basic to-do list.

The target users are students, developers, professionals, and general users who want a simple but powerful system for managing their daily activities.

2. BRAND AND DESIGN

Application name:

InMode

Design direction:

Modern

Minimalistic

Premium

Dark-themed

Developer-friendly

Clean

Responsive

Professional

Slight futuristic/AI aesthetic

The primary interface should use a dark aesthetic, with subtle gradients, glassmorphism where appropriate, smooth borders, cards, shadows, and modern typography.

Avoid making the interface overly complicated.

The application should feel similar in quality to modern products such as Notion, Linear, Vercel, Raycast, and modern AI applications, while maintaining its own identity.

Use a consistent design system throughout the entire application.

Suggested visual style

Dark background

Slightly lighter cards/panels

White/light-gray primary text

Muted secondary text

One distinctive accent color

Subtle gradients

Rounded corners

Soft shadows

Smooth hover states

Smooth page transitions

Minimal icons

Good spacing

Strong visual hierarchy

The UI must be fully responsive on:

Desktop

Laptop

Tablet

Mobile

3. AUTHENTICATION

Users must be able to create accounts and securely log in.

Support:

Email and password registration

Login

Logout

Password reset

Persistent sessions

Protected routes

Also design the architecture so that OAuth authentication can be added.

Potential OAuth providers:

Google

GitHub

After authentication, each user should have their own isolated workspace and data.

A user must never be able to access another user's private information.

4. USER PROFILE

Every user should have a profile.

The profile should contain:

Name

Username

Email

Profile picture

Short bio

Account creation date

Preferences

Theme preferences

Notification preferences

Users should be able to edit their profile.

The application should display the user's name naturally throughout the interface.

For example:

"Good morning, Tlhohonolofatso."

The greeting should dynamically use the authenticated user's name.

5. MAIN DASHBOARD

Create a central dashboard that acts as the user's home page after logging in.

The dashboard should provide an overview of the user's current activity.

Include:

Greeting section

Display:

User's name

Current date

Short motivational/productivity message

Example:

"Good morning, Tlhohonolofatso."

"Here's what your day looks like."

Productivity overview

Show cards containing:

Tasks completed

Tasks remaining

Tasks overdue

Notes created

Current productivity streak

Today's tasks

Display the user's tasks for the current day.

Each task should show:

Title

Priority

Due time/date

Completion status

Users should be able to mark tasks as complete directly from the dashboard.

Upcoming tasks

Show upcoming tasks ordered chronologically.

Recent notes

Show recently created or edited notes.

AI assistant shortcut

Provide a prominent shortcut to open the AI assistant.

6. TASK MANAGEMENT

Create a complete task-management system.

Users should be able to:

Create tasks

Edit tasks

Delete tasks

Complete tasks

Reopen completed tasks

Set due dates

Set due times

Set priorities

Add descriptions

Add categories

Add tags

Search tasks

Filter tasks

Sort tasks

Task priorities:

Low

Medium

High

Urgent

Task statuses:

To Do

In Progress

Completed

Users should be able to organize tasks into categories.

Example categories:

University

Work

Personal

Projects

Coding

Other

7. TASK VIEWS

Provide multiple ways to view tasks.

List View

Display tasks in a clean list.

Board View

Create a Kanban-style board with:

To Do

In Progress

Completed

Users should be able to move tasks between columns.

Calendar View

Display tasks according to their due dates.

The calendar should allow users to navigate between:

Day

Week

Month

8. NOTES

Create a dedicated notes system.

Users should be able to:

Create notes

Edit notes

Delete notes

Search notes

Organize notes

Add titles

Add tags

Pin notes

Notes should support rich text or Markdown-style formatting.

Include formatting such as:

Headings

Bold

Italic

Lists

Numbered lists

Checklists

Code blocks

Links

Users should be able to quickly create a note from the dashboard.

9. AI ASSISTANT

One of the most important features of InMode should be the integrated AI assistant.

Create an AI assistant called InMode AI.

The AI assistant should behave as an intelligent productivity companion rather than simply being a generic chatbot.

Users should be able to ask questions such as:

"Help me plan my day."

"What tasks do I have today?"

"Create a study plan for my exam."

"Turn this into tasks."

"Summarize this note."

"What should I focus on today?"

"Create a weekly study schedule."

"Break this project into smaller tasks."

The assistant should understand relevant information from the user's InMode workspace where appropriate.

For example, if the user has tasks and notes stored in the application, the AI should be able to use that information to provide contextual responses.

10. AI TASK CREATION

The AI assistant should be able to convert natural-language requests into structured tasks.

For example:

User:

"I need to study Java exceptions tomorrow at 2 PM for two hours."

The AI should be able to create a task containing:

Title:
"Study Java Exception Handling"

Date:
Tomorrow

Time:
14:00

Duration:
2 hours

Category:
Study

The user should be shown a confirmation before important actions are permanently saved.

11. AI NOTE FEATURES

The AI should also be able to work with notes.

Possible commands:

Summarize note

Explain note

Rewrite note

Extract key points

Convert note into tasks

Generate questions from note

Generate study material

Generate flashcards

Example:

User:

"Turn this lecture note into revision questions."

The AI should return structured questions.

12. AI CHAT INTERFACE

The AI interface should resemble a modern AI chat application.

Include:

Conversation history

New conversation button

Message bubbles

User messages

AI responses

Loading indicator

Streaming response effect if supported

Copy response button

Regenerate response

Clear conversation

Suggested prompts

The user should be able to start multiple conversations.

Each conversation should have:

Unique ID

Title

Creation date

Last updated date

Messages

Users should be able to rename and delete conversations.

13. AI PROVIDER ARCHITECTURE

Do not hard-code the AI provider directly into the frontend.

Create a backend abstraction for the AI service.

The architecture should make it possible to use providers such as:

OpenAI

Gemini

Anthropic

Other compatible providers

Store API keys securely using environment variables.

Never expose AI API keys in client-side code.

Use server-side API calls.

14. SEARCH

Create a global search system.

Users should be able to search across:

Tasks

Notes

AI conversations

The search interface should be fast and modern.

Include keyboard-friendly interaction.

For example:

Ctrl + K

could open a global command/search interface.

15. COMMAND PALETTE

Create a command palette similar to modern developer applications.

When the user presses:

Ctrl + K

open a command/search interface.

Possible commands:

Create task

Create note

Open dashboard

Open tasks

Open notes

Open AI assistant

Search workspace

Open settings

Toggle theme

Logout

16. NOTIFICATIONS

Create a notification system.

Users should receive notifications for things such as:

Upcoming task deadlines

Overdue tasks

Important reminders

AI-generated reminders

System notifications

Users should be able to control notification preferences.

17. PRODUCTIVITY ANALYTICS

Create a productivity analytics page.

Display useful statistics such as:

Tasks completed this week

Tasks completed this month

Completion rate

Overdue tasks

Productivity streak

Most productive days

Tasks by category

Tasks by priority

Use clean charts and visualizations.

Do not overwhelm the user with unnecessary analytics.

18. SETTINGS

Create a complete settings page.

Sections:

Account

Name

Username

Email

Profile picture

Appearance

Dark mode

Light mode

System theme

Notifications

Task reminders

Deadline reminders

AI notifications

AI

AI provider

AI preferences

Conversation settings

Security

Change password

Active sessions

Logout from all devices

Data

Allow users to:

Export their data

Delete their account

Account deletion should require confirmation.

19. DATABASE

Use a relational database.

PostgreSQL is preferred.

Create appropriate tables/entities for:

Users

Fields such as:

id

name

username

email

password_hash

profile_image

bio

created_at

updated_at

Tasks

Fields:

id

user_id

title

description

status

priority

category

due_date

due_time

created_at

updated_at

completed_at

Notes

Fields:

id

user_id

title

content

category

created_at

updated_at

Tags

Fields:

id

name

user_id

Conversations

Fields:

id

user_id

title

created_at

updated_at

Messages

Fields:

id

conversation_id

role

content

created_at

Notifications

Fields:

id

user_id

title

message

type

read

created_at

Use foreign keys and appropriate indexes.

All user-owned records must be associated with the authenticated user's ID.

20. SECURITY

Security is important.

Implement:

Secure authentication

Password hashing

Protected API routes

Authorization checks

Input validation

SQL injection protection

XSS protection

Secure session/token handling

Rate limiting where appropriate

Environment variables for secrets

Never trust user IDs supplied by the frontend.

The backend must determine the authenticated user and use that identity when accessing user data.

21. API ARCHITECTURE

Use a clean REST API or similarly structured backend API.

Example endpoints:

Authentication:

POST /api/auth/register

POST /api/auth/login

POST /api/auth/logout

Users:

GET /api/user

PUT /api/user

Tasks:

GET /api/tasks

POST /api/tasks

PUT /api/tasks/:id

DELETE /api/tasks/:id

Notes:

GET /api/notes

POST /api/notes

PUT /api/notes/:id

DELETE /api/notes/:id

AI:

POST /api/ai/chat

GET /api/ai/conversations

GET /api/ai/conversations/:id

DELETE /api/ai/conversations/:id

Notifications:

GET /api/notifications

PUT /api/notifications/:id/read

22. TECHNOLOGY STACK

Build InMode using a modern full-stack architecture.

Preferred frontend:

React

TypeScript

Tailwind CSS

Preferred backend:

Node.js

Express.js

Database:

PostgreSQL

Authentication:

Secure JWT/session-based authentication

Other technologies can be introduced if they significantly improve the architecture, but avoid unnecessary complexity.

Use reusable components and clean separation between:

UI

Business logic

API communication

Database logic

Authentication

AI services

23. PROJECT STRUCTURE

Organize the project professionally.

The frontend should contain reusable components such as:

Navbar

Sidebar

DashboardCard

TaskCard

TaskModal

NoteCard

NoteEditor

Calendar

KanbanBoard

AIChat

MessageBubble

SearchCommand

NotificationPanel

UserProfile

Backend should separate:

Routes

Controllers

Services

Middleware

Database

Authentication

AI integration

Keep the code modular and maintainable.

24. NAVIGATION

The main application should have a sidebar.

Navigation items:

Dashboard

Tasks

Calendar

Notes

AI Assistant

Analytics

Notifications

Settings

At the bottom of the sidebar display:

User profile

Settings

Logout

On mobile, convert the sidebar into a mobile navigation menu.

25. LANDING PAGE

Before authentication, create a professional landing page.

Hero section:

"Your workspace. Your tasks. Your intelligence."

Explain that InMode combines productivity management with an intelligent AI assistant.

Include:

Get Started button

Login button

Product preview

Feature sections

AI assistant preview

Task management preview

Analytics preview

The landing page should be visually impressive but not excessively animated.

26. EMPTY STATES

Every major page should have a useful empty state.

Examples:

Tasks:

"No tasks yet. Create your first task."

Notes:

"Your workspace is empty. Start capturing your ideas."

AI:

"How can I help you today?"

Include appropriate buttons to guide users toward their first action.

27. LOADING AND ERROR STATES

Implement proper:

Loading states

Skeleton loaders

Error messages

Empty states

Success notifications

Form validation

Do not leave blank screens when data is loading.

Errors should be understandable to normal users.

28. RESPONSIVENESS

The application must work properly on mobile devices.

On mobile:

Sidebar becomes a navigation drawer

Dashboard cards stack vertically

Tables become mobile-friendly

AI chat uses the full screen

Forms remain easy to use

Buttons remain accessible

No horizontal scrolling

29. USER EXPERIENCE

Prioritize simplicity.

A new user should be able to:

Register

Enter the dashboard

Create a task

Create a note

Open the AI assistant

Ask the AI for help

Return to their dashboard

without needing a tutorial.

Interactions should feel immediate and intuitive.

Use toast notifications for successful actions.

For destructive actions such as deleting a task, note, conversation, or account, request confirmation.

30. AI PERSONALIZATION

The AI should use the user's name where appropriate.

It should also be aware of relevant workspace context when the user explicitly asks it to use that information.

For example:

User:

"What should I focus on today?"

The assistant can examine today's incomplete tasks and respond based on those tasks.

The AI must not automatically expose private information outside the authenticated user's workspace.

31. FUTURE FEATURES

Design the architecture so that these features can be added later:

Google Calendar integration

Microsoft Calendar integration

GitHub integration

Email integration

Collaborative workspaces

Team projects

File uploads

AI document analysis

Voice interaction

Mobile application

Browser extension

Automated workflows

Recurring tasks

Habit tracking

Focus/Pomodoro mode

Do not implement all of these now unless necessary. The current version should establish a strong foundation for future expansion.

32. IMPORTANT DEVELOPMENT REQUIREMENTS

Do not create a superficial UI-only prototype.

Build the application as a genuine full-stack application with:

Real authentication

Real database persistence

Real CRUD operations

Real API routes

Proper authorization

Proper error handling

Secure handling of credentials

Functional AI integration architecture

Avoid hard-coded fake data wherever real database functionality is expected.

Use realistic seed/demo data only where necessary.

All major buttons and interactions should actually work.

33. FINAL PRODUCT EXPERIENCE

When a user opens InMode, the experience should feel like they are entering a personal digital workspace.

The application should answer three questions immediately:

What do I need to do?

What do I need to remember?

How can InMode help me?

Tasks answer the first question.

Notes answer the second.

InMode AI answers the third.

The final product should feel polished, intelligent, fast, responsive, and scalable.

Build the application with production-quality structure rather than treating it as a simple student CRUD project.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://inmode.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/464089a1-bdfe-4109-883f-686328029ed4).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
