// ===============================
// PUBLICATIONS CONFIG
// ===============================
const CACHE_KEY = "merged_pubs_cache_v2";
const CACHE_DURATION = 1000 * 60 * 60 * 24; // 24-hour cache validation

// ===============================
// DOM ELEMENTS
// ===============================
let pubContainer, resultCount, loading, filterType, filterYear, searchText, sortPubs;
let publicationsData = [];

// ===============================
// INITIALIZE FUNCTION
// ===============================
// Called from app.js after the component HTML is injected into the DOM
function initPublications() {
  pubContainer = document.getElementById("publications-container");
  resultCount = document.getElementById("pub-results-count");
  loading = document.getElementById("pub-loading"); 
  
  filterType = document.getElementById("filter-type");
  filterYear = document.getElementById("filter-year");
  searchText = document.getElementById("search-text");
  sortPubs = document.getElementById("sort-pubs");

  // Prevent script execution crash if container element isn't present in current view
  if (!pubContainer) return;

  // Attach Event Listeners to filtering and sorting dropdowns
  [filterType, filterYear, sortPubs].forEach(el => {
    if (el) el.addEventListener("change", renderPublications);
  });
  
  // Attach input listener for the text search bar
  if (searchText) {
    searchText.addEventListener("input", renderPublications);
  }

  // Event Delegation for handling abstract visibility toggles
  pubContainer.addEventListener("click", e => {
    if (e.target.classList.contains("toggle-abstract")) {
      const card = e.target.closest(".pub-card");
      const abs = card.querySelector(".abstract");

      if (abs) {
        abs.classList.toggle("hidden");
        e.target.textContent = abs.classList.contains("hidden")
          ? "See Abstract"
          : "Hide Abstract";
      }
    }
  });

  // Handle "Reset Filters" action button
  const resetBtn = document.getElementById("reset-filters");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      if (filterType) filterType.value = "All";
      if (filterYear) filterYear.value = "All";
      if (searchText) searchText.value = "";
      if (sortPubs) sortPubs.value = "newest";
      renderPublications();
    });
  }

  // Dispatch data processing
  loadPublications();
}

// ===============================
// FETCH & PROCESS DATA
// ===============================
async function loadPublications() {
  const cached = localStorage.getItem(CACHE_KEY);

  // Check if valid client cache exists to save network bandwidth
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
    } catch (cacheErr) {
      console.warn("Cache parsing failed, refetching...", cacheErr);
    }
  }

  try {
    const ORCID = "0000-0002-8030-3225";

    // 1. Concurrent fetching from Crossref & Semantic Scholar APIs
    const [crossrefRes, semanticRes] = await Promise.all([
      fetch(`https://api.crossref.org/works?filter=orcid:${ORCID}&rows=100`, {
        headers: { "User-Agent": "GCI-Lab (mailto:contact@gcilab.uiu.ac.bd)" }
      }),
      fetch(`https://api.semanticscholar.org/graph/v1/author/ORCID:${ORCID}/papers?limit=100&fields=title,abstract,year,venue,authors,externalIds`)
    ]);

    if (!crossrefRes.ok || !semanticRes.ok) {
      throw new Error("One or more API endpoints returned an error status.");
    }

    const crossrefData = await crossrefRes.json();
    const semanticData = await semanticRes.json();

    // 2. Map Crossref Schema to local runtime format
    const crossrefPubs = (crossrefData.message?.items || []).map(item => {
      const year =
        item["published-print"]?.["date-parts"]?.[0]?.[0] ||
        item["published-online"]?.["date-parts"]?.[0]?.[0] ||
        "N/A";

      return {
        title: item.title?.[0] || "Untitled Document",
        authors: item.author?.map(a => `${a.given || ""} ${a.family || ""}`.trim()).join(", ") || "",
        venue: item["container-title"]?.[0] || item.publisher || "Unknown Venue",
        year: year !== "N/A" ? parseInt(year, 10) : "N/A",
        type: item.type === "proceedings-article" ? "Conference" : "Journal",
        doi: item.DOI || "",
        abstract: null
      };
    });

    // 3. Map Semantic Scholar Schema to local runtime format
    const semanticPubs = (semanticData.data || []).map(p => ({
      title: p.title || "Untitled Document",
      authors: p.authors?.map(a => a.name).join(", ") || "",
      venue: p.venue || "Unknown Venue",
      year: p.year !== null && p.year !== undefined ? parseInt(p.year, 10) : "N/A",
      type: "Journal", // Standard structural fallback context
      doi: p.externalIds?.DOI || "",
      abstract: p.abstract || null
    }));

    // 4. Merge Data Sets & Deduplicate matching titles/DOIs
    const deduplicationMap = new Map();

    function normalizeTitle(titleString) {
      return titleString.toLowerCase().replace(/\s+/g, " ").trim();
    }

    [...crossrefPubs, ...semanticPubs].forEach(pub => {
      const uniqueKey = pub.doi ? pub.doi.toLowerCase().trim() : normalizeTitle(pub.title);

      if (!deduplicationMap.has(uniqueKey)) {
        deduplicationMap.set(uniqueKey, pub);
      } else {
        // Enriched merge context: Fill missing abstract descriptions if secondary dataset provides it
        const existingRecord = deduplicationMap.get(uniqueKey);
        if (!existingRecord.abstract && pub.abstract) {
          existingRecord.abstract = pub.abstract;
        }
      }
    });

    publicationsData = Array.from(deduplicationMap.values());

    // Commit cleanly mapped collection to persistent storage cache
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ timestamp: Date.now(), data: publicationsData })
    );

    populateYearFilter();
    renderPublications();
    if (loading) loading.style.display = "none";

  } catch (err) {
    console.error("Critical Publication Engine Error: ", err);
    if (loading) {
      loading.textContent = "Failed to load publications. Please reload or try again later.";
    }
  }
}

// ===============================
// YEAR FILTER POPULATION
// ===============================
function populateYearFilter() {
  if (!filterYear) return;
  filterYear.innerHTML = `<option value="All">All Years</option>`;

  // Create isolated, uniquely ordered, numeric array of structural listing values
  const years = [...new Set(publicationsData.map(p => p.year))]
    .filter(y => y !== "N/A" && !isNaN(y))
    .sort((a, b) => b - a);

  years.forEach(year => {
    const opt = document.createElement("option");
    opt.value = year;
    opt.textContent = year;
    filterYear.appendChild(opt);
  });
}

// ===============================
// RENDER DOM & SCHEMA INJECTION
// ===============================
function renderPublications() {
  if (!pubContainer) return;

  let filtered = [...publicationsData];

  // 1. FILTER ENGINE EVALUATION
  if (filterType && filterType.value !== "All") {
    filtered = filtered.filter(p => p.type === filterType.value);
  }

  if (filterYear && filterYear.value !== "All") {
    filtered = filtered.filter(p => p.year.toString() === filterYear.value);
  }

  if (searchText && searchText.value.trim()) {
    const query = searchText.value.toLowerCase();
    filtered = filtered.filter(p =>
      p.title.toLowerCase().includes(query) ||
      p.authors.toLowerCase().includes(query) ||
      p.venue.toLowerCase().includes(query)
    );
  }

  // 2. ROBUST SORT ENGINE EVALUATION
  if (sortPubs) {
    if (sortPubs.value === "newest") {
      filtered.sort((a, b) => {
        const valA = a.year === "N/A" ? 0 : a.year;
        const valB = b.year === "N/A" ? 0 : b.year;
        return valB - valA;
      });
    } else if (sortPubs.value === "oldest") {
      filtered.sort((a, b) => {
        const valA = a.year === "N/A" ? Infinity : a.year;
        const valB = b.year === "N/A" ? Infinity : b.year;
        return valA - valB;
      });
    } else if (sortPubs.value === "az") {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    }
  }

  // 3. UI RESET & COUNT INJECTIONS
  pubContainer.innerHTML = "";
  
  if (resultCount) {
    resultCount.textContent = `Showing ${filtered.length} publication${filtered.length !== 1 ? "s" : ""}`;
  }

  const noResultsElement = document.getElementById("no-results");
  if (filtered.length === 0) {
    if (noResultsElement) noResultsElement.classList.remove("hidden");
    // Clear out script context markup blocks if matching set is empty
    const runtimeSchema = document.getElementById("publications-schema");
    if (runtimeSchema) runtimeSchema.remove();
    return;
  } else {
    if (noResultsElement) noResultsElement.classList.add("hidden");
  }

  // --- STRUCTURED SEO DATA SETUP (JSON-LD) ---
  const structuredSchemaArray = [];

  // 4. RENDER ELEMENT CARDS LOOP
  filtered.forEach((pub, index) => {
    const card = document.createElement("div");
    card.className = "pub-card bg-white p-6 rounded-xl border border-gray-200 hover:border-brand-300 transition-colors shadow-sm";

    card.innerHTML = `
      <div class="flex flex-col md:flex-row gap-6">
        <div class="md:w-32 border-b md:border-b-0 md:border-r pb-4 md:pb-0 md:pr-4 flex-shrink-0">
          <div class="text-brand-600 font-bold text-xl">${pub.year}</div>
          <div class="text-sm text-gray-500 font-medium mt-1">${pub.type}</div>
        </div>

        <div class="flex-grow">
          <h3 class="text-lg font-bold text-gray-900 mb-2 leading-snug">${pub.title}</h3>
          <p class="text-sm text-gray-600 mb-2 font-normal">${pub.authors}</p>
          <p class="text-sm text-gray-800 font-medium mb-4 italic">${pub.venue}</p>

          <div class="flex gap-5 text-sm">
            ${pub.abstract ? `<button type="button" class="toggle-abstract text-brand-600 font-medium hover:text-brand-800 transition-colors" data-id="${index}">See Abstract</button>` : ""}
            ${pub.doi ? `<a href="https://doi.org/${pub.doi}" target="_blank" rel="noopener noreferrer" class="text-gray-600 font-medium hover:text-brand-600 transition-colors inline-flex items-center gap-1">Open Resource <i data-lucide="external-link" class="w-3 h-3"></i></a>` : ""}
          </div>

          <div class="abstract hidden mt-4 text-sm text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-100 leading-relaxed max-w-none">
            ${pub.abstract || ""}
          </div>
        </div>
      </div>
    `;

    pubContainer.appendChild(card);

    // Build the target structure compliant with JSON-LD ScholarlyArticle guidelines
    const articleSchema = {
      "@context": "https://schema.org",
      "@type": "ScholarlyArticle",
      "headline": pub.title,
      "datePublished": pub.year !== "N/A" ? pub.year.toString() : undefined,
      "isPartOf": {
        "@type": "Periodical",
        "name": pub.venue
      }
    };

    if (pub.authors) {
      articleSchema.author = pub.authors.split(",").map(authorName => ({
        "@type": "Person",
        "name": authorName.trim()
      }));
    }

    if (pub.doi) {
      articleSchema.url = `https://doi.org/${pub.doi}`;
      articleSchema.identifier = pub.doi;
    }

    structuredSchemaArray.push(articleSchema);
  });

  // 5. INJECT GENERATED SCHEMA METADATA INTO PAGE HEAD
  let schemaScriptElement = document.getElementById("publications-schema");
  if (!schemaScriptElement) {
    schemaScriptElement = document.createElement("script");
    schemaScriptElement.id = "publications-schema";
    schemaScriptElement.type = "application/ld+json";
    document.head.appendChild(schemaScriptElement);
  }
  schemaScriptElement.text = JSON.stringify(structuredSchemaArray);

  // 6. ASYNC ICON RE-INITIALIZATION
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}
