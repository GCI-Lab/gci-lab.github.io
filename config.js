// ===============================
// TAILWIND CONFIG
// ===============================
const TAILWIND_CONFIG = {
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
          950: "#052e16",
        },
      },
    },
  },
};

// ===============================
// APP CONSTANTS
// ===============================
const APP_CONFIG = {
  labName: "GCI Lab",
  labFullName: "Green Computing and Interdisciplinary Lab",
  university: "United International University",
  contact: {
    email: "contact@gcilab.uiu.ac.bd",
    address: "United City, Madani Avenue, Badda, Dhaka 1212",
    department: "Department of Computer Science and Engineering",
  },
  socialLinks: {
    orcid: "0000-0002-8030-3225",
  },
  siteDesignedBy: "Mohammad Abu Obaida Mullick",
  year: new Date().getFullYear(),
};

// ===============================
// NAVIGATION ITEMS
// ===============================
const NAVIGATION = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "research", label: "Research" },
  { id: "team", label: "Team" },
  { id: "publications", label: "Publications" },
];

// ===============================
// EXPORT FOR OTHER MODULES
// ===============================
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    TAILWIND_CONFIG,
    APP_CONFIG,
    NAVIGATION,
  };
}
