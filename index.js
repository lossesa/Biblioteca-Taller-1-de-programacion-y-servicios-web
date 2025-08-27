// 1 ) CREAR LIBRO
function createBook(title, author, genre, isbn){
    return { 
        id: Date.now(),
        title,
        author,
        genre,
        isbn,
        isAvailable: true,
        borrowedBy: null,
        borrowedAt: null,
        dueDate: null,
        createdAt: new Date() 
    };
}


// 2) AGREGAR LIBRO
function addBookToLibrary(books, title, author, genre, isbn){
    // Se usa la funcion createBook para generar un libro nuevo y se asigna a book.
    const book = createBook(title, author, genre, isbn);
    books.push(book); // Se usa push para agregar ese libro a books (array donde iran los libros)
    return { // Retorna true, un mensaje y el libro agregado.
        success: true,
        message: "Libro agregado correctamente.",
        book
    };
}


// 3) ELIMINAR LIBRO
function removeBookFromLibrary(books, id){
    // Se usa findIndex para encontrar el indice del libro a eliminar en el array de libros, y se le asigna el proceso a index.
    const index = books.findIndex(book => book.id === id);

    // Si no se encuentra el libro, se devuelve un -1.
    // Se usa un condicion en caso de que el indice sea diferente de -1, es decir, que si se haya encontrado el indice y el libro exista en el array de libro.
    if (index !== -1){
        // Se usa splice para eliminar el libro.
        // Index: Desde donde empieza a borrar.
        // 1: Cantidad de elemento a borrar, en este caso, solo uno.
        // [0]: Para obtener el valor, no con el array.
        const removedBook = books.splice(index, 1)[0];
        return {
            success: true,
            message: "Libro eliminado correctamente.",
            book: removedBook
        };
    }
    return {
        success: false,
        message: "Libro no encontrado."
    };
}


// 4) PRESTAR LIBROS
function borrowBook(books, borrowedBooks, bookId, borrowerName, days = 14) {
    // Buscar el libro en la lista de libros
    const book = books.find(b => b.id === bookId);

    if (!book) return { 
        success: false, 
        message: "Libro no encontrado" 
    };

    if (!book.isAvailable) return { 
        success: false, 
        message: "Libro no disponible" 
    };

    // Calcular fecha de devolución
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + days);

    // Actualizar datos del libro
    book.isAvailable = false;
    book.borrowedBy = borrowerName;
    book.dueDate = dueDate.toISOString().split("T")[0];

    // Agregar a la lista de libros prestados
    borrowedBooks.push(book);

    return { 
        success: true, 
        message: "Libro prestado correctamente", 
        book 
    };
}


// 5) DEVOLVER LIBROS
function returnBook(books, borrowedBooks, bookId) {
    // Buscar en libros prestados
    const index = borrowedBooks.findIndex(b => b.id === bookId);
    if (index === -1) return { 
        success: false, 
        message: "El libro no está en la lista de prestados" 
    };

    // Marcar como disponible
    const book = borrowedBooks[index];
    book.isAvailable = true;
    book.borrowedBy = null;
    book.dueDate = null;

    // Eliminar de la lista de prestados
    borrowedBooks.splice(index, 1);

    return { 
        success: true, 
        message: "Libro devuelto correctamente", 
        book 
    };
}



// 6) CALCULAR MULTA
function calculateFine(bookTitle, borrowerName, dueDate, fineRate = 0.50) {
    const today = new Date();
    const due = new Date(dueDate); // Convertir string a Date

    // Si aún no ha vencido, no hay multa
    if (today <= due) {
        console.log(`El libro "${bookTitle}" prestado a ${borrowerName} no tiene multa.`);
        return 0;
    }

    // Calcular días de retraso
    const diffTime = today - due; // Diferencia en milisegundos
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Calcular multa
    const fine = diffDays * fineRate;
    console.log(`El libro "${bookTitle}" prestado a ${borrowerName} tiene una multa de $${fine.toFixed(2)} por ${diffDays} días de retraso.`);
    return fine;
}


// 7) BUSCAR LIBROS
function searchBooks(books, criteria) {
    const searchTerm = criteria.toLowerCase();

    const results = books.filter(book =>
        book.title.toLowerCase().includes(searchTerm) ||
        book.author.toLowerCase().includes(searchTerm) ||
        book.genre.toLowerCase().includes(searchTerm) ||
        book.isbn.toString().includes(searchTerm)
    );

    return {
        success: results.length > 0,
        message: results.length > 0 
            ? `Se encontraron ${results.length} libro(s) que coinciden con "${criteria}".`
            : `No se encontraron libros que coincidan con "${criteria}".`,
        books: results
    };
}


// 8) OBTENER LIBRO POR GENERO
function getBooksByGenre(books, genre) {
    const searchGenre = genre.toLowerCase();

    const results = books.filter(book => book.genre.toLowerCase() === searchGenre);

    return {
        success: results.length > 0,
        message: results.length > 0
            ? `Se encontraron ${results.length} libro(s) del género "${genre}".`
            : `No hay libros registrados en el género "${genre}".`,
        books: results
    };
}


// 9) OBTENER LIBROS VENCIDOS
function getOverdueBooks(borrowedBooks, fineRate = 0.50) {
    const today = new Date();
    const overdueBooks = [];

    borrowedBooks.forEach((book) => {
        if (book.dueDate) {
            const dueDate = new Date(book.dueDate); // Convertir a Date

            if (today > dueDate) {
                const daysLate = Math.ceil((today - dueDate) / (1000 * 60 * 60 * 24));
                overdueBooks.push({
                    id: book.id,
                    title: book.title,
                    borrowedBy: book.borrowedBy,
                    dueDate: book.dueDate,
                    daysLate: daysLate,
                    fine: parseFloat((daysLate * fineRate).toFixed(2))
                });
            }
        }
    });

    return {
        success: overdueBooks.length > 0,
        message: overdueBooks.length > 0
            ? `Se encontraron ${overdueBooks.length} libro(s) con retraso.`
            : "No hay libros vencidos.",
        books: overdueBooks
    };
}



// 10) GENERAR REPORTE DE LA BIBLIOTECA
function generateLibraryReport(books, borrowedBooks, fineRate = 0.50) {
    const totalBooks = books.length;
    const borrowedCount = borrowedBooks.length; // Corregido: es un array, no .size
    const availableCount = books.filter(book => book.isAvailable).length;

    let overdueCount = 0;
    let totalFines = 0;

    borrowedBooks.forEach(book => {
        if (book.dueDate) {
            const dueDate = new Date(book.dueDate);
            if (new Date() > dueDate) {
                overdueCount++;
                const daysLate = Math.ceil((new Date() - dueDate) / (1000 * 60 * 60 * 24));
                totalFines += daysLate * fineRate;
            }
        }
    });

    return {
        success: true,
        message: "Reporte generado correctamente.",
        report: {
            totalBooks,
            borrowedBooks: borrowedCount,
            availableBooks: availableCount,
            overdueBooks: overdueCount,
            totalFines: parseFloat(totalFines.toFixed(2))
        }
    };
}




// PRUEBAS MANUALES
let books = [];
let borrowedBooks = [];

// Agregar libros
console.log(addBookToLibrary(books, "El Quijote", "Cervantes", "Novela", "12345"));
console.log(addBookToLibrary(books, "Cien años de soledad", "García Márquez", "Realismo mágico", "67890"));

// Buscar libro
console.log(searchBooks(books, "quijote"));

// Prestar libro
let idPrestamo = books[0].id;
console.log(borrowBook(books, borrowedBooks, idPrestamo, "Juan Pérez", 7));

// Intentar prestar libro ya prestado
console.log(borrowBook(books, borrowedBooks, idPrestamo, "Ana", 5));

// Devolver libro
console.log(returnBook(books, borrowedBooks, idPrestamo));

// Volver a prestar y simular fecha vencida
console.log(borrowBook(books, borrowedBooks, idPrestamo, "Carlos", -3)); // días negativos para simular atraso

// Libros vencidos
console.log(getOverdueBooks(borrowedBooks));

// Calcular multa
let libroAtrasado = borrowedBooks[0];
console.log("Multa:", calculateFine(libroAtrasado.title, libroAtrasado.borrowedBy, libroAtrasado.dueDate));

// Reporte
console.log(generateLibraryReport(books, borrowedBooks));

// Eliminar libro
console.log(removeBookFromLibrary(books, books[1].id));

