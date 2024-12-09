
const styleFeedback = document.createElement("style");
styleFeedback.textContent = `
.feedback-form-container {
  --background-color: #1a1a1a;
  --button-color: #ff5722;
  --text-color: white;

  background: var(--background-color);
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  width: 400px;
  font-family: Arial, sans-serif;
  color: var(--text-color);
  position: relative;
  z-index: 1;
}

.feedback-form-container label {
  display: block;
  margin: 10px 0 5px;
}

.feedback-form-container input[type="text"],
.feedback-form-container input[type="email"],
.feedback-form-container input[type="tel"] {
  width: -webkit-fill-available;
  padding: 10px;
  margin-bottom: 20px;
  border: none;
  border-radius: 5px;
  font-size: 14px;
  color: #000;
}

.feedback-form-container input:focus {
  outline: 2px solid var(--button-color);
}

.feedback-form-container button {
  width: 100%;
  padding: 10px;
  background-color: var(--button-color);
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
}

.feedback-form-container button:hover {
  background-color: #e64a19;
}

.submit-btm {
  margin-top: 40px;
}

/* Loader styles */
.loader-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 400px;
  background: black;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2;
}

.loader {
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid var(--button-color);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.hidden {
  display: none;
}
.iti { width: 100%; }
.loader-inline {
border: 2px solid rgba(255, 255, 255, 0.3);
border-top: 2px solid var(--button-color);
border-radius: 50%;
width: 12px;
height: 12px;
display: inline-block;
margin-right: 10px;
vertical-align: middle;
animation: spin 1s linear infinite;
}

`;

const scriptUrl = new URL(document.currentScript.src);
const userId = scriptUrl.searchParams.get("userId");
const projectId = scriptUrl.searchParams.get("projectId");
const BASE_URL = "https://dev-calling-bot.setoo.ai";
// const BASE_URL = "https://calling-bot.setoo.ai";

document.head.appendChild(styleFeedback);

const loadCSS = (href) => {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  document.head.appendChild(link);
};

const loadScript = (src, onLoad) => {
  const script = document.createElement("script");
  script.src = src;
  script.onload = onLoad;
  document.body.appendChild(script);
};

// Load intl-tel-input CSS and JS dynamically
loadCSS(
  "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.19/css/intlTelInput.css"
);
loadScript(
  "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.19/js/intlTelInput.min.js",
  () => {
    loadScript(
      "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.19/js/utils.js",
      () => {
        initForm();
      }
    );
  }
);

// Function to initialize the contact form
function initForm() {
  const container = document.querySelector(".feedback-form-container");
if(container) {
// Dynamically create form fields
const form = document.createElement("form");
const loader = document.createElement("div");
loader.setAttribute("class", "loader");
const loaderOverlay = document.createElement("div");
loaderOverlay.setAttribute("class", "loader-overlay");
container.append(loaderOverlay);
loaderOverlay.append(loader);

form.id = "feedback-form";

const fields = [
 {
   type: "text",
   id: "name",
   name: "name",
   label: "Full Name",
   placeholder: "Enter your full name",
 },
 {
   type: "email",
   id: "email",
   name: "email",
   label: "Email Address",
   placeholder: "Enter your email address",
 },
 {
   type: "tel",
   id: "phone",
   name: "phone",
   label: "Phone Number",
   placeholder: "Enter your phone number",
 },
];

fields.forEach((field) => {
 const label = document.createElement("label");
 label.setAttribute("for", field.id);
 label.textContent = field.label;

 const input = document.createElement("input");
 input.setAttribute("type", field.type);
 input.setAttribute("id", field.id);
 input.setAttribute("name", field.name);
 input.setAttribute("placeholder", field.placeholder);
 input.required = true;

 form.appendChild(label);
 form.appendChild(input);
});

const submitButton = document.createElement("button");
submitButton.setAttribute("type", "submit");
submitButton.classList.add("submit-btm");
submitButton.textContent = "Submit";
form.appendChild(submitButton);

container.appendChild(form);

const phoneInput = document.querySelector("#phone");
const iti = window.intlTelInput(phoneInput, {
 initialCountry: "auto",
 separateDialCode: true,
 geoIpLookup: (callback) => {
   fetch("https://ipinfo.io?token=9a0a9d8e9af3c0")
     .then((response) => response.json())
     .then((data) => callback(data.country))
     .catch(() => callback("US"));
 },
 utilsScript:
   "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.19/js/utils.js",
});

form.addEventListener("submit", (e) => {
 e.preventDefault();

 const name = document.querySelector("#name").value.trim();
 const email = document.querySelector("#email").value.trim();
 const isValidPhone = iti.isValidNumber();
 const phoneNumber = iti.getNumber();

 if (!name) {
   alert("Please enter your full name.");
   return;
 }

 if (!email || !email.includes("@")) {
   alert("Please enter a valid email address.");
   return;
 }

 if (!isValidPhone) {
   alert("Please enter a valid phone number.");
   return;
 }

 // Disable the button and add loader
 submitButton.disabled = true;
 submitButton.innerHTML = `<span class="loader-inline"></span> Submit`;

 const data = {
   name,
   email,
   number: phoneNumber,
   userId,
   projectId,
 };

 fetch(`${BASE_URL}/api/v1/call`, {
   method: "POST",
   headers: {
     "Content-Type": "application/json",
   },
   body: JSON.stringify(data),
 })
   .then(() => {
     alert(`Thank you, ${name}!`);
     form.reset();
     iti.setNumber("");
   })
   .catch((error) => {
     console.error("Error:", error);
     alert("Something went wrong. Please try again.");
   })
   .finally(() => {
     submitButton.disabled = false;
     submitButton.textContent = "Submit";
   });
});

fetch(`${BASE_URL}/api/v1/inline-embed-feedback/${userId}/${projectId}`, {
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
   const textColor = data?.data?.textColor || "white";
   const logoUrl = data?.data?.logo || "";

   container.style.setProperty("--background-color", backgroundColor);
   container.style.setProperty("--button-color", buttonLinkColor);
   container.style.setProperty("--text-color", textColor);

   if (logoUrl) {
     const logo = document.createElement("img");
     logo.src = logoUrl;
     logo.alt = "Logo";
     logo.style.maxWidth = "150px";
     logo.style.display = "block";
     logo.style.margin = "0 auto 20px";

     container.prepend(logo);
   }
 })
 .catch((error) => {
   console.error("Error fetching feedback settings:", error);
   if (data) {
     alert("Error in applying custom styles!");
   }
 })
 .finally(() => {
   loaderOverlay.classList.add("hidden");
 });
}
 
}

