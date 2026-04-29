const btnEl = document.getElementById("btn");
const inputEl = document.getElementById("input");
const errorMessageEl = document.getElementById("errorMessage");
const galleryEl = document.getElementById("gallery");
const clearBtn = document.getElementById("clearBtn");
const themeToggle = document.getElementById("themeToggle");
const loadMoreBtn = document.getElementById("loadMoreBtn");
const searchEl = document.getElementById("search");
const searchLabel = document.getElementById("searchLabel");
const tagButtons = document.querySelectorAll(".tag");

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
const badWords = [
  "fuck",
  "shit",
  "bitch",
  "ass",
  "bastard",
  "porn",
  "sex",
  "nude",
  "nsfw"
];

function containsBadWords(text) {
  const lower = text.toLowerCase();
  return badWords.some(word => lower.includes(word));
}

/* =========================
   SAFE SEARCH WRAPPER
========================= */
function safeSearch() {
  const query = searchEl.value.trim();

  if (containsBadWords(query)) {
    errorMessageEl.innerText = "⚠️ Inappropriate search term not allowed.";
    galleryEl.innerHTML = "";
    return;
  }

  fetchImage(true);
}

/* =========================
   TOP 5 HISTORY
========================= */
function renderHistory() {
  historyBox.innerHTML = "";

  const topHistory = history.slice(-5).reverse();

  topHistory.forEach((item) => {
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
themeToggle.onclick = () => {
  document.body.classList.toggle("dark");
  localStorage.setItem(
    "theme",
    document.body.classList.contains("dark") ? "dark" : "light"
  );
};

if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
}

/* =========================
   CLEAR GALLERY
========================= */
clearBtn.onclick = () => {
  galleryEl.innerHTML = "";
  page = 1;
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

  clearFavBtn.style.display = "none";

  const count = Number(inputEl.value);
  const query = searchEl.value.trim();

  errorMessageEl.innerText = "";

  if (!count || count < 1 || count > 10) {
    errorMessageEl.innerText = "Enter a number between 1 and 10";
    return;
  }

  if (containsBadWords(query)) {
    errorMessageEl.innerText = "⚠️ Inappropriate search term not allowed.";
    galleryEl.innerHTML = "";
    return;
  }

  if (reset) {
    galleryEl.innerHTML = "";
    page = 1;
  }

  try {
    loading = true;
    btnEl.disabled = true;
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
      history.push(query);

      if (history.length > 5) {
        history = history.slice(-5);
      }

      localStorage.setItem("history", JSON.stringify(history));
      renderHistory();
    }

    photos.forEach((pic) => {
      const card = document.createElement("div");
      card.className = "card";

      card.innerHTML = `
        <img src="${pic.urls.small}" />
        <div class="overlay">📸 ${pic.user.name}</div>
        <div class="fav">❤</div>
      `;

      const img = card.querySelector("img");
      const fav = card.querySelector(".fav");

      const isFav = favorites.some((f) => f.id === pic.id);

      if (isFav) {
        fav.style.background = "red";
        fav.style.color = "white";
      }

      img.onclick = () => {
        modal.style.display = "flex";
        modalImg.src = pic.urls.regular;
      };

      fav.onclick = () => {
        const exists = favorites.find((f) => f.id === pic.id);

        if (exists) {
          favorites = favorites.filter((f) => f.id !== pic.id);
        } else {
          favorites.push({
            id: pic.id,
            url: pic.urls.small,
            full: pic.urls.regular
          });
        }

        localStorage.setItem("favorites", JSON.stringify(favorites));

        const nowFav = favorites.some((f) => f.id === pic.id);

        fav.style.background = nowFav ? "red" : "white";
        fav.style.color = nowFav ? "white" : "black";
      };

      galleryEl.appendChild(card);
    });

    page++;
  } catch {
    errorMessageEl.innerText = "Failed to load images.";
  } finally {
    loading = false;
    btnEl.disabled = false;
    btnEl.innerText = "Get Photos";
  }
}

/* =========================
   FAVORITES VIEW
========================= */
favBtn.onclick = () => {
  galleryEl.innerHTML = "";
  errorMessageEl.innerText = "";

  clearFavBtn.style.display = "inline-block";

  if (favorites.length === 0) {
    const msg = document.createElement("div");
    msg.className = "empty-state";
    msg.innerHTML = "❤️ No favourite images yet.";
    galleryEl.appendChild(msg);
    return;
  }

  favorites.forEach((item) => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `<img src="${item.url}" />`;

    const img = card.querySelector("img");

    img.onclick = () => {
      modal.style.display = "flex";
      modalImg.src = item.full;
    };

    galleryEl.appendChild(card);
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
};

/* =========================
   BUTTONS
========================= */
btnEl.onclick = safeSearch;
loadMoreBtn.onclick = () => fetchImage(false);

/* =========================
   ENTER KEY
========================= */
inputEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter") safeSearch();
});

searchEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter") safeSearch();
});

/* =========================
   TAGS
========================= */
tagButtons.forEach((btn) => {
  btn.onclick = () => {
    const text = btn.innerText.replace(/[^a-zA-Z ]/g, "").trim();

    if (containsBadWords(text)) {
      errorMessageEl.innerText = "⚠️ Inappropriate search term not allowed.";
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