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

const modal = document.getElementById("modal");
const modalImg = document.getElementById("modalImg");
const closeModal = document.getElementById("closeModal");

let page = 1;
let loading = false;

// load saved input
inputEl.value = localStorage.getItem("lastSearch") || 2;

// THEME PERSISTENCE
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
});

if(localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
}

// CLEAR GALLERY
clearBtn.addEventListener("click", () => {
  galleryEl.innerHTML = "";
  page = 1;
});

// MODAL
closeModal.onclick = () => modal.style.display = "none";
modal.onclick = () => modal.style.display = "none";

// FETCH IMAGES
async function fetchImage(reset=true) {
  if(loading) return;

  const inputValue = Number(inputEl.value);
  const query = searchEl.value.trim();
  
  errorMessageEl.innerText = "";

  if (!inputValue || inputValue < 1 || inputValue > 10) {
    errorMessageEl.innerText = "Please enter a number between 1 and 10";
    return;
  }

  if(reset) {
    galleryEl.innerHTML = "";
    page = 1;

    if(query) {
      searchLabel.innerText = `Showing results for: "${query}"`;
    } else {
      searchLabel.innerText = "Showing random photos";
    }
  }

  localStorage.setItem("lastSearch", inputValue);

  try {
    loading = true;
    btnEl.disabled = true;
    btnEl.innerText = "Loading...";

    const endpoint = query
      ? `https://api.unsplash.com/search/photos?query=${query}&per_page=${inputValue}&page=${page}&client_id=B8S3zB8gCPVCvzpAhCRdfXg_aki8PZM_q5pAyzDUvlc`
      : `https://api.unsplash.com/photos?per_page=${inputValue}&page=${page}&client_id=B8S3zB8gCPVCvzpAhCRdfXg_aki8PZM_q5pAyzDUvlc`;

    const res = await fetch(endpoint);

    const result = await res.json();
    const data = query ? result.results : result;

    if (!data || data.length === 0) {
      errorMessageEl.innerText = "No results found. Try a different keyword.";
      return;
    }

    data.forEach(pic => {
      const card = document.createElement("div");
      card.style.position = "relative";

      card.innerHTML = `
        <img src="${pic.urls.small}" alt="${pic.alt_description || "image"}" />
        <a href="${pic.links.download}" target="_blank" style="position:absolute;bottom:8px;right:8px;background:#0008;color:#fff;padding:4px 8px;border-radius:5px;font-size:12px;">Download</a>
        <div class="fav" style="position:absolute;top:8px;right:8px;background:#fff;border-radius:50%;padding:5px;cursor:pointer;">❤</div>
      `;

      const img = card.querySelector("img");
      const fav = card.querySelector(".fav");

      img.onclick = () => {
        modal.style.display = "flex";
        modalImg.src = pic.urls.regular;
      };

      fav.onclick = () => {
        fav.classList.toggle("active");
        fav.style.background = fav.classList.contains("active") ? "red" : "white";
        fav.style.color = fav.classList.contains("active") ? "white" : "black";
      };

      galleryEl.appendChild(card);
    });

    page++;

  } catch (error) {
    errorMessageEl.innerText = "Failed to load images. Try again.";
  } finally {
    loading = false;
    btnEl.disabled = false;
    btnEl.innerText = "Get Photos";
  }
}

btnEl.addEventListener("click", () => fetchImage(true));

// LOAD MORE BUTTON
loadMoreBtn.addEventListener("click", () => fetchImage(false));

inputEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter") fetchImage(true);
});

searchEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter") fetchImage(true);
});

// QUICK TAGS
tagButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    searchEl.value = btn.innerText.toLowerCase();
    fetchImage(true);
  });
});
