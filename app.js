// --- LOAD MODULAR HTML COMPONENTS ---
async function loadComponents() {
  try {
    // Load navbar
    const navbarResponse = await fetch('navbar.html');
    const navbarContent = await navbarResponse.text();
    document.getElementById('navbar-container').innerHTML = navbarContent;

    // Load pages
    const pages = ['home', 'about', 'research', 'team-publications'];
    let pagesHTML = '';
    
    for (const page of pages) {
      const response = await fetch(`${page}.html`);
      const content = await response.text();
      pagesHTML += content;
    }
    
    document.getElementById('pages-container').innerHTML = pagesHTML;

    // Load footer
    const footerResponse = await fetch('footer.html');
    const footerContent = await footerResponse.text();
    document.getElementById('footer-container').innerHTML = footerContent;

    // Re-initialize Lucide icons after loading
    lucide.createIcons();

    // Initialize SPA routing after components are loaded
    initializeRouting();
  } catch (error) {
    console.error('Error loading components:', error);
  }
}

// --- SPA ROUTING LOGIC ---
function initializeRouting() {
  const navLinks = document.querySelectorAll(".nav-link");
  const pages = document.querySelectorAll(".page-view");

  function navigateTo(pageId) {
    // Hide all pages
    pages.forEach((page) => {
      page.classList.remove("active");
    });

    // Show target page
    const targetPage = document.getElementById("page-" + pageId);
    if (targetPage) {
      targetPage.classList.add("active");
    } else {
      document.getElementById("page-home").classList.add("active"); // fallback
    }

    // Update Nav Links Styling
    navLinks.forEach((link) => {
      if (
        link.getAttribute("data-target") === pageId &&
        link.classList.contains("px-4")
      ) {
        link.classList.add("text-brand-600", "bg-brand-50");
        link.classList.remove("text-gray-600");
      } else if (link.classList.contains("px-4")) {
        link.classList.remove("text-brand-600", "bg-brand-50");
        link.classList.add("text-gray-600");
      }
    });

    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Close mobile menu if open
    const mobileMenu = document.getElementById("mobile-menu");
    if (mobileMenu) {
      mobileMenu.classList.add("hidden");
    }

    // Re-render icons if needed
    lucide.createIcons();
  }

  // Handle clicks on nav links
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      const target = link.getAttribute("data-target");
      if (target) {
        e.preventDefault(); // Prevent default anchor jump
        // Update URL Hash without jumping
        history.pushState(null, null, "#" + target);
        navigateTo(target);
      }
    });
  });

  // Handle initial load / refresh based on hash
  function handleHash() {
    const hash = window.location.hash.replace("#", "");
    if (hash) {
      navigateTo(hash);
    } else {
      navigateTo("home");
    }
  }
  window.addEventListener("popstate", handleHash);

  // --- Navbar Scroll Effect ---
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

  // --- Mobile Menu Toggle ---
  const mobileBtnMenu = document.getElementById("mobile-menu-btn");
  if (mobileBtnMenu) {
    mobileBtnMenu.addEventListener("click", () => {
      document.getElementById("mobile-menu").classList.toggle("hidden");
    });
  }

  // Initialize routing
  handleHash();
}

// Load components when DOM is ready
document.addEventListener("DOMContentLoaded", loadComponents);
