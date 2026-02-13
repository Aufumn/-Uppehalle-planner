console.log("JS file is connected");

let recipes = [];

// Load CSV after page loads
document.addEventListener("DOMContentLoaded", () => {
  loadCSV();

  // Attach button listener
  document.getElementById("findBtn").addEventListener("click", findRecipes);
});

// Function to load CSV
async function loadCSV() {
  try {
    const response = await fetch("./Uppehalle_CSV.csv");
    if (!response.ok) throw new Error("CSV file not found");

    const text = await response.text();
    const rows = text.trim().split("\n");

    // Parse header
    const headers = parseCSVRow(rows[0]);

    // Parse all recipes
    for (let i = 1; i < rows.length; i++) {
      const values = parseCSVRow(rows[i]);
      let recipe = {};
      headers.forEach((header, index) => {
        recipe[header.trim()] = values[index]?.trim();
      });
      recipes.push(recipe);
    }

    console.log("CSV Loaded Successfully:", recipes);
  } catch (error) {
    console.error("Error loading CSV:", error);
  }
}

// Function to parse a single CSV row (handles quoted commas)
function parseCSVRow(row) {
  const result = [];
  let current = "";
  let insideQuotes = false;

  for (let char of row) {
    if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === "," && !insideQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

// Function to find and display safe recipes
function findRecipes() {
  if (recipes.length === 0) {
    alert("Recipes are still loading. Please wait.");
    return;
  }

  const allergies = {
    Gluten: document.getElementById("Gluten").checked,
    Dairy: document.getElementById("Dairy").checked,
    Eggs: document.getElementById("Eggs").checked,
    Nuts: document.getElementById("Nuts").checked
  };

  let safeRecipes = recipes.filter(recipe => {
    for (let allergy in allergies) {
      if (
        allergies[allergy] &&
        recipe[allergy]?.trim().toUpperCase() !== "N"
      ) {
        return false;
      }
    }
    return true;
  });

  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "";

  if (safeRecipes.length === 0) {
    resultsDiv.innerHTML = "<p>No safe recipes found.</p>";
    return;
  }

  // Show up to 3 recipes (randomized)
  safeRecipes.sort(() => 0.5 - Math.random());
  safeRecipes.slice(0, 3).forEach(recipe => {
    resultsDiv.innerHTML += `
      <h3>${recipe.Recipe}</h3>
      <p><strong>Ingredients:</strong> ${recipe.Ingredients}</p>
      <p><strong>Instructions:</strong> ${recipe.Instructions}</p>
      <hr>
    `;
  });
}
