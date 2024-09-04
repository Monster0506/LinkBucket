document.getElementById("linkForm").addEventListener("submit", (event) => {
  event.preventDefault();

  const linkInput = document.getElementById("linkInput");
  const linkList = document.getElementById("linkList");

  const linkValue = linkInput.value;
  if (linkValue) {
    const listItem = document.createElement("li");

    const linkElement = document.createElement("a");
    linkElement.href = linkValue;
    linkElement.target = "_blank";
    linkElement.textContent = linkValue;

    const removeButton = document.createElement("button");
    removeButton.textContent = "Remove";
    removeButton.addEventListener("click", function () {
      linkList.removeChild(listItem);
    });

    listItem.appendChild(linkElement);
    listItem.appendChild(removeButton);

    linkList.appendChild(listItem);
    linkInput.value = ""; // Clear input field after adding
  }
});
