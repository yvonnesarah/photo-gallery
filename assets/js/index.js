// Get references to DOM elements for the button, error message, and gallery
const btnEl = document.getElementById("btn");
const errorMessageEl = document.getElementById("errorMessage");
const galleryEl = document.getElementById("gallery");

// Async function to fetch images from Unsplash API
async function fetchImage() {
  // Get the value from the input field
  const inputValue = document.getElementById("input").value;

  // Validate if the input value is within the acceptable range (1 to 10)
  if (inputValue > 10 || inputValue < 1) {
    // Show error message if input is out of range
    errorMessageEl.style.display = "block";
    errorMessageEl.innerText = "Number should be between 0 and 11";
    return; // Exit the function early if there's an error
  }

  // Initialize a variable to store the images
  imgs = "";

  try {
    // Hide the button while images are being fetched
    btnEl.style.display = "none";

    // Show a loading spinner in the gallery while waiting for the API response
    const loading = `<img src="spinner.svg" />`;
    galleryEl.innerHTML = loading;

    // Fetch images from the Unsplash API
    await fetch(
      `https://api.unsplash.com/photos?per_page=${inputValue}&page=${Math.round(
        Math.random() * 1000
      )}&client_id=B8S3zB8gCPVCvzpAhCRdfXg_aki8PZM_q5pAyzDUvlc`
    )
      .then((res) =>
        // Convert the response to JSON and process the image data
        res.json().then((data) => {
          if (data) {
            // Loop through each image and append it to the `imgs` variable
            data.forEach((pic) => {
              imgs += `
            <img src=${pic.urls.small} alt="image"/>
            `;
            });

            // Once the images are fetched, display them in the gallery
            galleryEl.style.display = "block";
            galleryEl.innerHTML = imgs;

            // Show the button again after images are loaded
            btnEl.style.display = "block";

            // Hide the error message if everything is successful
            errorMessageEl.style.display = "none";
          }
        })
      );
  } catch (error) {
    // Handle errors that might occur during the fetch operation
    console.log(error);

    // Show an error message if the fetch fails
    errorMessageEl.style.display = "block";
    errorMessageEl.innerHTML = "An error happened, try again later";

    // Show the button again after an error
    btnEl.style.display = "block";

    // Hide the gallery in case of an error
    galleryEl.style.display = "none";
  }
}

// Add an event listener to the button to trigger the fetchImage function on click
btnEl.addEventListener("click", fetchImage);
