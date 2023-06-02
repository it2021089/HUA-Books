document.getElementById("insert").addEventListener("submit", function (event) {
  event.preventDefault();

  let author = document.getElementById("author").value.trim();
  let title = document.getElementById("title").value.trim();
  let genre = document.getElementById("genre").value;
  let price = parseFloat(document.getElementById("price").value);

  let authorError = document.getElementById("authorError");
  let titleError = document.getElementById("titleError");
  let priceError = document.getElementById("priceError");

  authorError.textContent = "";
  authorError.style.display = "none";
  titleError.textContent = "";
  titleError.style.display = "none";
  priceError.textContent = "";
  priceError.style.display = "none";

  let isValid = true;

  if (author === "") {
    authorError.textContent = "Please enter the author.";
    authorError.style.display = "block";
    isValid = false;
  }

  if (title === "") {
    titleError.textContent = "Please enter the title.";
    titleError.style.display = "block";
    isValid = false;
  }

  if (isNaN(price) || price <= 0) {
    priceError.textContent = "Please enter a valid price.";
    priceError.style.display = "block";
    isValid = false;
  }

  if (isValid) {
    const book = {
      author: author,
      title: title,
      genre: genre,
      price: price,
    };

    fetch("/check", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(book),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error("Error checking book existence");
        }
      })
      .then((data) => {
        if (data.exists) {
          displayErrorMessage("Book Already Exists");
        } else {
          insertBook(book);
        }
      })
      .catch((error) => {
        console.error("Error checking book existence:", error);
      });
  }
});

function insertBook(book) {
  fetch("/insert", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(book),
  })
    .then((response) => {
      if (response.ok) {
        showPopup();
      } else {
        console.error("Error inserting book:", response.statusText);
      }
    })
    .catch((error) => {
      console.error("Error inserting book:", error);
    });
}

function displayErrorMessage(message) {
  let errorContainer = document.getElementById("errorContainer");
  errorContainer.textContent = message;
  errorContainer.style.display = "block";

  errorContainer.classList.add("popupError");

  let closeButton = document.createElement("span");
  closeButton.innerHTML = "&#10005;";
  closeButton.classList.add("close-iconError");
  closeButton.addEventListener("mouseover", function () {
    closeButton.style.color = "red";
  });
  closeButton.addEventListener("mouseout", function () {
    closeButton.style.color = "";
  });
  closeButton.addEventListener("click", function () {
    errorContainer.style.display = "none";
  });

  errorContainer.appendChild(closeButton);
}
document
  .getElementById("search-form")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    let searchKeyword = document.getElementById("search").value.trim();

    let searchError = document.getElementById("searchError");
    searchError.textContent = "";
    searchError.style.display = "none";

    if (event.submitter.id === "display-all-button") {
      fetch("/books")
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error("Error retrieving books");
          }
        })
        .then((data) => {
          displaySearchResults(data);
        })
        .catch((error) => {
          console.error("Error retrieving books:", error);
        });
    } else if (searchKeyword === "") {
      searchError.textContent = "Please enter a search keyword.";
      searchError.style.display = "block";
    } else {
      fetch(`/books/${searchKeyword}`)
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error("Error searching for books");
          }
        })
        .then((data) => {
          displaySearchResults(data);
        })
        .catch((error) => {
          console.error("Error searching for books:", error);
        });
    }
  });

document
  .getElementById("display-all-button")
  .addEventListener("click", function () {
    fetch("/books")
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error("Error retrieving books");
        }
      })
      .then((data) => {
        displaySearchResults(data);
      })
      .catch((error) => {
        console.error("Error retrieving books:", error);
      });
  });

function displaySearchResults(books) {
  let resultContainer = document.getElementById("result");

  // Clear previous search results
  resultContainer.innerHTML = "";

  let html = "";

  if (books.length === 0) {
    html += "<p>No books found.</p>";
  } else {
    html += "<ul>";
    books.forEach((book) => {
      html += `
        <li>
          <strong>Title:</strong> ${book.title}<br>
          <strong>Author:</strong> ${book.author}<br>
          <strong>Genre:</strong> ${book.genre}<br>
          <strong>Price:</strong> $${book.price.toFixed(2)}
          <span class="remove-icon" title="Remove Book From Database" onclick="removeBook(${
            book.id
          })">
            <i class="fas fa-trash"></i>
          </span>
        </li>
      `;
    });
    html += "</ul>";
  }

  resultContainer.innerHTML = html;
  showSearchPopup();
}

function removeBook(bookId) {
  fetch(`/books/${bookId}`, { method: "DELETE" })
    .then((response) => {
      if (response.ok) {
        let searchKeyword = document.getElementById("search").value.trim();
        fetch(`/books/${searchKeyword}`)
          .then((response) => response.json())
          .then((data) => {
            displaySearchResults(data);
          })
          .catch((error) => {
            console.error("Error searching for books:", error);
          });
      } else {
        console.error("Error removing book:", response.statusText);
      }
    })
    .catch((error) => {
      console.error("Error removing book:", error);
    });
}

function showPopup() {
  let popupContainer = document.getElementById("popupContainer");
  popupContainer.style.display = "block";

  setTimeout(function () {
    popupContainer.style.display = "none";
    document.getElementById("insert").reset(); // Reset the form
  }, 2000);
}

function hidePopup() {
  let popupContainer = document.getElementById("popupContainer");
  popupContainer.style.display = "none";
}

function showSearchPopup() {
  let searchPopupContainer = document.getElementById("searchPopupContainer");
  searchPopupContainer.style.display = "block";
}

function hideSearchPopup() {
  let searchPopupContainer = document.getElementById("searchPopupContainer");
  searchPopupContainer.style.display = "none";
}
