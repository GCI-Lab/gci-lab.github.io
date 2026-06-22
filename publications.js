// ===============================
// PUBLICATIONS CONFIG
// ===============================
const CACHE_KEY = "merged_pubs_cache_v2";
const CACHE_DURATION = 1000 * 60 * 60 * 24; // 24h

// ===============================
// DOM ELEMENTS
// ===============================
const pubContainer = document.getElementById("publications-container");
const resultCount = document.getElementById("pub-results-count");
const loading = document.getElementById("pub-loading");

const filterType = document.getElementById("filter-type");
const filterYear = document.getElementById("filter-year");
const searchText = document.getElementById("search-text");
const sortPubs = document.getElementById("sort-pubs");

let publicationsData = [];

// ===============================
// FETCH DATA
// ===============================
async function loadPublications() {
  const cached = localStorage.getItem(CACHE_KEY);

  if (cached) {
    const parsed = JSON.parse(cached);
    if (Date.now() - parsed.timestamp < CACHE_DURATION) {
      publicationsData = parsed.data;
      populateYearFilter();
      renderPublications();
      loading.style.display = "none";
      return;
    }
  }

  try {
    const ORCID = "0000-0002-8030-3225";

    // Crossref
    const crossrefRes = await fetch(
      `https://api.crossref.org/works?filter=orcid:${ORCID}&rows=100`,
      { headers: { "User-Agent": "GCI-Lab (mailto:contact@gcilab.uiu.ac.bd)" } }
    );
    const crossrefData = await crossrefRes.json();

    const crossrefPubs = crossrefData.message.items.map(item => {
      const year =
        item["published-print"]?.["date-parts"]?.[0]?.[0] ||
        item["published-online"]?.["date-parts"]?.[0]?.[0] ||
        "N/A";

      return {
        title: item.title?.[0] || "",
        authors: item.author?.map(a => `${a.given || ""} ${a.family || ""}`).join(", "),
        venue: item["container-title"]?.[0] || item.publisher || "",
        year,
        type: item.type === "proceedings-article" ? "Conference" : "Journal",
        doi: item.DOI || "",
        abstract: null
      };
    });

    // Semantic Scholar (only once)
    const semanticRes = await fetch(
      `https://api.semanticscholar.org/graph/v1/author/ORCID:${ORCID}/papers?limit=100&fields=title,abstract,year,venue,authors,externalIds`
    );
    const semanticData = await semanticRes.json();

    const semanticPubs = semanticData.data.map(p => ({
      title: p.title || "",
      authors: p.authors?.map(a => a.name).join(", "),
      venue: p.venue || "",
      year: p.year || "N/A",
      type: "Journal",
      doi: p.externalIds?.DOI || "",
      abstract: p.abstract || null
    }));

    // ===============================
    // MERGE + DEDUP
    // ===============================
    const map = new Map();

    function normalizeTitle(t) {
      return t.toLowerCase().replace(/\s+/g, " ").trim();
    }

    [...crossrefPubs, ...semanticPubs].forEach(pub => {
      const key = pub.doi || normalizeTitle(pub.title);

      if (!map.has(key)) {
        map.set(key, pub);
      } else {
        // merge abstract if missing
        const existing = map.get(key);
        if (!existing.abstract && pub.abstract) {
          existing.abstract = pub.abstract;
        }
      }
    });

    publicationsData = Array.from(map.values());

    // SAVE CACHE
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ timestamp: Date.now(), data: publicationsData })
    );

    populateYearFilter();
    renderPublications();
    loading.style.display = "none";

  } catch (err) {
    console.error(err);
    loading.textContent = "Failed to load publications.";
  }
}

// ===============================
// YEAR FILTER
// ===============================
function populateYearFilter() {
  filterYear.innerHTML = `<option value="All">All Years</option>`;

  const years = [...new Set(publicationsData.map(p => p.year))]
    .filter(y => y !== "N/A")
    .sort((a, b) => b - a);

  years.forEach(year => {
    const opt = document.createElement("option");
    opt.value = year;
    opt.textContent = year;
    filterYear.appendChild(opt);
  });
}

// ===============================
// RENDER
// ===============================
function renderPublications() {
  let filtered = [...publicationsData];

  // FILTER
  if (filterType.value !== "All") {
    filtered = filtered.filter(p => p.type === filterType.value);
  }

  if (filterYear.value !== "All") {
    filtered = filtered.filter(p => p.year.toString() === filterYear.value);
  }

  if (searchText.value.trim()) {
    const q = searchText.value.toLowerCase();
    filtered = filtered.filter(p =>
      p.title.toLowerCase().includes(q) ||
      (p.authors || "").toLowerCase().includes(q)
    );
  }

  // SORT
  if (sortPubs.value === "newest") {
    filtered.sort((a, b) => b.year - a.year);
  } else if (sortPubs.value === "oldest") {
    filtered.sort((a, b) => a.year - b.year);
  } else if (sortPubs.value === "az") {
    filtered.sort((a, b) => a.title.localeCompare(b.title));
  }

  // UI
  pubContainer.innerHTML = "";
  resultCount.textContent = `Showing ${filtered.length} publication${filtered.length !== 1 ? "s" : ""}`;

  filtered.forEach((pub, i) => {
    const card = document.createElement("div");
    card.className = "pub-card bg-white p-6 rounded-xl border border-gray-200";

    card.innerHTML = `
      <div class="flex flex-col md:flex-row gap-6">
        <div class="md:w-32 border-b md:border-b-0 md:border-r pb-4 md:pb-0 md:pr-4">
          <div class="text-brand-600 font-bold text-xl">${pub.year}</div>
          <div class="text-sm text-gray-500">${pub.type}</div>
        </div>

        <div class="flex-grow">
          <h3 class="text-lg font-bold text-gray-900 mb-1">${pub.title}</h3>
          <p class="text-sm text-gray-600 mb-2">${pub.authors || ""}</p>
          <p class="text-sm text-gray-700 mb-3">${pub.venue}</p>

          <div class="flex gap-4 text-sm">
            ${pub.abstract ? `<button class="toggle-abstract text-brand-600 hover:underline" data-id="${i}">See Abstract</button>` : ""}
            ${pub.doi ? `<a href="https://doi.org/${pub.doi}" target="_blank" class="text-gray-600 hover:text-brand-600">Open</a>` : ""}
          </div>

          <div class="abstract hidden mt-4 text-sm text-gray-600 border-t pt-3">
            ${pub.abstract || ""}
          </div>
        </div>
      </div>
    `;

    pubContainer.appendChild(card);
  });

  lucide.createIcons();
}

// ===============================
// INTERACTIONS
// ===============================
pubContainer.addEventListener("click", e => {
  if (e.target.classList.contains("toggle-abstract")) {
    const card = e.target.closest(".pub-card");
    const abs = card.querySelector(".abstract");

    abs.classList.toggle("hidden");
    e.target.textContent = abs.classList.contains("hidden")
      ? "See Abstract"
      : "Hide Abstract";
  }
});

// ===============================
// EVENT LISTENERS
// ===============================
[filterType, filterYear, sortPubs].forEach(el =>
  el.addEventListener("change", renderPublications)
);

searchText.addEventListener("input", renderPublications);

// ===============================
// INITIALIZE
// ===============================
document.addEventListener("DOMContentLoaded", loadPublications);
