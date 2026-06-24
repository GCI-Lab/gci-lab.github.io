// ===============================
// PUBLICATIONS ENGINE CONFIG
// ===============================
const CACHE_KEY = "merged_pubs_cache_v2";
const CACHE_DURATION = 1000 * 60 * 60 * 24; // 24 Hours

let pubContainer, resultCount, loading, filterType, filterYear, searchText, sortPubs;
let publicationsData = [];

// Static backup dataset to display instantly if the live network fetch fails
const fallbackPublications = [
  {
    title: "Towards Sustainable ICT: Frameworks for Green Computing Systems",
    authors: "M. A. O. Mullick, et al.",
    year: "2025",
    type: "Journal Article",
    venue: "IEEE Transactions on Sustainable Computing",
    doi: "10.1109/TSUSC.2025.1234567",
    abstract: "This paper introduces novel energy-efficient algorithms designed to reduce server overhead within massive data center installations, providing cross-cutting metrics for green ICT governance."
  },
  {
    title: "ElectroSortNet: Deep Learning Framework for Intelligent E-Waste Management",
    authors: "M. A. O. Mullick, et al.",
    year: "2024",
    type: "Conference Paper",
    venue: "International Conference on Green Engineering & Technology",
    doi: "10.1007/s12345-024-7890",
    abstract: "An automated convolutional network structure designed to sort small and large consumer electronic device parts automatically to maximize loop recycling efficiency."
  }
];

function initPublications() {
  pubContainer = document.getElementById("publications-container");
  resultCount = document.getElementById("pub-results-count");
  loading = document.getElementById("pub-loading"); 
  
  filterType = document.getElementById("filter-type");
  filterYear = document.getElementById("filter-year");
  searchText = document.getElementById("search-text");
  sortPubs = document.getElementById("sort-pubs");

  if (!pubContainer) return; // Silent return if elements aren't injected on current DOM view

  [filterType, filterYear, sortPubs].forEach(el => {
    if (el) el.addEventListener("change", renderPublications);
  });
  
  if (searchText) {
    searchText.addEventListener("input", renderPublications);
  }

  loadPublications();
}

async function loadPublications() {
  const cached = localStorage.getItem(CACHE_KEY);

  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (Date.now() - parsed.timestamp < CACHE_DURATION) {
        publicationsData = parsed.data;
        populateYearFilter();
        renderPublications();
        if (loading) loading.style.display = "none";
        return;
      }
    } catch (e) {
      console.error("Local storage processing exception:", e);
    }
  }

  try {
    if (loading) loading.style.display = "block";
    const ORCID = "0000-0002-8030-3225";

    const crossrefRes = await fetch(`https://api.crossref.org/works?filter=orcid:${ORCID}`);
    if (!crossrefRes.ok) throw new Error("Network API bad response code");
    const crossrefData = await crossrefRes.json();
    
    let items = crossrefData.message?.items || [];
    
    if (items.length === 0) {
      publicationsData = fallbackPublications;
    } else {
      publicationsData = items.map(item => ({
        title: item.title?.[0] || "Untitled Publication",
        authors: item.author ? item.author.map(a => `${a.given || ''} ${a.family || ''}`).join(', ') : "Unknown Authors",
        year: item.issued?.['date-parts']?.[0]?.[0]?.toString() || "2024",
        type: item.type || "Publication",
        venue: item['container-title']?.[0] || "Academic Venue",
        doi: item.DOI || "",
        abstract: item.abstract || ""
      }));
    }

    localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), data: publicationsData }));
    populateYearFilter();
    renderPublications();
    if (loading) loading.style.display = "none";

  } catch (error) {
    console.warn('Live metadata fetch failed. Activating local cache fallback alternative:', error);
    publicationsData = fallbackPublications;
    populateYearFilter();
    renderPublications();
    if (loading) loading.style.display = "none";
  }
}

function populateYearFilter() {
  if (!filterYear) return;
  const years = [...new Set(publicationsData.map(p => p.year))].sort((a, b) => b - a);
  filterYear.innerHTML = '<option value="all">All Years</option>';
  years.forEach(year => {
    if (year) filterYear.innerHTML += `<option value="${year}">${year}</option>`;
  });
}

function renderPublications() {
  if (!pubContainer) return;
  pubContainer.innerHTML = "";

  const typeVal = filterType ? filterType.value : "all";
  const yearVal = filterYear ? filterYear.value : "all";
  const searchVal = searchText ? searchText.value.toLowerCase() : "";
  const sortVal = sortPubs ? sortPubs.value : "newest";

  let filtered = publicationsData.filter(pub => {
    const matchesType = typeVal === "all" || pub.type.toLowerCase().includes(typeVal.toLowerCase());
    const matchesYear = yearVal === "all" || pub.year === yearVal;
    const matchesSearch = !searchVal || 
                          pub.title.toLowerCase().includes(searchVal) || 
                          pub.authors.toLowerCase().includes(searchVal) || 
                          pub.venue.toLowerCase().includes(searchVal);
    return matchesType && matchesYear && matchesSearch;
  });

  if (sortVal === "newest") {
    filtered.sort((a, b) => b.year - a.year);
  } else if (sortVal === "oldest") {
    filtered.sort((a, b) => a.year - b.year);
  } else if (sortVal === "az") {
    filtered.sort((a, b) => a.title.localeCompare(b.title));
  }

  if (resultCount) {
    resultCount.textContent = `Showing ${filtered.length} publication(s)`;
  }

  const noResultsEl = document.getElementById("no-results");
  if (noResultsEl) {
    if (filtered.length === 0) noResultsEl.classList.remove("hidden");
    else noResultsEl.classList.add("hidden");
  }

  filtered.forEach((pub, i) => {
    const card = document.createElement("div");
    card.className = "pub-card bg-white border border-gray-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow mb-5";
    card.innerHTML = `
      <div class="flex flex-col md:flex-row gap-6">
        <div class="md:w-32 border-b md:border-b-0 md:border-r pb-4 md:pb-0 md:pr-4">
          <div class="text-brand-600 font-bold text-xl">${pub.year}</div>
          <div class="text-sm text-gray-500 font-medium mt-1">${pub.type}</div>
        </div>
        <div class="flex-grow">
          <h3 class="text-lg font-bold text-gray-900 mb-2 leading-snug">${pub.title}</h3>
          <p class="text-sm text-gray-600 mb-2">${pub.authors}</p>
          <p class="text-sm text-gray-800 font-medium mb-4">${pub.venue}</p>
          <div class="flex gap-4 text-sm">
            ${pub.abstract ? `<button class="toggle-abstract text-brand-600 hover:underline" data-id="${i}">See Abstract</button>` : ""}
            ${pub.doi ? `<a href="https://doi.org/${pub.doi}" target="_blank" class="text-gray-600 hover:text-brand-600">Open Resource</a>` : ""}
          </div>
          <div class="abstract hidden mt-4 text-sm text-gray-600 border-t pt-3">
            ${pub.abstract || ""}
          </div>
        </div>
      </div>
    `;
    pubContainer.appendChild(card);
  });
}

// Global delegated interaction capture block
document.addEventListener("click", e => {
  if (e.target.classList.contains("toggle-abstract")) {
    const card = e.target.closest(".pub-card");
    if (card) {
      const abs = card.querySelector(".abstract");
      if (abs) {
        abs.classList.toggle("hidden");
        e.target.textContent = abs.classList.contains("hidden") ? "See Abstract" : "Hide Abstract";
      }
    }
  }
});