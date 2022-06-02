var categoriaClick = 0;
var areAuctionOpen = {};
var inizioAste = {};

function caricaPagina() {
    toastr.options = {
        "closeButton": true,
        "debug": false,
        "newestOnTop": true,
        "progressBar": false,
        "positionClass": "toast-bottom-right",
        "preventDuplicates": false,
        "onclick": null,
        "showDuration": "300",
        "hideDuration": "1000",
        "timeOut": "5000",
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut"
    }

    caricaHeader();
    caricaAste();
    caricaPannelloLaterale();
}

function caricaHeader() {
    if(sessionStorage.getItem("token")) {
        const items = document.querySelectorAll('.logged');

        items.forEach(item => {
            item.style.display = 'block';
        });
    } else {
        const items = document.querySelectorAll('.slogged');

        items.forEach(item => {
            item.style.display = 'block';
        });
    }
}

function caricaAste() {
    const cardDeck = document.getElementById('cardDeck');
    fetch('../api/v1/aste', {
        method: 'GET',
    })
    .then((resp) => resp.json()) // Transform the data into json
    .then(function (data) { // Here you get the data to modify as you please        
        return data.map(function (asta) { // Map through the results and for each run the code below
            let div = document.createElement('div');
            div.className = "card product rounded";
            //div.setAttribute('onclick', 'if(event.target.id != "input") window.location.href = "' + asta.self + '"');
            div.style = "background-color: #38d996; cursor: pointer; margin: 0 0 1% 0";
            let row2 = document.createElement('div');
            row2.className = "row g-0";
            let col1 = document.createElement('div');
            col1.className = "col-md-4";
            let imgProdotto = document.createElement('img');
            imgProdotto.className = "img-fluid rounded-start";
            imgProdotto.src = "fotoProdotti/" + asta.dettagliProdotto.Foto[0];
            let col2 = document.createElement('div');
            col2.className = "col-md-8";
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
            let offer = document.createElement('input');
            let form = document.createElement('div');
            form.style = "display: none";
            if(asta.dettagliAsta.Offerte.length != 0){
                offer.value = asta.dettagliAsta.Offerte[asta.dettagliAsta.Offerte.length-1] + 0.01;
                offer.min = asta.dettagliAsta.Offerte[asta.dettagliAsta.Offerte.length-1] + 0.01;
            }
            else{
                if(asta.dettagliAsta.PrezzoMinimo != null){
                    offer.value = asta.dettagliAsta.PrezzoMinimo + 0.01;
                    offer.min = asta.dettagliAsta.PrezzoMinimo + 0.01;
                }
                else{
                    offer.value = 0.01;
                    offer.min = 0.01;
                }
            }

            var x = setInterval(function () {
                var now = new Date().getTime();

                if (new Date(asta.dettagliAsta.Inizio).getTime() > now) {
                    if (asta.dettagliAsta.PrezzoMinimo != null)
                        p.innerHTML = "Prezzo minimo: " + asta.dettagliAsta.PrezzoMinimo + "€";
                    else
                        p.innerHTML = "Prezzo minimo: X";

                    p2.innerHTML = "L'asta inizierà tra: ";
                    countDownDate = new Date(asta.dettagliAsta.Inizio).getTime();
                } else {
                    if (asta.dettagliAsta.Offerte.length != 0){
                        p.innerHTML = "Prezzo attuale: " + asta.dettagliAsta.Offerte[asta.dettagliAsta.Offerte.length-1] + "€";
                    }
                    else{
                        p.innerHTML = "Prezzo attuale: X";
                    }
                    p2.innerHTML = "Tempo rimanente: ";
                    countDownDate = new Date(asta.dettagliAsta.Fine).getTime();
                    form.style = "display: show";
                }

                var distance = countDownDate - now;
                var days = Math.floor(distance / (1000 * 60 * 60 * 24));
                var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                var seconds = Math.floor((distance % (1000 * 60)) / 1000);
                p2.innerHTML = ((new Date(asta.dettagliAsta.Inizio).getTime() > now) ? "L'asta inizierà tra: " : "Tempo rimanente: ") + days + "d " + hours + "h " + minutes + "m " + seconds + "s ";

                if (distance < 0) {
                    clearInterval(x);
                    p2.innerHTML = "EXPIRED";
                }
            }, 1000);

            let p3 = document.createElement('p');
            p3.className = "card-text";
            p3.innerHTML = "Tipo asta: " + (asta.dettagliAsta.Tipo ? "Asta \"inglese\"" : "Busta chiusa");
            offer.id = "input";
            offer.step = ".01";
            offer.type = "number";
            let button = document.createElement('input');
            button.onclick = function() {
                offerta(asta.self, offer);
            }
            button.type = "submit";
            button.value = "Offri";
            div2.appendChild(h5);
            div2.appendChild(p);
            div2.appendChild(p2);
            div2.appendChild(p3);
            form.appendChild(offer);
            form.appendChild(button);
            div2.appendChild(form);
            col2.appendChild(div2);            
            col1.appendChild(imgProdotto);
            row2.appendChild(col1);
            row2.appendChild(col2);
            div.appendChild(row2);

            if (sessionStorage.getItem("token")) {
                var img = document.createElement('img');
                div.appendChild(img);

                if(asta.preferenze != null && asta.preferenze.includes(sessionStorage.getItem("id"))){
                    img.src = '/icone/Plain_Yellow_Star.png';
                } else{
                    img.onclick = function () {aggiungiPreferita(asta.idAsta) };
                    img.src = '/icone/star-empty.webp';
                }  

                img.id = "star"+asta.idAsta;                  
                img.style.height = '20px';
                img.style.width = '20px';
                img.style.position= 'absolute';
                img.style.top= '5px';
                img.style.right= '5px';
            }
            
            cardDeck.appendChild(div);
        })
    })
    .catch( error => console.error(error) );
}

function calcolaStringaDistanza(distanza) {
    var days = Math.floor(distance / (1000 * 60 * 60 * 24));
    var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((distance % (1000 * 60)) / 1000);
    return days + 'd ' + hours + 'h ' + minutes + 'm ' + seconds + 's';
}

function aggiornaValori(asta, timer, card) {
    now = new Date().getTime();
    inizioAste[asta.idAsta] = new Date(asta.dettagliAsta.Inizio).getTime();

    if((now > inizioAste[asta.idAsta]) != areAuctionOpen[asta.idAsta]) {
        areAuctionOpen[asta.idAsta] = (now > inizioAste[asta.idAsta]);
        toastr.info('L\'asta per <b>' + asta.dettagliProdotto.Nome + '</b> è iniziata', 'Asta aperta');
    }

    if(asta.dettagliAsta.Tipo == 0)
        fetch(asta.self + '?get=fine', {
            method: 'GET',
        })
        .then((resp) => resp.json()) // Transform the data into json
        .then(function(data) {
            distance = ((areAuctionOpen[asta.idAsta]) ? new Date(data.fine).getTime() - now : inizioAste[asta.idAsta] - now);
            timer.innerHTML = calcolaStringaDistanza();
        })
        .catch(error => console.error(error));
    else
        fetch(asta.self + '?get=valori', {
            method: 'GET',
        })
        .then((resp) => resp.json()) // Transform the data into json
        .then(function(data) {
            if(areAuctionOpen[asta.idAsta]) { // L'asta è aperta
                if(data.offerta != document.getElementById('prezzo' + asta.idAsta).innerHTML && data.offerente != sessionStorage.getItem('id'))
                    toastr.warning('Qualcuno ha offerto <b>' + data.offerta + '€</b> per <b>' + asta.dettagliProdotto.Nome + '</b>', 'Nuova offerta');

                distance = new Date(data.fine).getTime() - now;
                document.getElementById('prezzo' + asta.idAsta).innerHTML = data.offerta;
                card.style.backgroundColor = (data.offerente == sessionStorage.getItem('id') ? 'yellow' : 'red');
                document.getElementById('label' + asta.idAsta).innerHTML = 'attuale';
                //console.log('inizio per ' + asta.dettagliProdotto.Nome + ': ' + inizioAste[asta.idAsta]);
            } else { // L'asta non è ancora aperta
                distance = inizioAste[asta.idAsta] - now;
                document.getElementById('label' + asta.idAsta).innerHTML = 'minimo';
                //console.log('inizio per ' + asta.dettagliProdotto.Nome + ': ' + inizioAste[asta.idAsta]);
            }

            timer.innerHTML = calcolaStringaDistanza();
        })
        .catch(error => console.error(error));
}

function caricaPannelloLaterale() {
    const column2 = document.getElementById('col2');

    if(sessionStorage.getItem("token")) {
        let cardDeck = document.createElement('div');
        cardDeck.className = "card-deck";

        fetch('../api/v1/utenti/' + sessionStorage.getItem('id') + '/aste?get=aperte', {
            method: 'GET',
        })
        .then((resp) => resp.json()) // Transform the data into json
        .then(function (data) { // Here you get the data to modify as you please        
            return data.map(function (asta) { // Map through the results and for each run the code below
                let card = document.createElement('div');
                card.className = "card product rounded";
                //div.setAttribute('onclick', 'if(event.target.id != "input") window.location.href = "' + asta.self + '"');
                card.style = "background-color: #38d996; cursor: pointer; margin: 0 0 1% 0";
                let div2 = document.createElement('div');
                div2.className = "card-body";
                let h5 = document.createElement('h5');
                h5.className = "card-title";
                h5.innerHTML = asta.dettagliProdotto.Nome;
                let p = document.createElement('p');
                p.className = "card-text";
                p.innerHTML = 'Prezzo <span id="label' + asta.idAsta + '"></span>: <span id="prezzo' + asta.idAsta + '">' + ((asta.dettagliAsta.PrezzoMinimo) ? asta.dettagliAsta.PrezzoMinimo : '' ) + '</span>€';
                let p2 = document.createElement('p');
                p2.className = "card-text";
                p2.innerHTML = 'Tempo rimanente: ';
                let timer = document.createElement('span');
                now = new Date().getTime();
                inizioAste[asta.idAsta] = new Date(asta.dettagliAsta.Inizio).getTime();
                areAuctionOpen[asta.idAsta] = (now > inizioAste[asta.idAsta]);

                if(asta.dettagliAsta.Tipo == 0)
                    fetch(asta.self + '?get=fine', {
                        method: 'GET',
                    })
                    .then((resp) => resp.json()) // Transform the data into json
                    .then(function(data) {
                        distance = ((areAuctionOpen[asta.idAsta]) ? new Date(data.fine).getTime() - now : inizioAste[asta.idAsta] - now);
                        timer.innerHTML = calcolaStringaDistanza();
                    })
                    .catch(error => console.error(error));
                else
                    fetch(asta.self + '?get=valori', {
                        method: 'GET',
                    })
                    .then((resp) => resp.json()) // Transform the data into json
                    .then(function(data) {
                        if(areAuctionOpen[asta.idAsta]) { // L'asta è aperta
                            distance = new Date(data.fine).getTime() - now;
                            document.getElementById('prezzo' + asta.idAsta).innerHTML = data.offerta;
                            card.style.backgroundColor = (data.offerente == sessionStorage.getItem('id') ? 'yellow' : 'red');
                            document.getElementById('label' + asta.idAsta).innerHTML = 'attuale';
                        } else { // L'asta non è ancora aperta
                            distance = inizioAste[asta.idAsta] - now;
                            document.getElementById('label' + asta.idAsta).innerHTML = 'minimo';
                        }
                        
                        timer.innerHTML = calcolaStringaDistanza();
                    })
                    .catch(error => console.error(error));

                var x = setInterval(function() {
                    aggiornaValori(asta, timer, card);
                }, 1000);
                
                p2.appendChild(timer);
                div2.appendChild(h5);
                div2.appendChild(p);
                div2.appendChild(p2);
                card.appendChild(div2);
                cardDeck.appendChild(card);
                column2.appendChild(cardDeck);
            })
        })
        .catch( error => console.error(error) );
    } else {
        let card = document.createElement('div');
        card.className = "card rounded text-center";
        card.style = "align-items: center; background-color: #38d996; display: flex; height: 90%; justify-content: center; position: fixed; width: 30%";
        let message = document.createElement('h1');
        message.className = "card-title";
        message.innerHTML = '<a href="login.html">Crea il tuo account</a> e partecipa anche tu!';
        card.appendChild(message);
        column2.appendChild(card);
    }
}

function login() {
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;

    if(username == ""){
        window.alert("Devi inserire un username");
    }
    else if(password == ""){
        window.alert("Devi inserire una password");
    }
    else{
        fetch('../api/v1/autenticazione', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify( { username: username, password: password } ),
        })
        .then((resp) => resp.json())
        .then(function(data) {
            if(data.success) {
                sessionStorage.setItem("token",data.token);
                sessionStorage.setItem("email",data.email);
                sessionStorage.setItem("id",data.id);
                sessionStorage.setItem("self",data.self);
                window.location.href = "index.html";
            } else {
                document.getElementById('message').innerHTML = data.message;
                $('#alert').modal('show');
            }
        })
        .catch(error => console.error(error));
    }
};

function logout(){
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("email");
    sessionStorage.removeItem("id");
    sessionStorage.removeItem("self");
    window.location.href = "index.html";
}

function register() {
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;
    var email = document.getElementById("email").value;

    if (username == ""){
        window.alert("E' richiesto l'username!");
    }
    else if(password == ""){
        window.alert("E' richiesta la password!");
    }
    else if(email == ""){
        window.alert("E' richiesta la mail!");
    }
    else{
        fetch('../api/v1/registrazione', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify( { username: username, password: password, email:email } ),
        })
        .then((resp) => resp.json())
        .then(function(data) {
            if(data.success) {
                sessionStorage.setItem("token",data.token);
                sessionStorage.setItem("email",data.email);
                sessionStorage.setItem("id",data.id);
                sessionStorage.setItem("self",data.self);
                window.location.href = "index.html";
            } else {
                document.getElementById('message').innerHTML = data.message;
                $('#alert').modal('show');
            }
        })
        .catch( error => console.error(error) );
    }
}

function offerta(asta, prezzo) {
    if(sessionStorage.getItem('id') == null)
        window.location.href = 'login.html';
    else if(prezzo.value %1 != 0 && prezzo.value.split('.')[1].length > 2) {
        document.getElementById('modalContent').className = 'modal-content bg-danger';
        document.getElementById('modalTitle').innerHTML = 'Errore';
        document.getElementById('message').innerHTML = 'Massimo due decimali';
        $('#alert').modal('show');
    } else
        fetch(asta, {
            method: 'PUT',
            headers: {
                'x-access-token': sessionStorage.getItem("token"),
                'id-account': sessionStorage.getItem("id"),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify( { prezzo: prezzo.value } ),
        })
        .then((resp) => resp.json())
        .then(function(data) {
            if(data.success) {
                document.getElementById('modalContent').className = 'modal-content bg-success';
                document.getElementById('modalTitle').innerHTML = 'Successo';
            } else {
                document.getElementById('modalContent').className = 'modal-content bg-danger';
                document.getElementById('modalTitle').innerHTML = 'Errore';
            }
            
            document.getElementById('message').innerHTML = data.message;
            $('#alert').modal('show');
        })
        .catch( error => console.error(error) );
}

function redirect2(e, n) {
    if (e.target.id != "input")
        alert(n);
}

function nuovaAsta(){
    window.location.href = "creazioneAsta.html?token="+sessionStorage.getItem("token");
}

function annullaCreazioneAsta(){
    window.location.href = "index.html";
}

function cardAstaOn(){
    document.getElementById("cardProdotto").hidden = true;
    document.getElementById("cardAsta").hidden = false;
}

function cardProdottoOn(){
    document.getElementById("cardAsta").hidden = true;
    document.getElementById("cardProdotto").hidden = false;
}

function creaAsta(){
    var nomeProdotto = document.getElementById("nomeProdotto").value;
    var descrizioneProdotto = document.getElementById("descrizioneProdotto").value;
    var immaginiProdotto = document.getElementById("immagineProdotto").files[0];
    var inizioAsta = document.getElementById("inizioAsta").value;
    var fineAsta = document.getElementById("fineAsta").value;
    var tipoAsta = document.querySelector('input[name="tipoAsta"]:checked').value;
    var prezzoMinimoProdotto = document.getElementById("prezzoMinimo").value;

    if (nomeProdotto == "" || descrizioneProdotto == "" || !immaginiProdotto || !inizioAsta || !fineAsta){
        window.alert("Devi compilare tutti i campi obbligatori!");
    }
    else{
        var fd = new FormData();
        fd.append("nome", nomeProdotto);

        for(let i = 0; i <= categoriaClick && i < 4; i++){
            fd.append("categoria", document.getElementById("categoriaProdotto"+i).value);
        }

        fd.append("descrizione", descrizioneProdotto);
        fd.append("foto", immaginiProdotto);
        fd.append("inizio", inizioAsta);
        fd.append("fine", fineAsta);
        fd.append("tipo",tipoAsta);
        fd.append("prezzoMinimo", (prezzoMinimoProdotto) ? prezzoMinimoProdotto : null);

        fetch('../api/v1/aste', {
            method: 'POST',
            headers: {
                'x-access-token': sessionStorage.getItem("token"),
                'id-account': sessionStorage.getItem("id")
            },
            body: fd
        })
        .then((resp) => resp.json())
        .then(function(data) {
            window.alert(data.message);
            if(data.success){
                window.location.href = "index.html";
            }
        })
        .catch(error => console.error(error));
    }
}

function extraCategoriaClick(){
    if (categoriaClick < 3){
        document.getElementById("menoCategoria").hidden = false;
        categoriaClick++;
        document.getElementById("categoriaProdotto"+categoriaClick).hidden = false;
        if (categoriaClick == 3){
            document.getElementById("extraCategoria").hidden = true;
        }
    }
}

function menoCategoriaClick(){
    if (categoriaClick > 0){
        document.getElementById("extraCategoria").hidden = false;
        document.getElementById("categoriaProdotto"+categoriaClick).hidden = true;
        categoriaClick--;
        if (categoriaClick == 0){
            document.getElementById("menoCategoria").hidden = true;
        }
    }
}

function redirectSicuro(file){
    window.location.href = file+"?token="+sessionStorage.getItem("token");
}

function aggiungiPreferita(idAsta){
    document.getElementById("star"+idAsta).src = '/icone/Plain_Yellow_Star.png';
    document.getElementById("star"+idAsta).onclick = null;
    fetch('../api/v1/astePreferite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-access-token': sessionStorage.getItem("token")},
        body: JSON.stringify({ userID: sessionStorage.getItem("id"), idAsta: idAsta }),
    })
    .then((resp) => resp.json())
    .then(function (data) {
        if (data.success) {
        } else {
            document.getElementById('message').innerHTML = data.message;
            $('#alert').modal('show');
        }
    })
    .catch(error => console.error(error)); // If there is any error you will catch them here
}