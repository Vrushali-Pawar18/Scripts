const scriptUrl = new URL(document.currentScript.src);
const userId = scriptUrl.searchParams.get("userId");
const projectId = scriptUrl.searchParams.get("projectId");
const BASE_URL = "https://dev-calling-bot.setoo.ai";
// const BASE_URL = "https://calling-bot.setoo.ai";

// Add loader style
const styleLoader = document.createElement("style");
styleLoader.textContent = `
.loader {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid transparent;
  border-top-color: #ff5722; /* Spinner color */
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
`;
document.head.appendChild(styleLoader);

// Add reviews section style
const styleReviews = document.createElement("style");
styleReviews.textContent = `
.reviews-section {
  --background-color: #1a1a1a;
  --button-link-color: #ff5722;
  --review-card-color: #ff5722;
  --rating-color: #ffcc00; 
  --text-color: #ffffff;
  padding: 20px;
  font-family: Arial, sans-serif;
  background-color: var(--background-color);
  color: white;
  line-height: 1.6;
  color: var(--text-color);
}

.reviews-section h2 {
  margin-top: 30px;
  margin-bottom: 10px;
  font-size: 1.5rem;
}

.reviews-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.review-card {
  background: var(--review-card-color);
  padding: 15px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.stars {
  color: var(--rating-color);
}

.review-content {
  margin-bottom: 10px;
  color: var(--text-color);
}

.reviewer {
  font-weight: bold;
  color: var(--text-color);

}

.date {
  color: var(--text-color);
  font-size: 0.9rem;
}

.logo {
  max-width: 200px;
  display: block;
  object-fit: cover;
}
  .review-heading {
  --text-color: #ffffff;
  }
  
  .review-subHeading {
   --text-color: #ffffff;
  }

  .hidden {
  display : none;
  }
  .review-card-note{
  color : #E22518
  }
`;
document.head.appendChild(styleReviews);

// Create loader
const reviewsSection = document.querySelector(".reviews-section");

// Append heading and subheading immediately

const reviewHeading = document.createElement("h2");
reviewHeading.className = "review-heading hidden";
reviewHeading.textContent = "All Reviews";
reviewsSection.appendChild(reviewHeading);

const reviewSubHeading = document.createElement("p");
reviewSubHeading.className = "review-subHeading hidden";
reviewSubHeading.textContent =
  "(Rating and reviews are verified and are from people who use the service)";
reviewsSection.appendChild(reviewSubHeading);

// Create and append the reviews container immediately
const reviewsContainer = document.createElement("div");
reviewsContainer.id = "reviews-container";
reviewsContainer.className = "reviews-container";
reviewsSection.appendChild(reviewsContainer);

// Add loader
const loader = document.createElement("div");
loader.className = "loader";
loader.innerHTML = `<div class="spinner"></div>`;
reviewsSection.appendChild(loader);

// Fetch feedback from API
const fetchFeedback = async () => {
  try {
    const response = await fetch(
      `${BASE_URL}/api/v1/user-feedback/${userId}/${projectId}`
    );
    const data = await response.json();

    loader.remove();
    reviewHeading.classList.remove("hidden");
    reviewSubHeading.classList.remove("hidden");

    const isEmpty = (array) => Array.isArray(array) && array.length === 0;

    if (data && Array.isArray(data.feedback) && !isEmpty(data.feedback)) {
      renderFeedback(data.feedback);
    } else {
      reviewNotFound(reviewsContainer);
    }
  } catch (error) {
    loader.remove();
    console.error("Error fetching feedback:", error);
    reviewNotFound(reviewsContainer);
  }
};

// Render "No reviews found" if no data
const reviewNotFound = (reviewsContainer) => {
  const reviewCardOne = document.createElement("div");
  reviewCardOne.className = "review-card";
  reviewCardOne.innerHTML = `
    <div class="review-header">
        <span class="stars">${getStars(4)}</span>
        <span class="date">4 Dec 2024</span>
      </div>
      <div class="review-content">This is dummy content for now and will be updated once live reviews are available. Stay tuned for more accurate feedback from real users!</div>
      <div class="reviewer">John Doe</div>
  `;
  reviewsContainer.appendChild(reviewCardOne);
  const reviewCardTwo = document.createElement("div");
  reviewCardTwo.className = "review-card";
  reviewCardTwo.innerHTML = `
    <div class="review-header">
        <span class="stars">${getStars(3)}</span>
        <span class="date">4 Dec 2024</span>
      </div>
      <div class="review-content">This is dummy content for now and will be updated once live reviews are available. Stay tuned for more accurate feedback from real users!</div>
      <div class="reviewer"> Jenny Doe</div>
  `;
  reviewsContainer.appendChild(reviewCardTwo);
};

// Render feedback dynamically
const renderFeedback = (feedbackList) => {
  function formatDate(dateString) {
    const date = new Date(dateString);
  
    const day = date.getDate();
    const getOrdinalSuffix = (day) => {
      if (day >= 11 && day <= 13) return "th";
      switch (day % 10) {
        case 1:
          return "st";
        case 2:
          return "nd";
        case 3:
          return "rd";
        default:
          return "th";
      }
    };
  
    const dayWithSuffix = `${day}${getOrdinalSuffix(day)}`;
    const month = date.toLocaleString("default", { month: "short" });
    const year = date.getFullYear();
  
    return `${dayWithSuffix} ${month} ${year}`;
  }
  

  feedbackList.forEach((item) => {
    const reviewCard = document.createElement("div");
    reviewCard.className = "review-card";
    reviewCard.innerHTML = `
      <div class="review-header">
        <span class="stars">${getStars(item.rating)}</span>
       <span class="date">
        ${formatDate(item.createdAt)}
       </span>
      </div>
      <div class="review-content">${item.feedback}</div>
      <div class="reviewer">${item.name || "Anonymous"}</div>
    `;
    reviewsContainer.appendChild(reviewCard);
  });
};

// Convert numeric rating to stars
const getStars = (rating) => {
  if (isNaN(rating)) {
    return "☆☆☆☆☆"; // Return all empty stars if rating is NaN or invalid
  }

  const roundedRating = Math.round(rating * 2) / 2;
  const filledStars = "★".repeat(Math.floor(roundedRating));
  const halfStar = roundedRating % 1 !== 0 ? "★" : "";
  const emptyStars = "☆".repeat(5 - Math.ceil(roundedRating));
  return filledStars + halfStar + emptyStars;
};

// Fetch settings
const fetchSettings = () => {
  reviewsSection.appendChild(loader);
  fetch(`${BASE_URL}/api/v1/inline-embed-review/${userId}/${projectId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      const backgroundColor = data?.data?.backgroundColor || "#1a1a1a";
      const buttonLinkColor = data?.data?.buttonLinkColor || "#ff5722";
      const textColor = data?.data?.textColor || "#ffcc00";
      const ratingColor = data?.data?.ratingColor || "#ffcc00";
      const reviewCardColor = data?.data?.reviewCardColor || "#ff5722";
      const logoUrl = data?.data?.logo || "";

      const root = document.querySelector(".reviews-section");
      root.style.setProperty("--background-color", backgroundColor);
      root.style.setProperty("--button-link-color", buttonLinkColor);
      root.style.setProperty("--text-color", textColor);
      root.style.setProperty("--rating-color", ratingColor);
      root.style.setProperty("--review-card-color", reviewCardColor);

      if (logoUrl) {
        const logo = document.createElement("img");
        logo.src = logoUrl;
        logo.alt = "Logo";
        logo.classList.add("logo");
        reviewsSection.prepend(logo);
      }
      loader.remove();
    })
    .catch((error) => {
      console.error("Error fetching review settings:", error);
      if (data) {
        alert("error in applying custom styles!!");
      }
    });
};

// Start fetching data
fetchSettings();
fetchFeedback();
