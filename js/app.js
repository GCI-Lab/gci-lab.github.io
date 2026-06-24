// ===============================
// PARTNERS DATA FOR MARQUEE
// ===============================
const partners = [
  { name: "Military Institute of Science and Technology", logo: "https://mist.ac.bd/assets/30-q2kX7pZF.png" },
  { name: "King Saud University (KSU)", logo: "https://upload.wikimedia.org/wikipedia/en/a/a3/King_Saud_University_logo.png" },
  { name: "Ontario Tech University", logo: "https://yt3.googleusercontent.com/ytc/AIdro_k3BmSvDsqJqzq8qAx5y7A6sJO2M3xh2EvsQYAsuAThcHw=s900-c-k-c0x00ffffff-no-rj" },
  { name: "Prince Sattam bin Abdulaziz University", logo: "https://s.research.com/images/institutions/160x160/40545.webp" },
  { name: "Islamic University of Technology", logo: "https://upload.wikimedia.org/wikipedia/en/d/d0/Islamic_University_of_Technology_%28coat_of_arms%29.png" },
  { name: "Islamic University of Madinah", logo: "https://upload.wikimedia.org/wikipedia/en/4/48/Islamic_University_of_Madinah_Logo.svg" },
  { name: "Nguyen Tat Thanh University", logo: "https://vnur.vn/wp-content/uploads/2023/01/19.Nguyen-Tat-Thanh.jpg" }
];

function initMarquee() {
  const track = document.getElementById("marqueeTrack");
  const template = document.getElementById("partnerTemplate");
  if (!track || !template) return;

  const allPartners = [...partners, ...partners]; // Seamless infinite loop clone
  track.innerHTML = "";
  allPartners.forEach((partner) => {
    const clone = template.content.cloneNode(true);
    clone.querySelector(".partner-logo").src = partner.logo;
    clone.querySelector(".partner-logo").alt = partner.name;
    clone.querySelector(".partner-name").textContent = partner.name;
    track.appendChild(clone);
  });
}

// Smart helper function to handle path fallbacks
async function safeFetch(primaryPath, fallbackPath) {
  try {
    let response = await fetch(primaryPath);
    if (!response.ok) {
      response = await fetch(fallbackPath);
    }
    if (response.ok) return await response.text();
  } catch (e) {
    try {
      let response = await fetch(fallbackPath);
      if (response.ok) return await response.text();
    } catch (err) {
      console.error(`Could not locate content at ${primaryPath} or ${fallbackPath}`);
    }
  }
  return '';
}

// ===============================
// LOAD MODULAR HTML COMPONENTS
// ===============================
async function loadComponents() {
  try {
    // 1. Load Navbar
    const navbarContent = await safeFetch('components/navbar.html', 'navbar.html');
    const nvContainer = document.getElementById('navbar-container');
    if (nvContainer) nvContainer.innerHTML = navbarContent;

    // 2. Load Sub-Pages Dynamically
    const pages = ['home', 'about', 'research', 'team-publications'];
    let pagesHTML = '';
    
    for (const page of pages) {
      const content = await safeFetch(`pages/${page}.html`, `${page}.html`);
      pagesHTML += content;
    }
    const pgContainer = document.getElementById('pages-container');
    if (pgContainer) pgContainer.innerHTML = pagesHTML;

    // 3. Load Footer
    const footerContent = await safeFetch('components/footer.html', 'footer.html');
    const ftContainer = document.getElementById('footer-container');
    if (ftContainer) ftContainer.innerHTML = footerContent;

    // 4. Initialize elements immediately AFTER HTML exists in the DOM
    initMarquee();
    
    if (typeof initPublications === 'function') {
      initPublications(); 
    }

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
    
    initializeRouting();

  } catch (error) {
    console.error('Error loading components:', error);
  }
}

// ===============================
// SPA ROUTING LOGIC
// ===============================
function initializeRouting() {
  const navLinks = document.querySelectorAll(".nav-link");
  const pages = document.querySelectorAll(".page-view");

  // Soft reset visibility defaults
  pages.forEach(p => p.style.display = "none");

  function navigateTo(pageId) {
    // Hide everything completely via direct inline styles
    pages.forEach((page) => {
      page.style.display = "none";
      page.classList.remove("active");
    });

    // Locate correct target container handling shared files layout
    let targetPage = document.getElementById("page-" + pageId);
    
    if (!targetPage) {
      if (pageId === "team" || pageId === "team-publications") {
        targetPage = document.getElementById("page-team");
      } else if (pageId === "publications") {
        targetPage = document.getElementById("page-publications");
      }
    }

    // Force visible style declaration directly
    if (targetPage) {
      targetPage.style.display = "block";
      targetPage.classList.add("active");
    } else {
      const homePage = document.getElementById("page-home");
      if (homePage) {
        homePage.style.display = "block";
        homePage.classList.add("active");
      }
    }

    // Process styling for Navbar Items
    navLinks.forEach((link) => {
      const targetAttr = link.getAttribute("data-target");
      if (targetAttr === pageId && link.classList.contains("px-4")) {
        link.classList.add("text-brand-600", "bg-brand-50");
        link.classList.remove("text-gray-600");
      } else if (link.classList.contains("px-4")) {
        link.classList.remove("text-brand-600", "bg-brand-50");
        link.classList.add("text-gray-600");
      }
    });

    window.scrollTo({ top: 0, behavior: "smooth" });

    const mobileMenu = document.getElementById("mobile-menu");
    if (mobileMenu) mobileMenu.classList.add("hidden");

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      const target = link.getAttribute("data-target");
      if (target) {
        e.preventDefault();
        history.pushState(null, null, "#" + target);
        navigateTo(target);
      }
    });
  });

  function handleHash() {
    const hash = window.location.hash.replace("#", "");
    if (hash) {
      navigateTo(hash);
    } else {
      navigateTo("home");
    }
  }
  window.addEventListener("popstate", handleHash);

  // Navbar Layout Effects
  const navbar = document.getElementById("navbar");
  if (navbar) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 10) {
        navbar.classList.add("shadow-md");
        navbar.classList.replace("bg-white/95", "bg-white");
      } else {
        navbar.classList.remove("shadow-md");
        navbar.classList.replace("bg-white", "bg-white/95");
      }
    });
  }

  // Mobile drawer trigger
  const mobileBtnMenu = document.getElementById("mobile-menu-btn");
  if (mobileBtnMenu) {
    mobileBtnMenu.addEventListener("click", () => {
      const mobileMenu = document.getElementById("mobile-menu");
      if (mobileMenu) mobileMenu.classList.toggle("hidden");
    });
  }

  handleHash();
}

document.addEventListener("DOMContentLoaded", loadComponents);