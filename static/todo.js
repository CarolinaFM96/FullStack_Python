document.addEventListener("DOMContentLoaded", function () {
  const randomBtn = document.getElementById("random-btn");
  const randomResult = document.getElementById("random-result");

  if (randomBtn && randomResult) {
    randomBtn.addEventListener("click", async () => {
      try {
        const response = await fetch("/random");
        const data = await response.json();
        randomResult.textContent = data.random_number;
      } catch (error) {
        console.error("Error fetching random number:", error);
        randomResult.textContent = "Error";
      }
    });
  }
});
