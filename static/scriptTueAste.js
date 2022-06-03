var down = true;
var orderBy = document.getElementById("ordinamento").value;
var order = "asc";
var refContainer = [];

function logout(){
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("email");
    sessionStorage.removeItem("id");
    sessionStorage.removeItem("self");
    window.location.href = "index.html";
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

function nuovaAsta(){
    window.location.href = "creazioneAsta.html?token="+sessionStorage.getItem("token");
}

function redirectSicuro(file){
    window.location.href = file+"?token="+sessionStorage.getItem("token");
}

function rimuoviPreferita(idAsta){
    fetch('../api/v1/astePreferite', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'x-access-token': sessionStorage.getItem("token")},
        body: JSON.stringify({ userID: sessionStorage.getItem("id"), idAsta: idAsta }),
    })
    .then((resp) => resp.json())
    .then(function (data) {
        if (data.success) {
            refContainer[idAsta].remove();
        } else {
            document.getElementById('message').innerHTML = data.message;
            $('#alert').modal('show');
        }
    })
    .catch(error => console.error(error));
}

function cambiaTriangolo(){
    if(down){
        down = false;
        order = "desc";
    }
    else{
        down = true;
        order = "asc";
    }
    document.getElementById("cardDeck").innerHTML="";
    caricaAstePreferite();
}

function newOrderBy(){
    orderBy = document.getElementById("ordinamento").value;
    document.getElementById("cardDeck").innerHTML="";
    caricaAstePreferite();
}

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
    caricaAstePreferite();
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


function caricaAstePreferite() {
    fetch('./api/v1/utenti/'+sessionStorage.getItem("id")+"/aste?get=preferite&orderBy="+orderBy+"&order="+order, {
        method: 'GET',
        headers: { 'x-access-token': sessionStorage.getItem("token")}
    })
    .then((resp) => resp.json())
    .then(function (data) {   
        return data.map(function (asta) {
            if(new Date(asta.dettagliAsta.Fine).getTime() >= new Date().getTime()){
                let container = document.createElement('div');
                refContainer[asta.idAsta] = container;
                container.className = "container";
                container.style = "margin: 0";
                let row = document.createElement('div');
                row.className = "row";
                let div = document.createElement('div');
                div.className = "card rounded";
                let colore;
                if(asta.dettagliAsta.Venditore == sessionStorage.getItem("id")){
                    colore = "#2c5e86";
                }
                else if(asta.dettagliAsta.Tipo == 0  || new Date(asta.dettagliAsta.Inizio).getTime() > new Date().getTime()){
                    colore = "#38d996";
                }
                else if(asta.dettagliAsta.Offerenti[0] != sessionStorage.getItem("id")){
                    colore = "#f24d3a"
                }
                else{
                    colore = "#f2c43a"
                }
                div.style = "background-color: "+colore+"; cursor: pointer; margin: 1% 0%";
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
                let offer = document.createElement('input');
                let form = document.createElement('div');

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
                            if(data.venditoreAsta._id == sessionStorage.getItem("id")){
                                colore = "#2c5e86";
                            }
                            else if(data.tipoAsta == 0){
                                colore = "#38d996";
                            }
                            else if(data.offerentiAsta[0] != sessionStorage.getItem("id")){
                                colore = "#f24d3a"
                            }
                            else{
                                colore = "#f2c43a"
                            }
                            div.style = "background-color: "+colore+"; cursor: pointer; margin: 1% 0%";
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
                form.appendChild(offer);
                col2.appendChild(div2);            
                col1.appendChild(imgProdotto);
                row2.appendChild(col1);
                row2.appendChild(col2);
                div.appendChild(row2);

                var img = document.createElement('img');
                div.appendChild(img);
                img.onclick = function () {rimuoviPreferita(asta.idAsta) };
                img.src = '/icone/Plain_Yellow_Star.png';
                img.id = "star"+asta.idAsta;                  
                img.style.height = '20px';
                img.style.width = '20px';
                img.style.width = '20px';
                img.style.position= 'absolute';
                img.style.top= '5px';
                img.style.right= '5px';
                row.appendChild(div);
                container.appendChild(row);
                cardDeck.appendChild(container);
            }
        })
    })
    .catch( error => console.error(error) );
}

function caricaPaginaDettagli(idAsta) {
    window.location.href = "/dettaglioAsta.html?idAsta=" + idAsta;
}