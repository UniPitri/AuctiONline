/**
 * This variable stores the logged in user
 */
var loggedUser = {};

/**
 * This function is called when login button is pressed.
 * Note that this does not perform an actual authentication of the user.
 * A student is loaded given the specified email,
 * if it exists, the studentId is used in future calls.
 */
function login()
{
    //get the form object
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;
    // console.log(email);

    fetch('../api/v1/autenticazione', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify( { username: username, password: password } ),
    })
    .then((resp) => resp.json()) // Transform the data into json
    .then(function(data) { // Here you get the data to modify as you please
        //console.log(data);
        loggedUser.token = data.token;
        loggedUser.email = data.email;
        loggedUser.id = data.id;
        loggedUser.self = data.self;
        // loggedUser.id = loggedUser.self.substring(loggedUser.self.lastIndexOf('/') + 1);
        document.getElementById("loggedUser").textContent = loggedUser.email;
        loadLendings();
        return;
    })
    .catch( error => console.error(error) ); // If there is any error you will catch them here

};

/**
 * This function refresh the list of books
*/
function caricaAste() {
    const cardDeck = document.getElementById('cardDeck');
    fetch('../api/v1/aste', {
        method: 'GET',
    })
    .then((resp) => resp.json()) // Transform the data into json
    .then(function(data) { // Here you get the data to modify as you please        
        return data.map(function(asta) { // Map through the results and for each run the code below
            let div = document.createElement('div');
            div.className = "card bg-success";
            let div2 = document.createElement('div');
            div2.className = "card-body";
            let h5 = document.createElement('h5');
            h5.className = "card-title";
            h5.innerHTML = asta.dettagliProdotto.Nome;
            div2.appendChild(h5);
            div.appendChild(div2);
            cardDeck.appendChild(div);
/*
            // let bookId = book.self.substring(book.self.lastIndexOf('/') + 1);
            
            let li = document.createElement('li');
            let span = document.createElement('span');
            // span.innerHTML = `<a href="${book.self}">${book.title}</a>`;
            let a = document.createElement('a');
            a.href = asta.self
            // span.innerHTML += `<button type="button" onclick="takeBook('${book.self}')">Take the book</button>`
            let button = document.createElement('button');
            button.type = 'button'
            //button.onclick = ()=>takeBook(asta.self)
            button.textContent = 'Take the book';
            

  <div class="card">
    <img class="card-img-top" src="..." alt="Card image cap">
    <div class="card-body">
      <h5 class="card-title">Card title</h5>
      <p class="card-text">This is a longer card with supporting text below as a natural lead-in to additional content. This content is a little bit longer.</p>
      <p class="card-text"><small class="text-muted">Last updated 3 mins ago</small></p>
    </div>
  </div>
  <div class="card">
    <img class="card-img-top" src="..." alt="Card image cap">
    <div class="card-body">
      <h5 class="card-title">Card title</h5>
      <p class="card-text">This card has supporting text below as a natural lead-in to additional content.</p>
      <p class="card-text"><small class="text-muted">Last updated 3 mins ago</small></p>
    </div>
  </div>
  <div class="card">
    <img class="card-img-top" src="..." alt="Card image cap">
    <div class="card-body">
      <h5 class="card-title">Card title</h5>
      <p class="card-text">This is a wider card with supporting text below as a natural lead-in to additional content. This card has even longer content than the first to show that equal height action.</p>
      <p class="card-text"><small class="text-muted">Last updated 3 mins ago</small></p>
    </div>
  </div>
</div>


            // Append all our elements
            span.appendChild(a);
            span.appendChild(button);
            li.appendChild(span);
            ul.appendChild(li);*/
        })
    })
    .catch( error => console.error(error) );// If there is any error you will catch them here
}
caricaAste();

/**
 * This function is called by the Take button beside each book.
 * It create a new booklendings resource,
 * given the book and the logged in student
 */
function takeBook(bookUrl)
{
    fetch('../api/v1/booklendings', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-access-token': loggedUser.token
        },
        body: JSON.stringify( { student: loggedUser.self, book: bookUrl } ),
    })
    .then((resp) => {
        console.log(resp);
        loadLendings();
        return;
    })
    .catch( error => console.error(error) ); // If there is any error you will catch them here

};

/**
 * This function refresh the list of bookLendings.
 * It only load bookLendings given the logged in student.
 * It is called every time a book is taken of when the user login.
 */
function loadLendings() {

    const ul = document.getElementById('bookLendings'); // Get the list where we will place our lendings

    ul.innerHTML = '';

    fetch('../api/v1/booklendings?studentId=' + loggedUser.id + '&token=' + loggedUser.token)
    .then((resp) => resp.json()) // Transform the data into json
    .then(function(data) { // Here you get the data to modify as you please
        
        console.log(data);
        
        return data.map( (entry) => { // Map through the results and for each run the code below
            
            // let bookId = book.self.substring(book.self.lastIndexOf('/') + 1);
            
            let li = document.createElement('li');
            let span = document.createElement('span');
            // span.innerHTML = `<a href="${entry.self}">${entry.book}</a>`;
            let a = document.createElement('a');
            a.href = entry.self
            a.textContent = entry.book;
            
            // Append all our elements
            span.appendChild(a);
            li.appendChild(span);
            ul.appendChild(li);
        })
    })
    .catch( error => console.error(error) );// If there is any error you will catch them here
    
}


/**
 * This function is called by clicking on the "insert book" button.
 * It creates a new book given the specified title,
 * and force the refresh of the whole list of books.
 */
function insertBook()
{
    //get the book title
    var bookTitle = document.getElementById("bookTitle").value;

    console.log(bookTitle);

    fetch('../api/v1/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify( { title: bookTitle } ),
    })
    .then((resp) => {
        console.log(resp);
        loadBooks();
        return;
    })
    .catch( error => console.error(error) ); // If there is any error you will catch them here

};