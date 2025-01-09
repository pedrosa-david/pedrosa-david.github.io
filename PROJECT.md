# Project Knowledge Base

## Project Overview

- Wedding website for Amira & David
- Multilingual support (Italian and Spanish)
- Jekyll-based static site

## Agent Prompt

As an agent, your prompt is to:

1. Language Management:

   - Always maintain bilingual content parity between Italian (primary) and Spanish
   - Ensure language detection and routing logic remains intact
   - Preserve language-specific cultural nuances in translations

2. Code Structure:

   - Keep language-specific content in respective `_includes/{it,es}_data` directories
   - Follow the established 4-space HTML/CSS/JS and 2-space YAML indentation
   - Maintain UTF-8 encoding and Unix-style line endings

3. Feature Handling:

   - Preserve RSVP system functionality including form validation and submission
   - Maintain responsive design and mobile-first approach
   - Ensure smooth scroll and navigation features work across all sections

4. Security & Performance:

   - Keep API keys and sensitive data out of version control
   - Ensure Google Apps Script integration remains secure
   - Only include analytics in production environment
   - Optimize assets (images, fonts) for web delivery

5. Documentation:
   - Update this knowledge base when adding new features
   - Document any new dependencies or configuration changes
   - Keep code comments clear and meaningful in both languages

## Core Functionalities

### Language Handling

- Default language: Italian (/it)
- Supported languages:
  - Italian (it)
  - Spanish (es)
- Automatic language detection based on browser settings
- Fallback to Italian if language not supported
- Language switcher in header (IT/ES buttons)

### Navigation Structure

Common sections across languages:

- Events/Schedule (Orari/Horario)
- Venue (Location/Lugar)
- Travel (Arrivare/Viaje)
- Accommodation (Soggiornare/Alojamiento)
- Things to Do (Dintorni/Qué Hacer)
- Wedding Registry (Lista di Nozze/Lista de Boda)
- FAQ
- RSVP (Confermare partecipazione/Confirmar asistencia)

### RSVP System

- Email input (optional in Spanish version)
- Phone number with country prefix selection (+39 IT, +34 ES)
- Attendance confirmation with dynamic form fields:
  - Yes: Guest details, dietary requirements, bus service needs
  - No: Name input only
- Form submission handling:
  - Loading states
  - Success/Error messages
  - Google Apps Script integration for data processing

### UI/UX Features

- Responsive navigation with mobile toggle
- Smooth scroll navigation
- Custom branding with StayClassy font
- Font Awesome integration
- Bootstrap-based layout
- Google Analytics in production environment

### Styling Structure

#### Core Styling Files

- `_includes/css/agency.css`: Main theme styling
  - Responsive layout
  - Component styles
  - Navigation
  - Timeline
  - RSVP form
- `_includes/css/bootstrap.min.css`: Base framework
- `style.css`: Jekyll-processed styles

#### Theme Configuration

- Colors defined in `_data/template.yml`:
  - Primary: #f8d56f (gold)
  - Secondary: #facf6b
  - Secondary-dark: #333
  - Muted: #777

#### Typography

- Primary font: Montserrat
- Secondary font: Montserrat
- Custom fonts:
  - StayClassy SLDT (decorative, brand)
  - Maxleon (headings)
  - Font Awesome 5 (icons)

#### Responsive Design

- Mobile-first approach
- Breakpoints:
  - Mobile: Default
  - Tablet: 768px
  - Desktop: 992px
  - Large: 1200px

#### Special Components

- Timeline with alternating layout
- Custom buttons (primary, xl, m)
- Modal windows
- Social media buttons
- Form controls with custom styling

## Directory Structure

├── includes/
│ ├── it_data/ # Italian content
│ │ ├── head.html
│ │ ├── events.html
│ │ ├── header.html
│ │ └── rsvp.html
│ └── es_data/ # Spanish content
│ ├── head.html
│ ├── events.html
│ ├── header.html
│ └── rsvp.html
├── css/
│ ├── font-awesome/
│ │ └── webfonts/
│ │ ├── fa-solid-900.woff
│ │ └── fa-solid-900.woff2
│ └── webfontkit-StayClassy/
├── plugins/
│ └── hex_to_rgb.rb
├── .vscode/
│ └── settings.json # Editor configuration
├── config.yml # Jekyll configuration
├── Gemfile.lock
└── index.html # Main entry point with language detection

### Generated Site Structure (\_site/)

├── css/
├── js/
├── img/
├── it/
│ └── index.html # Italian version
├── es/
│ └── index.html # Spanish version
├── style.css # Compiled styles
├── index.html # Main entry
├── head.html
└── other assets (CNAME, LICENSE, etc.)

## Code Standards

### VS Code Settings (.vscode/settings.json)

- Trim trailing whitespace enabled
- 4-space indentation for HTML/CSS/JS
- 2-space indentation for YAML
- Show whitespace characters
- Insert final newline
- Trim final newlines

### File Formatting

- UTF-8 encoding
- Unix-style line endings (LF)
- No trailing whitespace
- Files end with newline

## Meta Information

- Site Title: "Matrimonio Amira & David"
- Description: "Invito Digitale | Invitación digital"
- Base URL: https://www.amira-david.com

## Jekyll Configuration

- Theme: jekyll-theme-primer
- Required plugins:
  - jekyll-github-metadata
  - jekyll-seo-tag
  - jekyll-coffeescript
  - jekyll-commonmark-ghpages
  - jekyll-gist
  - jekyll-paginate
  - jekyll-relative-links
  - jekyll-optional-front-matter
  - jekyll-readme-index
  - jekyll-default-layout
  - jekyll-titles-from-headings

## Custom Plugins

- hex_to_rgb.rb: Converts hexadecimal color codes to RGB format

## Assets

### Fonts

- Font Awesome (Solid 900)
- StayClassy (Custom webfont)

## Development Instructions

1. Install dependencies:

   ```bash
   bundle install
   ```

2. Run local server:

   ```bash
   bundle exec jekyll serve
   ```

3. Build for production:
   ```bash
   bundle exec jekyll build
   ```

## Important Notes

- All included files must be placed in `_includes` directory
- Language-specific content is separated into `it_data` and `es_data` directories
- Main index.html handles language routing
- SEO meta tags are included in head.html
- Form submissions are processed through Google Apps Script
- Analytics is only included in production environment
