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
      // POST the link to the server
      const before = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: linkValue, title: titleValue }),
      };
      const response = await fetch("/api/links", before);
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
    })
      .then(async (links) => {
        console.log(await links.json());
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
