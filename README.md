# Quick Start Guide - Modular HTML Files

## What Was Done ✅

Your `index.html` has been successfully broken down into **5 separate HTML files + components**:

### 📁 Component Files Created:

1. **navbar.html** - Navigation bar
2. **home.html** - Landing/home page
3. **about.html** - About page
4. **research.html** - Research page
5. **team-publications.html** - Team & Publications pages
6. **footer.html** - Footer component

### 🔧 New Files to Replace Current Ones:

- **index-new.html** → Replace your current `index.html`
- **app-new.js** → Replace your current `app.js`

---

## 🚀 Implementation Steps

### Option A: Using File Explorer

1. Rename your old files as backup:
   - `index.html` → `index.html.backup`
   - `app.js` → `app.js.backup`

2. Rename new files:
   - `index-new.html` → `index.html`
   - `app-new.js` → `app.js`

3. Delete the `.backup` files once you confirm everything works

### Option B: Using Terminal

```powershell
# From your project directory
mv index.html index.html.backup
mv app.js app.js.backup
mv index-new.html index.html
mv app-new.js app.js

# Verify
dir
# You should see: index.html, app.js, navbar.html, home.html, etc.
```

---

## ✨ After Implementation

Your directory will look like this:

```
gci-lab.github.io/
├── index.html (modular - loads components)
├── app.js (updated - loads HTML files)
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

---

## 🧪 Testing

1. Open `index.html` in your browser
2. Test navigation between pages:
   - Click "Home" - should show home page
   - Click "About" - should show about page
   - Click "Research" - should show research page
   - Click "Team" - should show team page
   - Click "Publications" - should show publications page

3. Test mobile menu (on small screens)
4. Verify all styling looks correct

---

## 💡 Key Features Preserved

- ✅ Single-Page Application (SPA) behavior
- ✅ Smooth page transitions
- ✅ Mobile responsive design
- ✅ All styling and animations
- ✅ Icon rendering (Lucide)
- ✅ Publications loading
- ✅ URL hash-based navigation (#home, #about, etc.)

---

## 🛠️ Making Changes

Now that files are modularized, editing is easier:

### Edit the Home Page

- Open `home.html`
- Make changes
- Save
- Refresh browser

### Edit the About Page

- Open `about.html`
- Make changes
- Save
- Refresh browser

### Edit Navigation

- Open `navbar.html`
- Make changes
- Save
- Refresh browser

---

## 📝 Version Control

Commit these new files to git:

```powershell
git add index.html app.js navbar.html home.html about.html research.html team-publications.html footer.html
git commit -m "Refactor: Break down index.html into modular components"
git push origin main
```

---

## ❓ Troubleshooting

**Q: Pages aren't loading?**

- Make sure all `.html` component files are in the same directory as `index.html`
- Check browser console for any fetch errors

**Q: Styling looks broken?**

- Clear browser cache (Ctrl+Shift+Delete)
- Make sure `styles.css` is still in the root directory

**Q: Navigation isn't working?**

- Check that `app.js` was properly renamed/replaced
- Make sure all nav links have the correct `data-target` attributes

---

## 📚 Documentation

See `MODULAR_STRUCTURE_README.md` for detailed technical information about the new structure.

---

**Questions or issues? All functionality remains the same - just better organized!** 🎉
