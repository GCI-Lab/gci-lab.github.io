# GCI Lab Website - Modular Structure

## Overview

The index.html file has been broken down into **5 separate HTML component files** for better organization and maintainability.

## File Structure

### Main Files

- **index-new.html** - New main entry point (replace current index.html with this)
- **app-new.js** - Updated JavaScript with component loading (replace current app.js with this)
- **publications.js** - Existing publications logic (unchanged)
- **styles.css** - Existing styles (unchanged)

### Component Files (HTML Modules)

1. **navbar.html** - Navigation bar component
   - Fixed navbar with logo and menu
   - Mobile menu functionality
   - Desktop and mobile responsive design

2. **home.html** - Home/Landing page
   - Hero section with main CTA
   - Research collaborators carousel
   - Lab development roadmap section

3. **about.html** - About the Lab page
   - Vision and mission cards
   - Core objectives grid
   - Lab philosophy and goals

4. **research.html** - Research Themes page
   - 5 research theme cards
   - Green Data Centers & Cloud
   - Energy-Efficient IoT & Edge
   - Green Software & AI
   - E-waste & Circular ICT
   - Cross-cutting Interdisciplinary Domains

5. **team-publications.html** - Team and Publications pages combined
   - Leadership section (Director and Advisor)
   - Research Faculty & Lecturers
   - Key Support & Operations
   - Lab Alumni
   - Publications section with filters

6. **footer.html** - Footer component
   - Quick navigation links
   - University affiliation info
   - Contact information
   - Copyright and credits

## How to Implement

### Step 1: Replace Files

1. Backup your current `index.html` and `app.js`
2. Rename `index-new.html` to `index.html`
3. Rename `app-new.js` to `app.js`

### Step 2: Verify File Structure

Your directory should now look like:

```
gci-lab.github.io/
├── index.html (new modular version)
├── app.js (new with component loading)
├── publications.js (unchanged)
├── styles.css (unchanged)
├── config.js (unchanged)
├── navbar.html
├── home.html
├── about.html
├── research.html
├── team-publications.html
└── footer.html
```

### Step 3: Test

- Open `index.html` in your browser
- Navigation should work smoothly between pages
- All styling and functionality should remain the same

## Benefits of This Structure

✅ **Better Organization** - Each page/component in its own file
✅ **Easier Maintenance** - Modify specific sections without touching the whole file
✅ **Scalability** - Easy to add new pages or components
✅ **Team Collaboration** - Multiple people can work on different components
✅ **SPA Performance** - Dynamic loading keeps file sizes smaller
✅ **Code Reusability** - Components can be updated in one place

## Important Notes

- All files should be in the same directory for the `fetch()` calls to work
- The routing logic remains the same - single-page app behavior is preserved
- Mobile menu functionality is preserved
- All styling (Tailwind CSS) remains unchanged
- Icons (Lucide) are re-initialized after component loading

## Deployment

When deploying to GitHub Pages:

1. Make sure all `.html` component files are in the root directory
2. The `fetch()` calls are relative paths, so they'll work on live URLs
3. Test all navigation links on the live site to ensure proper loading

## Future Enhancements

- Consider adding more granular components (e.g., separate header components)
- Create a template system for repeated components (e.g., team member cards)
- Implement lazy loading for better performance
- Add component-specific CSS files if needed
