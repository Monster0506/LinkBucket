document
  .getElementById("linkForm")
  .addEventListener("submit", async (event) => {
    event.preventDefault();

    const linkInput = document.getElementById("linkInput");
    let linkValue = linkInput.value.trim();

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
        body: JSON.stringify({ url: linkValue }),
      };
      console.log(before.body);
      const response = await fetch("/api/links", before);
      console.log(response);
      const data = await response.json();
      console.log(data);
      if (data.link) {
        addLinkToList(data.link);
        linkInput.value = ""; // Clear input field after adding
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
  const linkList = document.getElementById("linkList");

  const listItem = document.createElement("li");
  listItem.className =
    "flex justify-between items-center p-4 bg-gray-50 border border-gray-200 rounded-lg";

  const linkElement = document.createElement("a");
  linkElement.href = link.url;
  linkElement.target = "_blank";

  const displayText = link.url.replace(/^https?:\/\/(www\.)?/, "");
  linkElement.textContent = displayText;
  linkElement.className = "text-blue-500 hover:underline truncate max-w-full";

  const timestampElement = document.createElement("span");
  timestampElement.textContent = new Date(link.timestamp).toLocaleString();
  timestampElement.className = "text-gray-500 text-sm";

  const removeButton = document.createElement("button");
  removeButton.textContent = "Remove";
  removeButton.className =
    "bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 focus:outline-none";
  removeButton.addEventListener("click", () => {
    // DELETE the link from the server
    fetch(`/api/links/${link.id}`, {
      method: "DELETE",
    })
      .then(() => linkList.removeChild(listItem))
      .catch((error) => console.error("Error:", error));
  });

  listItem.appendChild(linkElement);
  listItem.appendChild(timestampElement);
  listItem.appendChild(removeButton);
  linkList.appendChild(listItem);
}
