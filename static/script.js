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
function login() {
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
        if(data.success) {
            loggedUser.token = data.token;
            loggedUser.email = data.email;
            loggedUser.id = data.id;
            loggedUser.self = data.self;
            window.location.href = "index.html";
        } else {
            document.getElementById('message').innerHTML = data.message;
            $('#alert').modal('show');
        }
    })
    .catch( error => console.error(error) ); // If there is any error you will catch them here
};

function caricaAste() {
    const cardDeck = document.getElementById('cardDeck');
    fetch('../api/v1/aste', {
        method: 'GET',
    })
    .then((resp) => resp.json()) // Transform the data into json
    .then(function(data) { // Here you get the data to modify as you please        
        return data.map(function(asta) { // Map through the results and for each run the code below
            let container = document.createElement('div');
            container.className = "container";
            container.style = "margin: 0";
            let row = document.createElement('div');
            row.className = "row";
            let div = document.createElement('div');
            div.className = "card rounded";
            div.style = "background-color: #38d996; margin: 1% 0%";
            let div2 = document.createElement('div');
            div2.className = "card-body";
            let h5 = document.createElement('h5');
            h5.className = "card-title";
            h5.innerHTML = asta.dettagliProdotto.Nome;
            let p = document.createElement('p');
            p.className = "card-text";
            p.innerHTML = "Loading...";
            let p2 = document.createElement('p');
            p2.className = "card-text";
            p2.innerHTML = "Loading...";

            var x = setInterval(function() {
                var now = new Date().getTime();

                if(new Date(asta.dettagliAsta.Inizio).getTime() > now) {
                    if(asta.dettagliAsta.PrezzoMinimo != null)
                        p.innerHTML = "Prezzo minimo: " + asta.dettagliAsta.PrezzoMinimo + "€";
                    else{
                        p.innerHTML = "Prezzo minimo: X";
                    }

                    p2.innerHTML = "L'asta inizierà tra: ";
                    countDownDate = new Date(asta.dettagliAsta.Inizio).getTime();
                } else {
                    if(asta.dettagliAsta.PrezzoAttuale != null){
                        p.innerHTML = "Prezzo attuale: " + asta.dettagliAsta.PrezzoAttuale + "€";
                    }
                    else{
                        p.innerHTML = "Prezzo attuale: X";
                    }
                    p2.innerHTML = "Tempo rimanente: ";
                    countDownDate = new Date(asta.dettagliAsta.Fine).getTime();
                }

                var distance = countDownDate - now;
                var days = Math.floor(distance / (1000 * 60 * 60 * 24));
                var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                var seconds = Math.floor((distance % (1000 * 60)) / 1000);
                p2.innerHTML = ((new Date(asta.dettagliAsta.Inizio).getTime() > now) ? "L'asta inizierà tra: " : "Tempo rimanente: ") + days + "d " + hours + "h " + minutes + "m " + seconds + "s ";

                if(distance < 0) {
                    clearInterval(x);
                    p2.innerHTML = "EXPIRED";
                }

                console.log(distance);
            }, 1000);

            let p3 = document.createElement('p');
            p3.className = "card-text";
            p3.innerHTML = "Tipo asta: " + (asta.dettagliAsta.Tipo ? "Asta \"inglese\"" : "Busta chiusa");
            div2.appendChild(h5);
            div2.appendChild(p);
            div2.appendChild(p2);
            div2.appendChild(p3);
            div.appendChild(div2);
            row.appendChild(div);
            container.appendChild(row);
            cardDeck.appendChild(container);
        })
    })
    .catch( error => console.error(error) );// If there is any error you will catch them here
}

function nuovaAsta(){
    window.location.href = "creazioneAsta.html";
}