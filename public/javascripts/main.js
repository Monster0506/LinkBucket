document
  .getElementById("linkForm")
  .addEventListener("submit", async (event) => {
    event.preventDefault();

    const linkInput = document.getElementById("linkInput");
    let linkValue = linkInput.value.trim();
    const titleInput = document.getElementById("linkTitle");
    const titleValue = titleInput.value.trim()
      ? titleInput.value.trim()
      : linkValue;

    // Normalize and validate the link (as before)
    if (!linkValue.startsWith("http://") && !linkValue.startsWith("https://")) {
      if (linkValue.startsWith("www.")) {
        linkValue = `https://${linkValue}`;
      } else {
        linkValue = `https://www.${linkValue}`;
      }
    }

    // Updated URL validation pattern
    const urlPattern =
      /^(https?:\/\/)?(www\.)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,6}(\/[^\s]*)?$/;

    console.log(linkValue);
    if (urlPattern.test(linkValue)) {
      // POST the link to the server with auth headers
      const before = {
        method: "POST",
        headers: getAuthHeaders(), // Use the auth headers
        body: JSON.stringify({ url: linkValue, title: titleValue }),
      };
      
      const response = await fetch("/api/links", before);
      
      if (response.status === 401) {
        loginModal.show();
        return;
      }
      
      const data = await response.json();
      console.log(data);
      if (data.link) {
        addLinkToList(data.link);
        linkInput.value = ""; // Clear input field after adding
        titleInput.value = "";
      }
    } else {
      alert("Please enter a valid URL.");
    }
  });

// Fetch and display existing links on page load
window.addEventListener("DOMContentLoaded", () => {
  fetch("/api/links")
    .then((response) => response.json())
    .then((links) => {
      for (const link of links) {
        addLinkToList(link);
        console.log(link);
      }
    })
    .catch((error) => console.error("Error:", error));
});

function addLinkToList(link) {
  const url = link.url;
  const title = link.title;

  const listItem = document.createElement("li");
  listItem.className = "col-12 col-md-6 col-lg-4 mb-4";

  const card = document.createElement("div");
  card.className = "card h-100 shadow-sm border-0 rounded-lg hover-shadow";

  const cardHeader = document.createElement("div");
  cardHeader.className = "card-header bg-primary text-white rounded-top";
  cardHeader.textContent = title;

  const cardBody = document.createElement("div");
  cardBody.className = "card-body d-flex flex-column";

  const linkElement = document.createElement("a");
  linkElement.href = url;
  linkElement.target = "_blank";
  const displayText = url.replace(/^https?:\/\/(www\.)?/, "");

  linkElement.innerHTML = `<i class="fas fa-link mr-2"></i>${displayText}`;
  linkElement.className =
    "card-link text-primary font-weight-bold text-truncate";

  const timestampElement = document.createElement("small");
  timestampElement.textContent = `Added on: ${new Date().toLocaleString()}`;
  timestampElement.className = "text-muted mt-auto";

  const removeButton = document.createElement("button");
  removeButton.textContent = "Remove";
  removeButton.className = "btn btn-danger btn-sm mt-2 ml-auto";
  removeButton.addEventListener("click", () => {
    fetch(`/api/links/${link.id}`, {
       method: "DELETE",
      headers: getAuthHeaders(), // Add auth headers here
    })
      .then(async (response) => {
        if (response.status === 401) {
          loginModal.show();
          return;
        }
        const data = await response.json();
        console.log(data);
        linkList.removeChild(listItem);
      })
      .catch((error) => console.error("Error:", error));
  });

  cardBody.appendChild(linkElement);
  cardBody.appendChild(timestampElement);
  cardBody.appendChild(removeButton);
  card.appendChild(cardHeader);
  card.appendChild(cardBody);
  listItem.appendChild(card);

  linkList.appendChild(listItem);
}

// Auth related elements
let loginModal;
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const userEmail = document.getElementById('userEmail');
const authForm = document.getElementById('authForm');

// Initialize Bootstrap components after DOM load
// Replace the existing DOMContentLoaded event listener with this optimized version
document.addEventListener('DOMContentLoaded', async () => {
  loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
  
  loginBtn.addEventListener('click', () => {
    loginModal.show();
  });

  // Clear existing links
  document.getElementById('linkList').innerHTML = '';
  
  // Immediately check auth and fetch links
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const [authResponse, linksResponse] = await Promise.all([
        fetch('/api/links', { headers: getAuthHeaders() }),
        fetch('/api/links', { headers: getAuthHeaders() })
      ]);

      if (authResponse.ok) {
        loginBtn.classList.add('d-none');
        logoutBtn.classList.remove('d-none');
      }

      if (linksResponse.ok) {
        console.log('Links fetched:', linksResponse); // Add this lin
        const links = await linksResponse.json();
        links.forEach(link => addLinkToList(link));
      }
    } catch (error) {
      console.error('Error initializing:', error);
    }
  } else {
    // If not authenticated, still try to fetch public links if any
    try {
      const response = await fetch('/api/links');
      if (response.ok) {
        const links = await response.json();
        links.forEach(link => addLinkToList(link));
      }
    } catch (error) {
      console.error('Error fetching public links:', error);
    }
  }
});

// Update fetchLinks function to clear and reload links
async function fetchLinks() {
  try {
    const response = await fetch('/api/links', {
      headers: getAuthHeaders()
    });
    if (response.status === 401) {
      loginModal.show();
      return;
    }
    const links = await response.json();
    const linkList = document.getElementById('linkList');
    linkList.innerHTML = ''; // Clear existing links
    links.forEach(link => addLinkToList(link));
  } catch (error) {
    console.error('Error fetching links:', error);
  }
}

// Handle auth form submission
authForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const action = e.submitter.getAttribute('data-action');

  try {
    const response = await fetch(`/api/auth/${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    if (response.ok) {
      localStorage.setItem('token', data.session.access_token);
      userEmail.textContent = email;
      userEmail.classList.remove('d-none');
      loginBtn.classList.add('d-none');
      logoutBtn.classList.remove('d-none');
      loginModal.hide();
      // Refresh links after login
      fetchLinks();
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    alert(error.message);
  }
});

// Handle logout
logoutBtn.addEventListener('click', async () => {
  try {
    await fetch('/api/auth/logout', { method: 'POST' });
    localStorage.removeItem('token');
    userEmail.classList.add('d-none');
    loginBtn.classList.remove('d-none');
    logoutBtn.classList.add('d-none');
    // Clear links after logout
    document.getElementById('linkList').innerHTML = '';
  } catch (error) {
    console.error('Logout failed:', error);
  }
});

// Update your existing fetch functions to include the auth token
function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
}
