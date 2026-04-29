const btnEl = document.getElementById("btn");
const inputEl = document.getElementById("input");
const errorMessageEl = document.getElementById("errorMessage");
const galleryEl = document.getElementById("gallery");

async function fetchImage() {
  const inputValue = Number(inputEl.value);

  // reset UI
  errorMessageEl.innerText = "";
  galleryEl.innerHTML = "";

  // validation
  if (!inputValue || inputValue < 1 || inputValue > 10) {
    errorMessageEl.innerText = "Please enter a number between 1 and 10";
    return;
  }

  try {
    btnEl.disabled = true;
    btnEl.innerText = "Loading...";

    galleryEl.innerHTML = "<p>Loading images...</p>";

    const res = await fetch(
      `https://api.unsplash.com/photos?per_page=${inputValue}&page=${Math.floor(
        Math.random() * 1000
      )}&client_id=B8S3zB8gCPVCvzpAhCRdfXg_aki8PZM_q5pAyzDUvlc`
    );

    const data = await res.json();

    galleryEl.innerHTML = data
      .map(
        (pic) => `
        <img loading="lazy" src="${pic.urls.small}" alt="${pic.alt_description || "image"}" />
      `
      )
      .join("");

  } catch (error) {
    errorMessageEl.innerText = "Failed to load images. Try again.";
  } finally {
    btnEl.disabled = false;
    btnEl.innerText = "Get Photos";
  }
}

// click event
btnEl.addEventListener("click", fetchImage);

// enter key support
inputEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter") fetchImage();
});