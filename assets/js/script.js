const btnEl = document.getElementById("btn");
const inputEl = document.getElementById("input");
const errorMessageEl = document.getElementById("errorMessage");
const galleryEl = document.getElementById("gallery");
const clearBtn = document.getElementById("clearBtn");
const themeToggle = document.getElementById("themeToggle");
const loadMoreBtn = document.getElementById("loadMoreBtn");
const searchEl = document.getElementById("search");
const tagButtons = document.querySelectorAll(".tag");
const banner = document.getElementById("searchLabel");

const favBtn = document.getElementById("favBtn");
const clearFavBtn = document.getElementById("clearFavBtn");
const historyBox = document.getElementById("historyBox");

const modal = document.getElementById("modal");
const modalImg = document.getElementById("modalImg");

let page = 1;
let loading = false;

let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
let history = JSON.parse(localStorage.getItem("history")) || [];

/* =========================
   BAD WORD FILTER
========================= */
const badWords = ["fuck","shit","bitch","ass","bastard","porn","sex","nude","nsfw"];

function containsBadWords(text) {
  return badWords.some(w => text.toLowerCase().includes(w));
}

/* =========================
   TOAST
========================= */
function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.innerText = msg;
  toast.classList.add("show");

  setTimeout(() => toast.classList.remove("show"), 2000);
}

/* =========================
   RATE LIMIT
========================= */
let lastSearchTime = 0;

function rateLimit() {
  const now = Date.now();
  if (now - lastSearchTime < 800) return false;
  lastSearchTime = now;
  return true;
}

/* =========================
   SAFE SEARCH
========================= */
function safeSearch() {
  const query = searchEl.value.trim();

  if (!rateLimit()) {
    showToast("Slow down 🙂");
    return;
  }

  if (containsBadWords(query)) {
    errorMessageEl.innerText = "⚠️ Inappropriate search blocked.";
    return;
  }

  fetchImage(true);
}

/* =========================
   HISTORY (TOP 5)
========================= */
function renderHistory() {
  historyBox.innerHTML = "";

  const top = history.slice(-5).reverse();

  top.forEach(item => {
    const btn = document.createElement("button");
    btn.className = "btn small";
    btn.innerText = item;

    btn.onclick = () => {
      searchEl.value = item;
      safeSearch();
    };

    historyBox.appendChild(btn);
  });
}

/* =========================
   THEME
========================= */
function setTheme(mode) {
  if (mode === "dark") {
    document.body.classList.add("dark");
    themeToggle.innerText = "☀️";
  } else {
    document.body.classList.remove("dark");
    themeToggle.innerText = "🌙";
  }
}

// Load saved theme
const savedTheme = localStorage.getItem("theme") || "light";
setTheme(savedTheme);

// Toggle theme
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
  galleryEl.innerHTML = "";
  page = 1;

  banner.innerText = "";
  banner.classList.remove("fav-mode");
};

/* =========================
   MODAL
========================= */
modal.onclick = () => (modal.style.display = "none");

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") modal.style.display = "none";
});

/* =========================
   FETCH IMAGES
========================= */
async function fetchImage(reset = true) {
  if (loading) return;

  // ✅ REMOVE BANNER WHEN RETURNING TO NORMAL MODE
  banner.innerText = "";
  banner.classList.remove("fav-mode");

  clearFavBtn.style.display = "none";

  const count = Number(inputEl.value);
  const query = searchEl.value.trim();

  if (containsBadWords(query)) return;

  if (reset) {
    galleryEl.innerHTML = "";
    page = 1;
  }

  loading = true;
  btnEl.innerText = "Loading...";

  const url = query
    ? `https://api.unsplash.com/search/photos?query=${query}&per_page=${count}&page=${page}&client_id=B8S3zB8gCPVCvzpAhCRdfXg_aki8PZM_q5pAyzDUvlc`
    : `https://api.unsplash.com/photos?per_page=${count}&page=${page}&client_id=B8S3zB8gCPVCvzpAhCRdfXg_aki8PZM_q5pAyzDUvlc`;

  const res = await fetch(url);
  const data = await res.json();
  const photos = query ? data.results : data;

  galleryEl.innerHTML = "";

  /* HISTORY (TOP 5 ONLY) */
if (query) {
  // remove existing duplicate first
  history = history.filter(item => item !== query);

  // add to top
  history.push(query);

  // keep only last 5 unique
  if (history.length > 5) {
    history = history.slice(-5);
  }

  localStorage.setItem("history", JSON.stringify(history));
  renderHistory();
}

  photos.forEach(pic => {
    const card = document.createElement("div");
    card.className = "card";

    const img = document.createElement("img");
    img.loading = "lazy";
    img.src = pic.urls.small;

    const fav = document.createElement("div");
    fav.className = "fav";

    if (favorites.some(f => f.id === pic.id)) {
      fav.classList.add("active");
    }

    img.onclick = () => {
      modal.style.display = "flex";
      modalImg.src = pic.urls.regular;
    };

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

    const overlay = document.createElement("div");
    overlay.className = "overlay";
    overlay.innerText = `📸 ${pic.user.name}`;

    card.appendChild(img);
    card.appendChild(overlay);
    card.appendChild(fav);

    galleryEl.appendChild(card);
  });

  page++;
  loading = false;
  btnEl.innerText = "Get Photos";
}

/* =========================
   FAVORITES
========================= */
favBtn.onclick = () => {
  galleryEl.innerHTML = "";
  clearFavBtn.style.display = "inline-block";

  // ✅ SHOW BANNER
  banner.innerText = "⭐ You are viewing your favourites";
  banner.classList.add("fav-mode");

  if (favorites.length === 0) {
    const msg = document.createElement("div");
    msg.className = "empty-state";
    msg.innerHTML = "❤️ No favourite images yet.";
    galleryEl.appendChild(msg);
    return;
  }

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
   BUTTONS
========================= */
btnEl.onclick = safeSearch;
loadMoreBtn.onclick = () => fetchImage(false);

/* =========================
   ENTER KEY
========================= */
searchEl.addEventListener("keydown", e => {
  if (e.key === "Enter") safeSearch();
});

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
   INIT
========================= */
renderHistory();
