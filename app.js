let inventory = JSON.parse(localStorage.getItem("inventory")) || [];
renderInventory();

function addItem() {
  const name = document.getElementById("item-name").value;
  const price = parseFloat(document.getElementById("item-price").value);
  const type = document.getElementById("item-type").value;
  const imageInput = document.getElementById("item-image");
  const notes = document.getElementById("item-notes").value;

  if (!name || isNaN(price)) {
    alert("Please enter a valid name and price.");
    return;
  }

  const file = imageInput.files[0];

  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const item = {
        id: Date.now(),
        name,
        price,
        type,
        imageData: e.target.result,
        notes,
      };

      inventory.push(item);
      localStorage.setItem("inventory", JSON.stringify(inventory));
      renderInventory();
      clearForm();
    };
    reader.readAsDataURL(file);
  } else {
    const item = {
      id: Date.now(),
      name,
      price,
      type,
      imageData: null,
      notes,
    };

    inventory.push(item);
    localStorage.setItem("inventory", JSON.stringify(inventory));
    renderInventory();
    clearForm();
  }
}

function renderInventory() {
  const itemsList = document.getElementById("items");
  itemsList.innerHTML = "";

  const search =
    document.getElementById("search-box")?.value.toLowerCase() || "";
  const typeFilter = document.getElementById("filter-type")?.value || "all";

  const filtered = inventory.filter((item) => {
    const matchesType = typeFilter === "all" || item.type === typeFilter;
    const matchesSearch =
      item.name.toLowerCase().includes(search) ||
      (item.notes && item.notes.toLowerCase().includes(search));
    return matchesType && matchesSearch;
  });

  // Summary Calculations
  const count = filtered.length;
  const total = filtered.reduce((sum, item) => sum + item.price, 0);
  const avg = count > 0 ? total / count : 0;

  document.getElementById("summary-count").textContent = count;
  document.getElementById("summary-total").textContent = total.toFixed(2);
  document.getElementById("summary-average").textContent = avg.toFixed(2);

  filtered.forEach((item, index) => {
    const li = document.createElement("li");

    const content = document.createElement("div");
    content.innerHTML = `
      <strong>${item.name}</strong> — $${item.price.toFixed(2)} (${
      item.type
    })<br />
      ${
        item.imageData ? `<img src="${item.imageData}" alt="${item.name}">` : ""
      }
      ${item.notes ? `<p><em>${item.notes}</em></p>` : ""}
    `;

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "🗑️";
    deleteBtn.onclick = () => {
      inventory.splice(index, 1);
      localStorage.setItem("inventory", JSON.stringify(inventory));
      renderInventory();
    };

    li.appendChild(content);
    li.appendChild(deleteBtn);
    itemsList.appendChild(li);
  });
}

function clearForm() {
  document.getElementById("item-name").value = "";
  document.getElementById("item-price").value = "";
  document.getElementById("item-type").value = "furniture";
  document.getElementById("item-image").value = "";
  document.getElementById("item-notes").value = "";
}

// Attach event listeners for live search/filtering
document
  .getElementById("search-box")
  .addEventListener("input", renderInventory);
document
  .getElementById("filter-type")
  .addEventListener("change", renderInventory);
function exportInventory() {
  const data = JSON.stringify(inventory, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "yoworld-inventory.json";
  a.click();

  URL.revokeObjectURL(url);
}

function importInventory() {
  const fileInput = document.getElementById("import-file");
  const file = fileInput.files[0];

  if (!file) {
    alert("Please choose a .json file to import.");
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const importedData = JSON.parse(e.target.result);
      if (!Array.isArray(importedData)) throw new Error("Invalid format");

      inventory = importedData;
      localStorage.setItem("inventory", JSON.stringify(inventory));
      renderInventory();
      alert("Inventory imported successfully.");
    } catch (err) {
      alert("Error importing file: " + err.message);
    }
  };

  reader.readAsText(file);
}
