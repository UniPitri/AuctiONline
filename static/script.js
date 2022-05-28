var categoriaClick = 0;

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

function caricaAste() {
    if (sessionStorage.getItem("token")){
        document.getElementById("headerLoggati").hidden = false;
    }
    else{
        document.getElementById("headerSloggati").hidden = false;
    }
    const cardDeck = document.getElementById('cardDeck');
    fetch('../api/v1/aste?orderBy='+orderBy+'&order='+order, {
        method: 'GET',
    })
    .then((resp) => resp.json())
    .then(function (data) {   
        return data.map(function (asta) {
            let container = document.createElement('div');
            container.className = "container";
            container.style = "margin: 0";
            let row = document.createElement('div');
            row.className = "row";
            let div = document.createElement('div');
            div.className = "card rounded";
            div.style = "background-color: #38d996; cursor: pointer; margin: 1% 0%";
            let row2 = document.createElement('div');
            row2.className = "row no-gutters";
            let col1 = document.createElement('div');
            col1.className = "col-md-4";
            let imgProdotto = document.createElement('img');
            imgProdotto.src = "fotoProdotti/" + asta.dettagliProdotto.Foto[0];
            imgProdotto.style = "max-width: 100%";
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
                offer.value = asta.dettagliAsta.Offerte[0] + 0.01;
                offer.min = asta.dettagliAsta.Offerte[0] + 0.01;
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

            var now = new Date().getTime();
            if (new Date(asta.dettagliAsta.Inizio).getTime() > now) {
                if (asta.dettagliAsta.PrezzoMinimo != null)
                    p.innerHTML = "Prezzo minimo: " + asta.dettagliAsta.PrezzoMinimo + "€";
                else
                    p.innerHTML = "Prezzo minimo: X";

                countDownDate = new Date(asta.dettagliAsta.Inizio).getTime();
            } else {
                if (asta.dettagliAsta.Offerte.length != 0){
                    p.innerHTML = "Prezzo attuale: " + asta.dettagliAsta.Offerte[0] + "€";
                }
                else{
                    p.innerHTML = "Prezzo attuale: X";
                }
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

            var x = setInterval(function () {
                fetch('..'+asta.self, {
                    method: 'GET',
                })
                .then((resp) => resp.json())
                .then(function (data) { 
                    var now = new Date().getTime();

                    if (new Date(data.inizioAsta).getTime() > now) {
                        countDownDate = new Date(data.inizioAsta).getTime();
                    } else {
                        if (data.offerteAsta.length != 0){
                            p.innerHTML = "Prezzo attuale: " + data.offerteAsta[0] + "€";
                        }
                        countDownDate = new Date(data.fineAsta).getTime();
                        form.style = "display: show";
                    }

                    var distance = countDownDate - now;
                    var days = Math.floor(distance / (1000 * 60 * 60 * 24));
                    var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                    var seconds = Math.floor((distance % (1000 * 60)) / 1000);
                    p2.innerHTML = ((new Date(data.inizioAsta).getTime() > now) ? "L'asta inizierà tra: " : "Tempo rimanente: ") + days + "d " + hours + "h " + minutes + "m " + seconds + "s ";

                    if (distance < 0) {
                        clearInterval(x);
                        p2.innerHTML = "EXPIRED";
                    }
                });
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
                    img.onclick = function () {rimuoviPreferita(asta.idAsta) };
                    img.src = '/icone/Plain_Yellow_Star.png';
                }
                else{
                    img.onclick = function () {aggiungiPreferita(asta.idAsta) };
                    img.src = '/icone/star-empty.webp';
                }  
                img.id = "star"+asta.idAsta;                  
                img.style.height = '20px';
                img.style.width = '20px';
                img.style.width = '20px';
                img.style.position= 'absolute';
                img.style.top= '5px';
                img.style.right= '5px';
            }
            row.appendChild(div);
            container.appendChild(row);
            cardDeck.appendChild(container);
        })
    })
    .catch( error => console.error(error) );
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
    document.getElementById("star"+idAsta).onclick = function () {rimuoviPreferita(idAsta) };
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


function rimuoviPreferita(idAsta){
    document.getElementById("star"+idAsta).src = '/icone/star-empty.webp';
    document.getElementById("star"+idAsta).onclick = function () {aggiungiPreferita(idAsta) };
    fetch('../api/v1/astePreferite', {
        method: 'DELETE',
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
    .catch(error => console.error(error));
}

function caricaAsteVinte() {
    const cardDeck = document.getElementById('cardDeck');
    fetch('../api/v1/utenti/'+sessionStorage.getItem("id")+"/aste?get=vinte&orderBy="+orderBy+"&order="+order, {
        method: 'GET',
        headers: { 'x-access-token': sessionStorage.getItem("token")}
    })
    .then((resp) => resp.json())
    .then(function (data) {     
        if(data.length==0){
            document.getElementById('modalContent').className = 'modal-content bg-danger';
            document.getElementById('modalTitle').innerHTML = 'Nessun acquisto effetuato';     
            document.getElementById('message').innerHTML = "Al momento non sei riuscito a vincere alcuna asta.\nPartecipa subito ad un'asta per poter comprare il tuo primo oggetto!";
            $('#alert').modal('show');
        }
        else{
            return data.map(function (asta) { 
                let container = document.createElement('div');
                container.className = "container";
                container.style = "margin: 0";
                let row = document.createElement('div');
                row.className = "row";
                let div = document.createElement('div');
                div.className = "card rounded";
                div.style = "background-color: #38d996; cursor: pointer; margin: 1% 0%";
                let row2 = document.createElement('div');
                row2.className = "row no-gutters";
                let col1 = document.createElement('div');
                col1.className = "col-md-4";
                let imgProdotto = document.createElement('img');
                imgProdotto.src = "fotoProdotti/" + asta.dettagliProdotto.Foto[0];
                imgProdotto.style = "max-width: 100%";
                let col2 = document.createElement('div');
                col2.className = "col-md-8";
                let div2 = document.createElement('div');
                div2.className = "card-body";
                let h5 = document.createElement('h5');
                h5.className = "card-title";
                h5.innerHTML = asta.dettagliProdotto.Nome;
                let p = document.createElement('p');
                p.className = "card-text";
                p.innerHTML = "Costo: " + asta.offertaVincente + "€";
                let inizio = new Date(asta.inizioAsta);
                let p2 = document.createElement('p');
                p2.className = "card-text";
                p2.innerHTML = "Inizio asta: " + ("0" + (inizio.getDate() + 1 )).slice(-2)+"/" + ("0" + (inizio.getMonth() + 1 )).slice(-2) + "/" + inizio.getFullYear() + " - ore: " + ("0" + (inizio.getHours() + 1 )).slice(-2) + ":" + ("0" + (inizio.getMinutes() + 1 )).slice(-2);
                let fine = new Date(asta.fineAsta);
                let p3 = document.createElement('p');
                p3.className = "card-text";
                p3.innerHTML = "Fine asta: " + ("0" + (fine.getDate() + 1 )).slice(-2)+"/" + ("0" + (fine.getMonth() + 1 )).slice(-2) + "/" + fine.getFullYear() + " - ore: " + ("0" + (fine.getHours() + 1 )).slice(-2) + ":" + ("0" + (fine.getMinutes() + 1 )).slice(-2);
                let p4 = document.createElement('p');
                p4.className = "card-text";
                p4.innerHTML = "Tipo asta: " + (asta.tipoAsta ? "Asta \"inglese\"" : "Busta chiusa");
                let p5 = document.createElement('p');
                p5.className = "card-text";
                p5.innerHTML = "Venditore: " + asta.venditoreAsta.Username;
                
                div2.appendChild(h5);
                div2.appendChild(p);
                div2.appendChild(p2);
                div2.appendChild(p3);
                div2.appendChild(p4);  
                div2.appendChild(p5); 
                col2.appendChild(div2);         
                col1.appendChild(imgProdotto);
                row2.appendChild(col1);
                row2.appendChild(col2);
                div.appendChild(row2);
                row.appendChild(div);
                container.appendChild(row);
                cardDeck.appendChild(container);
            })
        }
    })
    .catch( error => console.error(error) );
}

var down = true;
var orderBy = document.getElementById("ordinamento").value;
var order = "asc";

function cambiaTriangolo(){
    if(down){
        document.getElementById("upTriangle").hidden = false;
        document.getElementById("downTriangle").hidden = true;
        down = false;
        order = "desc";
    }
    else{
        document.getElementById("downTriangle").hidden = false;
        document.getElementById("upTriangle").hidden = true;
        down = true;
        order = "asc";
    }
    document.getElementById("cardDeck").innerHTML="";
    caricaAste();
}

function newOrderBy(){
    orderBy = document.getElementById("ordinamento").value;
    document.getElementById("cardDeck").innerHTML="";
    caricaAste();
}

function cambiaTriangoloAcquisti(){
    if(down){
        document.getElementById("upTriangle").hidden = false;
        document.getElementById("downTriangle").hidden = true;
        down = false;
        order = "desc";
    }
    else{
        document.getElementById("downTriangle").hidden = false;
        document.getElementById("upTriangle").hidden = true;
        down = true;
        order = "asc";
    }
    document.getElementById("cardDeck").innerHTML="";
    caricaAsteVinte();
}

function newOrderByAcquisti(){
    orderBy = document.getElementById("ordinamento").value;
    document.getElementById("cardDeck").innerHTML="";
    caricaAsteVinte();
}