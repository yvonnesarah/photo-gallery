// =========================
// ELEMENT SELECTORS (DOM)
// =========================
const btnEl = document.getElementById("btn"); // Main search button
const inputEl = document.getElementById("input"); // Number of images input
const errorMessageEl = document.getElementById("errorMessage"); // Error message display
const galleryEl = document.getElementById("gallery"); // Image container
const clearBtn = document.getElementById("clearBtn"); // Clear gallery button
const themeToggle = document.getElementById("themeToggle"); // Dark/light toggle
const loadMoreBtn = document.getElementById("loadMoreBtn"); // Load more images
const searchEl = document.getElementById("search"); // Search input field
const tagButtons = document.querySelectorAll(".tag"); // Quick search tag buttons
const banner = document.getElementById("searchLabel"); // Banner text

const favBtn = document.getElementById("favBtn"); // Show favourites
const clearFavBtn = document.getElementById("clearFavBtn"); // Clear favourites
const historyBox = document.getElementById("historyBox"); // Search history container

const modal = document.getElementById("modal"); // Image modal popup
const modalImg = document.getElementById("modalImg"); // Image inside modal

// =========================
// GLOBAL STATE
// =========================
let page = 1; // Current API page
let loading = false; // Prevent duplicate requests

// Load saved data from localStorage
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
let history = JSON.parse(localStorage.getItem("history")) || [];

/* =========================
   BAD WORD FILTER
========================= */

// List of blocked words
const badWords = ["fuck","shit","bitch","ass","bastard","porn","sex","nude","nsfw"];

// Check if input contains inappropriate words
function containsBadWords(text) {
  return badWords.some(w => text.toLowerCase().includes(w));
}

/* =========================
   TOAST NOTIFICATIONS
========================= */

// Show temporary popup message
function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.innerText = msg;
  toast.classList.add("show");

  setTimeout(() => toast.classList.remove("show"), 2000);
}

/* =========================
   RATE LIMIT (ANTI-SPAM)
========================= */

let lastSearchTime = 0;

// Prevent rapid repeated searches
function rateLimit() {
  const now = Date.now();
  if (now - lastSearchTime < 800) return false;
  lastSearchTime = now;
  return true;
}

/* =========================
   SAFE SEARCH HANDLER
========================= */

function safeSearch() {
  const query = searchEl.value.trim();

  // Prevent spamming
  if (!rateLimit()) {
    showToast("Slow down 🙂");
    return;
  }

  // Block inappropriate searches
  if (containsBadWords(query)) {
    errorMessageEl.innerText = "⚠️ Inappropriate search blocked.";
    return;
  }

  // Fetch images if valid
  fetchImage(true);
}

/* =========================
   SEARCH HISTORY (TOP 5)
========================= */

// Render last 5 searches as buttons
function renderHistory() {
  historyBox.innerHTML = "";

  const top = history.slice(-5).reverse();

  top.forEach(item => {
    const btn = document.createElement("button");
    btn.className = "btn small";
    btn.innerText = item;

    // Clicking history re-runs search
    btn.onclick = () => {
      searchEl.value = item;
      safeSearch();
    };

    historyBox.appendChild(btn);
  });
}

/* =========================
   THEME TOGGLE (DARK/LIGHT)
========================= */

// Apply theme to page
function setTheme(mode) {
  if (mode === "dark") {
    document.body.classList.add("dark");
    themeToggle.innerText = "☀️";
  } else {
    document.body.classList.remove("dark");
    themeToggle.innerText = "🌙";
  }
}

// Load saved theme from storage
const savedTheme = localStorage.getItem("theme") || "light";
setTheme(savedTheme);

// Toggle theme on click
themeToggle.onclick = () => {
  const isDark = document.body.classList.contains("dark");
  const newTheme = isDark ? "light" : "dark";

  setTheme(newTheme);
  localStorage.setItem("theme", newTheme);

  showToast(`Switched to ${newTheme} mode`);
};

/* =========================
   CLEAR GALLERY
========================= */

clearBtn.onclick = () => {
  galleryEl.innerHTML = ""; // Remove images
  page = 1; // Reset pagination

  banner.innerText = "";
  banner.classList.remove("fav-mode");
};

/* =========================
   MODAL IMAGE VIEW
========================= */

// Close modal on click
modal.onclick = () => (modal.style.display = "none");

// Close modal with Escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") modal.style.display = "none";
});

/* =========================
   FETCH IMAGES FROM API
========================= */

async function fetchImage(reset = true) {
  if (loading) return; // Prevent duplicate requests

  // Reset UI from favourites mode
  banner.innerText = "";
  banner.classList.remove("fav-mode");
  clearFavBtn.style.display = "none";

  const count = Number(inputEl.value); // Number of images
  const query = searchEl.value.trim(); // Search term

  if (containsBadWords(query)) return;

  // Reset gallery if new search
  if (reset) {
    galleryEl.innerHTML = "";
    page = 1;
  }

  loading = true;
  btnEl.innerText = "Loading...";

  // Build API URL
  const url = query
    ? `https://api.unsplash.com/search/photos?query=${query}&per_page=${count}&page=${page}&client_id=B8S3zB8gCPVCvzpAhCRdfXg_aki8PZM_q5pAyzDUvlc`
    : `https://api.unsplash.com/photos?per_page=${count}&page=${page}&client_id=B8S3zB8gCPVCvzpAhCRdfXg_aki8PZM_q5pAyzDUvlc`;

  const res = await fetch(url);
  const data = await res.json();

  const photos = query ? data.results : data;

  galleryEl.innerHTML = "";

  /* =========================
     UPDATE SEARCH HISTORY
  ========================= */
  if (query) {
    // Remove duplicates
    history = history.filter(item => item !== query);

    // Add new search
    history.push(query);

    // Keep only last 5
    if (history.length > 5) {
      history = history.slice(-5);
    }

    localStorage.setItem("history", JSON.stringify(history));
    renderHistory();
  }

  // Create image cards
  photos.forEach(pic => {
    const card = document.createElement("div");
    card.className = "card";

    const img = document.createElement("img");
    img.loading = "lazy"; // Lazy loading for performance
    img.src = pic.urls.small;

    // Favourite button
    const fav = document.createElement("div");
    fav.className = "fav";

    // Mark active if already saved
    if (favorites.some(f => f.id === pic.id)) {
      fav.classList.add("active");
    }

    // Open modal on image click
    img.onclick = () => {
      modal.style.display = "flex";
      modalImg.src = pic.urls.regular;
    };

    // Toggle favourite
    fav.onclick = () => {
      const exists = favorites.find(f => f.id === pic.id);

      if (exists) {
        favorites = favorites.filter(f => f.id !== pic.id);
      } else {
        favorites.push({
          id: pic.id,
          url: pic.urls.small,
          full: pic.urls.regular
        });
      }

      localStorage.setItem("favorites", JSON.stringify(favorites));
      fav.classList.toggle("active");

      showToast("Favourites updated ❤️");
    };

    // Photographer name overlay
    const overlay = document.createElement("div");
    overlay.className = "overlay";
    overlay.innerText = `📸 ${pic.user.name}`;

    // Assemble card
    card.appendChild(img);
    card.appendChild(overlay);
    card.appendChild(fav);

    galleryEl.appendChild(card);
  });

  page++; // Next page
  loading = false;
  btnEl.innerText = "Get Photos";
}

/* =========================
   FAVORITES VIEW
========================= */

favBtn.onclick = () => {
  galleryEl.innerHTML = "";
  clearFavBtn.style.display = "inline-block";

  // Show banner
  banner.innerText = "⭐ You are viewing your favourites";
  banner.classList.add("fav-mode");

  // Empty state
  if (favorites.length === 0) {
    const msg = document.createElement("div");
    msg.className = "empty-state";
    msg.innerHTML = "❤️ No favourite images yet.";
    galleryEl.appendChild(msg);
    return;
  }

  // Render favourites
  favorites.forEach(item => {
    const img = document.createElement("img");
    img.src = item.url;

    img.onclick = () => {
      modal.style.display = "flex";
      modalImg.src = item.full;
    };

    galleryEl.appendChild(img);
  });
};

/* =========================
   CLEAR FAVORITES
========================= */

clearFavBtn.onclick = () => {
  favorites = [];
  localStorage.removeItem("favorites");

  galleryEl.innerHTML = "";

  const msg = document.createElement("div");
  msg.className = "empty-state";
  msg.innerHTML = "❤️ No favourite images yet.";
  galleryEl.appendChild(msg);

  showToast("Favourites cleared 🧹");
};

/* =========================
   BUTTON EVENTS
========================= */

btnEl.onclick = safeSearch; // Search button
loadMoreBtn.onclick = () => fetchImage(false); // Load more

/* =========================
   ENTER KEY SUPPORT
========================= */

searchEl.addEventListener("keydown", e => {
  if (e.key === "Enter") safeSearch();
});

/* =========================
   TAG BUTTONS (QUICK SEARCH)
========================= */

tagButtons.forEach(btn => {
  btn.onclick = () => {
    const text = btn.innerText.replace(/[^a-zA-Z ]/g, "").trim();

    if (containsBadWords(text)) {
      errorMessageEl.innerText = "⚠️ Inappropriate search blocked.";
      return;
    }

    searchEl.value = text;
    safeSearch();
  };
});

/* =========================
   INIT APP
========================= */

// Render saved history on load
renderHistory();