document.addEventListener('DOMContentLoaded', function () {
    fetchBooks();
  
    const bookForm = document.getElementById('book-form');
    bookForm.addEventListener('submit', async function (e) {
      e.preventDefault();
  
      const formData = new FormData(bookForm);
      const bookData = {};
      formData.forEach((value, key) => {
        bookData[key] = value;
      });
  
      const response = await fetch('/books', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bookData)
      });
  
      if (response.ok) {
        fetchBooks();
        $('#bookModal').modal('hide');
        bookForm.reset();
      } else {
        console.error('Failed to add book');
      }
    });
  });
  
  async function fetchBooks() {
    const response = await fetch('/books');
    const books = await response.json();
  
    const bookList = document.getElementById('book-list');
    bookList.innerHTML = '';
  
    books.forEach(book => {
      const bookElement = document.createElement('div');
      bookElement.className = 'card mt-4';
      bookElement.innerHTML = `
        <div class="card-body">
          <h5 class="card-title">${book.title}</h5>
          <h6 class="card-subtitle mb-2 text-muted">${book.author}</h6>
          <p class="card-text">Rating: ${book.rating}</p>
          <p class="card-text">Date Read: ${new Date(book.date_read).toLocaleDateString()}</p>
          <p class="card-text">${book.notes}</p>
          <img src="${book.cover_image_url}" class="card-img-top" alt="Book Cover">
          <button class="btn btn-danger mt-2" onclick="deleteBook(${book.id})">Delete</button>
        </div>
      `;
      bookList.appendChild(bookElement);
    });
  }
  
  async function deleteBook(id) {
    const response = await fetch(`/books/${id}`, {
      method: 'DELETE'
    });
  
    if (response.ok) {
      fetchBooks();
    } else {
      console.error('Failed to delete book');
    }
  }
  