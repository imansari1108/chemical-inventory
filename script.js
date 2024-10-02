// let data = [];
// fetch('data.json')
// .then(response => response.text())
// .then(body => {
//     data = JSON.parse(body);
//     console.log(data)
// })
//console.log(data);

let data;
let sortDirection = true;
let selectedRow = null;

// Async function to load the data from json file
async function load() {
  try {
    let response = await fetch("data.json");
    data = await response.json();
    for (var i = 0; i < data.length; i++) {
      tr = document.createElement("tr");
      var firstColumn = document.createElement("td");
      selectCheckbox = '<input type="checkbox" class="row-checkbox">';
      firstColumn.innerHTML = selectCheckbox;
      tr.appendChild(firstColumn);
      for (k in data[i]) {
        td = document.createElement("td");
        td.appendChild(document.createTextNode(data[i][k]));
        tr.appendChild(td);
      }
      document.querySelector("tbody").appendChild(tr);

      // Attachment of event listener to the selected row since the table is dynamically populated
      // This is attached here because the onload function provokes before the table is populated with data
      tr.addEventListener("click", function () {
        selectRow(this);
      });
    }
  } catch (error) {
    console.error("There is an error:", error);
  }
}

//Initialization
load();

// Sort function
function sortTable(columnIndex) {
  const table = document.getElementById("chemicalTable");
  const tbody = table.tBodies[0];
  const rows = Array.from(tbody.rows);

  rows.sort((a, b) => {
    const aText = a.cells[columnIndex].textContent.trim();
    const bText = b.cells[columnIndex].textContent.trim();

    const aValue = isNaN(aText) ? aText : parseFloat(aText);
    const bValue = isNaN(bText) ? bText : parseFloat(bText);

    return (aValue > bValue ? 1 : -1) * (sortDirection ? 1 : -1);
  });

  // Clear existing rows and append sorted rows
  tbody.innerHTML = "";
  rows.forEach((row) => tbody.appendChild(row));

  // Toggle sort direction
  sortDirection = !sortDirection;

  // Update header indicators
  updateSortIndicators(columnIndex);
}

// Function to update the sort arrow
function updateSortIndicators(columnIndex) {
  const headers = document.querySelectorAll("th");
  headers.forEach((header, index) => {
    const directionSpan = header.querySelector(".direction");
    if (directionSpan) {
      directionSpan.textContent = "";
    }
    if (index === columnIndex) {
      if (directionSpan) {
        directionSpan.textContent = sortDirection ? "▲" : "▼";
      }
    }
  });
}

//Function to select the row
function selectRow(row) {
  const selectAllCheckbox = document.getElementById("selectAll");
  if (selectAllCheckbox.checked) {
    selectedRow = row;
    const checkbox = row.querySelector("input[type='checkbox']");
    if (checkbox) checkbox.checked = true;
  } else {
    if (selectedRow) {
      selectedRow.classList.remove("selected");
      const checkbox = selectedRow.querySelector("input[type='checkbox']");
      if (checkbox) checkbox.checked = false;
    }
    selectedRow = row;
    selectedRow.classList.add("selected");
    const checkbox = row.querySelector("input[type='checkbox']");
    if (checkbox) checkbox.checked = true;
  }
}

// Select All functionality
document.getElementById("selectAll").addEventListener("change", function () {
  const checkboxes = document.querySelectorAll(".row-checkbox");
  checkboxes.forEach((checkbox) => {
    checkbox.checked = this.checked;
  });

  // Check if "select all" is being checked
  if (this.checked) {
    // Remove selection from the current selected row if it exists
    if (selectedRow) {
      selectedRow.classList.remove("selected");
    }
    selectedRow = null; // Optionally reset selectedRow since we are selecting all
  }
});

// Function to move up the row
function moveUp() {
  if (selectedRow) {
    const previousRow = selectedRow.previousElementSibling;
    if (previousRow) {
      const parent = selectedRow.parentNode;
      parent.insertBefore(selectedRow, previousRow);
    } else {
      alert("The selected row is already at the top.");
    }
  } else {
    alert("Please select a row to move up.");
  }
}

// Function to move down the row
function moveDown() {
  if (selectedRow) {
    const nextRow = selectedRow.nextElementSibling;
    if (nextRow) {
      const parent = selectedRow.parentNode;
      parent.insertBefore(nextRow, selectedRow);
    } else {
      alert("The selected row is already at the bottom.");
    }
  } else {
    alert("Please select a row to move down.");
  }
}

// Individual checkbox functionality
document
  .querySelector("#chemicalTable tbody")
  .addEventListener("change", function (event) {
    if (event.target.classList.contains("row-checkbox")) {
      const checkboxes = document.querySelectorAll(".row-checkbox");
      let allChecked = true;

      for (let i = 0; i < checkboxes.length; i++) {
        if (!checkboxes[i].checked) {
          allChecked = false;
          break;
        }
      }
      document.getElementById("selectAll").checked = allChecked;
    }
  });

// Delete selected rows
function deleteSelectedRow() {
  const checkboxes = document.querySelectorAll(".row-checkbox:checked");
  if (checkboxes.length > 0) {
    const confirmDelete = confirm(
      "Are you sure you want to delete the selected rows?"
    );
    if (confirmDelete) {
      checkboxes.forEach((checkbox) => {
        const row = checkbox.closest("tr");
        row.remove();
      });

      document.getElementById("selectAll").checked = false;
    }
  } else {
    alert("No rows selected to delete.");
  }
}

function openEditModal() {
  if (!selectedRow) {
    alert("Select an order to edit.");
    return;
  }

  const index = Array.from(selectedRow.parentNode.children).indexOf(
    selectedRow
  );
  const chemical = data[index];

  document.getElementById("editName").value = chemical.chemical_name;
  document.getElementById("editVendor").value = chemical.vendor;
  document.getElementById("editDensity").value = chemical.density;
  document.getElementById("editViscosity").value = chemical.viscosity;
  document.getElementById("editPackaging").value = chemical.packaging;
  document.getElementById("editPackSize").value = chemical.pack_size;
  document.getElementById("editUnit").value = chemical.unit;
  document.getElementById("editQuantity").value = chemical.quantity;

  // Store the index of the chemical being edited
  document.getElementById("editOrderForm").dataset.index = index;

  // Show the modal
  document.getElementById("editModal").style.display = "block";
}

function closeEditModal() {
  document.getElementById("editModal").style.display = "none";
}

document
  .getElementById("editOrderForm")
  .addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent form submission

    const index = this.dataset.index; // Get the index of the chemical being edited
    data[index] = {
      id: index,
      name: document.getElementById("editName").value,
      vendor: document.getElementById("editVendor").value,
      density: parseFloat(document.getElementById("editDensity").value),
      viscosity: parseFloat(document.getElementById("editViscosity").value),
      packaging: document.getElementById("editPackaging").value,
      packSize: parseFloat(document.getElementById("editPackSize").value),
      unit: document.getElementById("editUnit").value,
      quantity: parseInt(document.getElementById("editQuantity").value),
    };

    //populateTable(); // Update the table
    tableBody.innerHTML = ""; // Clear the table body
    for (var i = 0; i < data.length; i++) {
      tr = document.createElement("tr");
      var firstColumn = document.createElement("td");
      selectCheckbox = '<input type="checkbox" class="row-checkbox">';
      firstColumn.innerHTML = selectCheckbox;
      tr.appendChild(firstColumn);
      for (k in data[i]) {
        td = document.createElement("td");
        td.appendChild(document.createTextNode(data[i][k]));
        tr.appendChild(td);
      }
      document.querySelector("tbody").appendChild(tr);

      tr.addEventListener("click", function () {
        selectRow(this);
      });
    }

    document.getElementById("editOrderForm").reset();
    closeEditModal(); // Close the modal
  });

//Adding a row
const tableBody = document.querySelector("#chemicalTable tbody");
const modal = document.getElementById("addModal");

function modalOpen() {
  modal.style.display = "block";
}

function modalClose() {
  modal.style.display = "none";
}

window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
};

document
  .getElementById("addOrderForm")
  .addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent form submission

    const newChemical = {
      id: data.length + 1,
      name: document.getElementById("name").value,
      vendor: document.getElementById("vendor").value,
      density: parseFloat(document.getElementById("density").value),
      viscosity: parseFloat(document.getElementById("viscosity").value),
      packaging: document.getElementById("packaging").value,
      packSize: parseFloat(document.getElementById("packSize").value),
      unit: document.getElementById("unit").value,
      quantity: parseInt(document.getElementById("quantity").value),
    };

    data.push(newChemical); // Add new chemical to the array
    tableBody.innerHTML = ""; // Clear the table body
    for (var i = 0; i < data.length; i++) {
      tr = document.createElement("tr");
      var firstColumn = document.createElement("td");
      selectCheckbox = '<input type="checkbox" class="row-checkbox">';
      firstColumn.innerHTML = selectCheckbox;
      tr.appendChild(firstColumn);
      for (k in data[i]) {
        td = document.createElement("td");
        td.appendChild(document.createTextNode(data[i][k]));
        tr.appendChild(td);
      }
      document.querySelector("tbody").appendChild(tr);

      tr.addEventListener("click", function () {
        selectRow(this);
      });
    }

    document.getElementById("addOrderForm").reset();
    modal.style.display = "none"; // Close the modal
  });

//Function to save the data in JSON Format
function saveData() {
  const jsonData = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonData], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "data.json";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
