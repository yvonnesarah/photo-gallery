const btnEl = document.getElementById("btn");
const inputEl = document.getElementById("input");
const errorMessageEl = document.getElementById("errorMessage");
const galleryEl = document.getElementById("gallery");
const clearBtn = document.getElementById("clearBtn");
const themeToggle = document.getElementById("themeToggle");

const modal = document.getElementById("modal");
const modalImg = document.getElementById("modalImg");
const closeModal = document.getElementById("closeModal");

// load saved input
inputEl.value = localStorage.getItem("lastSearch") || 2;

// DARK MODE
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

// CLEAR GALLERY
clearBtn.addEventListener("click", () => {
  galleryEl.innerHTML = "";
});

// MODAL
closeModal.onclick = () => modal.style.display = "none";
modal.onclick = () => modal.style.display = "none";

// FETCH IMAGES
async function fetchImage() {
  const inputValue = Number(inputEl.value);

  errorMessageEl.innerText = "";
  galleryEl.innerHTML = "";

  if (!inputValue || inputValue < 1 || inputValue > 10) {
    errorMessageEl.innerText = "Please enter a number between 1 and 10";
    return;
  }

  localStorage.setItem("lastSearch", inputValue);

  // skeleton loading
  for (let i = 0; i < inputValue; i++) {
    const div = document.createElement("div");
    div.classList.add("skeleton");
    galleryEl.appendChild(div);
  }

  try {
    btnEl.disabled = true;
    btnEl.innerText = "Loading...";

    const res = await fetch(
      `https://api.unsplash.com/photos?per_page=${inputValue}&page=${Math.floor(
        Math.random() * 1000
      )}&client_id=B8S3zB8gCPVCvzpAhCRdfXg_aki8PZM_q5pAyzDUvlc`
    );

    const data = await res.json();

    galleryEl.innerHTML = data
      .map(
        (pic) => `
        <img src="${pic.urls.small}" alt="${pic.alt_description || "image"}" />
      `
      )
      .join("");

    // image modal click
    document.querySelectorAll(".gallery img").forEach(img => {
      img.addEventListener("click", () => {
        modal.style.display = "flex";
        modalImg.src = img.src;
      });
    });

  } catch (error) {
    errorMessageEl.innerText = "Failed to load images. Try again.";
  } finally {
    btnEl.disabled = false;
    btnEl.innerText = "Get Photos";
  }
}

btnEl.addEventListener("click", fetchImage);

inputEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter") fetchImage();
});