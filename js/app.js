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
  { name: "Nguyen Tat Thanh University", logo: "https://stisd.ntt.edu.vn/wp-content/uploads/2022/11/Logo-DH-Nguyen-Tat-Thanh-821x800.png" }
];

// ===============================
// DYNAMIC SEO METADATA CONFIG
// ===============================
const PAGE_SEO = {
  home: {
    title: "GCI Lab | Green Computing and Interdisciplinary Lab | UIU",
    description: "Welcome to the Green Computing and Interdisciplinary Lab (GCI Lab) at United International University. Innovating for a sustainable digital future through sustainable IT, climate-aware computing, and eco-friendly AI."
  },
  about: {
    title: "About Us | GCI Lab",
    description: "Learn about the mission, vision, and interdisciplinary scope of the Green Computing and Interdisciplinary Lab at United International University."
  },
  research: {
    title: "Research Themes | GCI Lab",
    description: "Explore our research vectors including cloud energy optimization, E-waste tracking, smart sorting AI, and circular ICT systems."
  },
  team: {
    title: "Governance & Leadership Team | GCI Lab",
    description: "Meet the academic experts and faculty steering sustainable IT research initiatives at the Green Computing and Interdisciplinary Lab."
  },
  publications: {
    title: "Academic Research Publications | GCI Lab",
    description: "Browse the peer-reviewed journals, articles, and high-impact conference papers produced by members of the GCI Lab."
  }
};

// ===============================
// MARQUEE INITIALIZER
// ===============================
function initMarquee() {
  const track = document.getElementById("marqueeTrack");
  const template = document.getElementById("partnerTemplate");
  if (!track || !template) return;

  const allPartners = [...partners, ...partners]; 
  track.innerHTML = "";
  allPartners.forEach((partner) => {
    const clone = template.content.cloneNode(true);
    clone.querySelector(".partner-logo").src = partner.logo;
    clone.querySelector(".partner-logo").alt = partner.name;
    clone.querySelector(".partner-name").textContent = partner.name;
    track.appendChild(clone);
  });
}

// ===============================
// LOAD MODULAR HTML COMPONENTS
// ===============================
async function loadComponents() {
  try {
    // 1. Load Navbar
    const navbarResponse = await fetch('components/navbar.html');
    const navbarContent = await navbarResponse.text();
    document.getElementById('navbar-container').innerHTML = navbarContent;

    // 2. Load Sub-Pages Dynamically
    const pages = ['home', 'about', 'research', 'team-publications'];
    let pagesHTML = '';
    
    for (const page of pages) {
      const response = await fetch(`pages/${page}.html`);
      const content = await response.text();
      pagesHTML += content;
    }
    document.getElementById('pages-container').innerHTML = pagesHTML;

    // 3. Load Footer
    const footerResponse = await fetch('components/footer.html');
    const footerContent = await footerResponse.text();
    document.getElementById('footer-container').innerHTML = footerContent;

    // 4. Run scripts after fragments reside in DOM
    initMarquee();
    
    if (typeof initPublications === 'function') {
      initPublications(); 
    }

    if (window.lucide) {
      lucide.createIcons();
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

  function navigateTo(pageId) {
    // Hide all pages completely
    pages.forEach((page) => {
      page.classList.remove("active");
    });

    // Handle separate IDs matching combined file structure view nodes
    const targetPage = document.getElementById("page-" + pageId);
    if (targetPage) {
      targetPage.classList.add("active");
    } else {
      const homePage = document.getElementById("page-home");
      if (homePage) homePage.classList.add("active");
    }

    // Dynamic SEO Updates
    if (PAGE_SEO[pageId]) {
      document.title = PAGE_SEO[pageId].title;
      const metaDesc = document.getElementById("meta-description");
      if (metaDesc) {
        metaDesc.setAttribute("content", PAGE_SEO[pageId].description);
      }
    }

    // Update Nav Links Styling
    navLinks.forEach((link) => {
      if (link.getAttribute("data-target") === pageId && link.classList.contains("px-4")) {
        link.classList.add("text-brand-600", "bg-brand-50");
        link.classList.remove("text-gray-600");
      } else if (link.classList.contains("px-4")) {
        link.classList.remove("text-brand-600", "bg-brand-50");
        link.classList.add("text-gray-600");
      }
    });

    window.scrollTo({ top: 0, behavior: "smooth" });

    const mobileMenu = document.getElementById("mobile-menu");
    if (mobileMenu) {
      mobileMenu.classList.add("hidden");
    }

    if (window.lucide) {
      lucide.createIcons();
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

  // Navbar Scroll Background Transition
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

  // Mobile Menu Drawer Toggle Trigger
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
