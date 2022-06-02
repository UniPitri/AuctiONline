var down = true;
var orderBy = document.getElementById("ordinamento").value;
var order = "asc";

function logout() {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("email");
    sessionStorage.removeItem("id");
    sessionStorage.removeItem("self");
    window.location.href = "index.html";
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
            h5.onclick = function () {caricaPaginaDettagli(asta.idAsta)};
            h5.className = "card-title";
            h5.innerHTML = asta.dettagliProdotto.Nome;
            let p = document.createElement('p');
            p.className = "card-text";
            p.innerHTML = "Loading...";
            let p2 = document.createElement('p');
            p2.className = "card-text";
            p2.innerHTML = "Loading...";
    
            var now = new Date().getTime();
            if (new Date(asta.dettagliAsta.Inizio).getTime() > now) {
                if (asta.dettagliAsta.PrezzoMinimo != null)
                    p.innerHTML = "Prezzo minimo: " + asta.dettagliAsta.PrezzoMinimo + "€";
                else
                    p.innerHTML = "Prezzo minimo: X";

                countDownDate = new Date(asta.dettagliAsta.Inizio).getTime();
            } else {
                if ((asta.dettagliAsta.Tipo == 1 || asta.dettagliAsta.Venditore == sessionStorage.getItem("id")) && asta.dettagliAsta.Offerte.length != 0){
                    p.innerHTML = "Prezzo attuale: " + asta.dettagliAsta.Offerte[0] + "€";
                }
                else{
                    p.innerHTML = "Prezzo attuale: X";
                }
                countDownDate = new Date(asta.dettagliAsta.Fine).getTime();
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
                        if ((data.tipoAsta == 1 || data.venditoreAsta._id == sessionStorage.getItem("id")) && data.offerteAsta.length != 0){
                            p.innerHTML = "Prezzo attuale: " + data.offerteAsta[0] + "€";
                        }
                        countDownDate = new Date(data.fineAsta).getTime();
                    }

                    var distance = countDownDate - now;
                    var days = Math.floor(distance / (1000 * 60 * 60 * 24));
                    var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                    var seconds = Math.floor((distance % (1000 * 60)) / 1000);
                    p2.innerHTML = ((new Date(data.inizioAsta).getTime() > now) ? "L'asta inizierà tra: " : "Tempo rimanente: ") + days + "d " + hours + "h " + minutes + "m " + seconds + "s ";

                    if (distance < 0) {
                        clearInterval(x);
                        container.remove();
                    }
                });
            }, 1000);

            let p3 = document.createElement('p');
            p3.className = "card-text";
            p3.innerHTML = "Tipo asta: " + (asta.dettagliAsta.Tipo ? "Asta \"inglese\"" : "Busta chiusa");
            div2.appendChild(h5);
            div2.appendChild(p);
            div2.appendChild(p2);
            div2.appendChild(p3);
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

function redirectSicuro(file) {
    window.location.href = file + "?token=" + sessionStorage.getItem("token");
}

function aggiungiPreferita(idAsta){
    document.getElementById("star"+idAsta).src = '/icone/Plain_Yellow_Star.png';
    document.getElementById("star"+idAsta).onclick = function () {rimuoviPreferita(idAsta) };
    fetch('../api/v1/astePreferite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-access-token': sessionStorage.getItem("token") },
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

function caricaPaginaDettagli(idAsta) {

    window.location.href = "/dettaglioAsta.html?idAsta=" + idAsta;
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