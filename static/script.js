var categoriaClick = 0;
var areAuctionOpen = {};
var inizioAste = {};
var down = true;
var orderBy = document.getElementById("ordinamento").value;
var order = "asc";
var refCard = [];
var refInterval = []
var refIntervalCat = []
var eBusta = "";
var eInglese = "";
var eCollezionismo = "";
var eVinile = "";
var eArte = "";
var eAntico = "";
var ePrezzo = "";

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
    caricaFiltri();
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

function caricaFiltri(){
    document.getElementById("cbBustaChiusa").checked = true;
    document.getElementById("cbAstaInglese").checked = true;
    document.getElementById("cbCollezionismo").checked = true;
    document.getElementById("cbVinile").checked = true;
    document.getElementById("cbArte").checked = true;
    document.getElementById("cbAntico").checked = true;
    document.getElementById("prezzoMassimo").value = 100;
    document.getElementById("outPrezzoMassimo").value = "100k €";
    eBusta = "";
    eInglese = "";
    eCollezionismo = "";
    eVinile = "";
    eArte = "";
    eAntico = "";
    ePrezzo = "";
}

function logout() {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("email");
    sessionStorage.removeItem("id");
    sessionStorage.removeItem("self");
    window.location.href = "index.html";
}

function caricaAste() {
    let i = 0;
    const cardDeck = document.getElementById('cardDeck');
    fetch('../api/v1/aste?orderBy='+orderBy+'&order='+order+eBusta+eInglese+eCollezionismo+eVinile+eAntico+eArte+ePrezzo, {
        method: 'GET',
    })
    .then((resp) => resp.json()) // Transform the data into json
    .then(function (data) { // Here you get the data to modify as you please        
        return data.map(function (asta) { // Map through the results and for each run the code below
            let div = document.createElement('div');
            div.className = "card product rounded";
            //div.setAttribute('onclick', 'if(event.target.id != "input") window.location.href = "' + asta.self + '"');
            div.style = "background-color: #38d996; margin: 0 0 1% 0";
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
            h5.onclick = function () {caricaPaginaDettagli(asta.idAsta)};
            h5.className = "card-title";
            h5.innerHTML = asta.dettagliProdotto.Nome;
            h5.style = "cursor: pointer";
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

                    if (new Date(data.inizioAsta).getTime() > now && distance < 0) {
                        clearInterval(x);
                        div.remove();
                    }
                });
            }, 1000);

            refIntervalCat[i] = x; 

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
            i++;
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
        let p2 = document.getElementById("p2"+asta.idAsta);
        p2.innerHTML = 'Tempo rimanente: ';
        p2.appendChild(timer);
    }

    if (asta.dettagliAsta.Venditore == sessionStorage.getItem("id")){
        fetch(asta.self + '?get=valori', {
            method: 'GET'
        })
        .then((resp) => resp.json()) // Transform the data into json
        .then(function(data) {
            if(areAuctionOpen[asta.idAsta]) { // L'asta è aperta
                if(data.offerta != '' && data.offerta != document.getElementById('prezzo' + asta.idAsta).innerHTML && data.offerente != sessionStorage.getItem('id'))
                    toastr.warning('Qualcuno ha offerto <b>' + data.offerta + '€</b> per <b>' + asta.dettagliProdotto.Nome + '</b>', 'Nuova offerta');
                distance = new Date(data.fine).getTime() - now;
                document.getElementById('prezzo' + asta.idAsta).innerHTML = (data.offerta != '' ? data.offerta : 0);
                document.getElementById('label' + asta.idAsta).innerHTML = 'attuale';
            } else { // L'asta non è ancora aperta
                distance = inizioAste[asta.idAsta] - now;
                document.getElementById('label' + asta.idAsta).innerHTML = 'minimo';
            }
            
            timer.innerHTML = calcolaStringaDistanza();
            if(areAuctionOpen[asta.idAsta] && timer.innerHTML == "0d 0h 0m 0s"){
                clearInterval(refInterval[asta.idAsta]);
                refCard[asta.idAsta].remove();
            }
        })
        .catch(error => console.error(error));
    }
    else if(asta.dettagliAsta.Tipo == 0)
        fetch(asta.self + '?get=fine', {
            method: 'GET'
        })
        .then((resp) => resp.json()) // Transform the data into json
        .then(function(data) {
            distance = ((areAuctionOpen[asta.idAsta]) ? new Date(data.fine).getTime() - now : inizioAste[asta.idAsta] - now);
            timer.innerHTML = calcolaStringaDistanza();
            if(areAuctionOpen[asta.idAsta] && timer.innerHTML == "0d 0h 0m 0s"){
                clearInterval(refInterval[asta.idAsta]);
                refCard[asta.idAsta].remove();
            }
        })
        .catch(error => console.error(error));
    else
        fetch(asta.self + '?get=valori', {
            method: 'GET'
        })
        .then((resp) => resp.json()) // Transform the data into json
        .then(function(data) {
            if(areAuctionOpen[asta.idAsta]) { // L'asta è aperta
                if(data.offerta != '' && data.offerta != document.getElementById('prezzo' + asta.idAsta).innerHTML && data.offerente != sessionStorage.getItem('id'))
                    toastr.warning('Qualcuno ha offerto <b>' + data.offerta + '€</b> per <b>' + asta.dettagliProdotto.Nome + '</b>', 'Nuova offerta');

                distance = new Date(data.fine).getTime() - now;
                document.getElementById('prezzo' + asta.idAsta).innerHTML = (data.offerta != '' ? data.offerta : 0);
                card.style.backgroundColor = (data.offerente == sessionStorage.getItem('id') ? '#f2c43a' : '#f24d3a');
                document.getElementById('label' + asta.idAsta).innerHTML = 'attuale';
                //console.log('inizio per ' + asta.dettagliProdotto.Nome + ': ' + inizioAste[asta.idAsta]);
            } else { // L'asta non è ancora aperta
                distance = inizioAste[asta.idAsta] - now;
                document.getElementById('label' + asta.idAsta).innerHTML = 'minimo';
                //console.log('inizio per ' + asta.dettagliProdotto.Nome + ': ' + inizioAste[asta.idAsta]);
            }

            timer.innerHTML = calcolaStringaDistanza();
            if(areAuctionOpen[asta.idAsta] && timer.innerHTML == "0d 0h 0m 0s"){
                clearInterval(refInterval[asta.idAsta]);
                refCard[asta.idAsta].remove();
            }
        })
        .catch(error => console.error(error));
}

function caricaPannelloLaterale() {
    const column2 = document.getElementById('col2');

    if(sessionStorage.getItem("token")) {
        let cardDeck = document.createElement('div');
        cardDeck.className = "card-deck";
        cardDeck.id = "card-deck";

        let cardTitolo = document.createElement('div');
        let divTitolo = document.createElement('div');
        divTitolo.className = "card-body";
        divTitolo.style = "text-align: center"
        let h5 = document.createElement('h5');
        h5.className = "card-title";
        h5.innerHTML = "<b>Le tue aste:</b>";    
        divTitolo.appendChild(h5);
        cardTitolo.appendChild(divTitolo)
        cardDeck.appendChild(cardTitolo);

        fetch('../api/v1/utenti/' + sessionStorage.getItem('id') + '/aste?get=preferite', {
            method: 'GET',
            headers: { 'x-access-token': sessionStorage.getItem("token")}
        })
        .then((resp) => resp.json()) // Transform the data into json
        .then(function (data) { // Here you get the data to modify as you please    
            return data.map(function (asta) { // Map through the results and for each run the code below
                let card = document.createElement('div');
                refCard[asta.idAsta] = card;
                card.className = "card product rounded";
                //div.setAttribute('onclick', 'if(event.target.id != "input") window.location.href = "' + asta.self + '"');
                card.style = "background-color: #38d996; cursor: pointer; margin: 0 0 1% 0";
                let div2 = document.createElement('div');
                div2.className = "card-body";
                let h5 = document.createElement('h5');
                h5.className = "card-title";
                h5.innerHTML = asta.dettagliProdotto.Nome;
                h5.onclick = function () {caricaPaginaDettagli(asta.idAsta)};
                let p = document.createElement('p');
                p.className = "card-text";
                p.innerHTML = 'Prezzo <span id="label' + asta.idAsta + '">'+ (asta.dettagliAsta.Tipo ? '' : 'minimo') + '</span>: <span id="prezzo' + asta.idAsta + '">' + ((asta.dettagliAsta.PrezzoMinimo) ? asta.dettagliAsta.PrezzoMinimo : 0 ) + '</span>€';
                let p2 = document.createElement('p'); 
                p2.id = "p2"+asta.idAsta;
                p2.className = "card-text";
                let timer = document.createElement('span');
                now = new Date().getTime();
                inizioAste[asta.idAsta] = new Date(asta.dettagliAsta.Inizio).getTime();
                areAuctionOpen[asta.idAsta] = (now > inizioAste[asta.idAsta]);
                p2.innerHTML = (areAuctionOpen[asta.idAsta]) ? 'Tempo rimanente: ' : "L'asta inizierà tra: ";
                
                if (asta.dettagliAsta.Venditore == sessionStorage.getItem("id")){
                    fetch(asta.self + '?get=valori', {
                        method: 'GET'
                    })
                    .then((resp) => resp.json()) // Transform the data into json
                    .then(function(data) {
                        if(areAuctionOpen[asta.idAsta]) { // L'asta è aperta
                            distance = new Date(data.fine).getTime() - now;
                            document.getElementById('prezzo' + asta.idAsta).innerHTML = (data.offerta != '' ? data.offerta : 0);
                            document.getElementById('label' + asta.idAsta).innerHTML = 'attuale';
                        } else { // L'asta non è ancora aperta
                            distance = inizioAste[asta.idAsta] - now;
                            document.getElementById('label' + asta.idAsta).innerHTML = 'minimo';
                        }
                        card.style.backgroundColor = "#2c5e86"
                        timer.innerHTML = calcolaStringaDistanza();
                    })
                    .catch(error => console.error(error));
                }
                else if(asta.dettagliAsta.Tipo == 0)
                    fetch(asta.self + '?get=fine', {
                        method: 'GET'
                    })
                    .then((resp) => resp.json()) // Transform the data into json
                    .then(function(data) {
                        distance = ((areAuctionOpen[asta.idAsta]) ? new Date(data.fine).getTime() - now : inizioAste[asta.idAsta] - now);
                        timer.innerHTML = calcolaStringaDistanza();
                    })
                    .catch(error => console.error(error));
                else
                    fetch(asta.self + '?get=valori', {
                        method: 'GET'
                    })
                    .then((resp) => resp.json()) // Transform the data into json
                    .then(function(data) {
                        if(areAuctionOpen[asta.idAsta]) { // L'asta è aperta
                            distance = new Date(data.fine).getTime() - now;
                            document.getElementById('prezzo' + asta.idAsta).innerHTML = (data.offerta != '' ? data.offerta : 0);
                            card.style.backgroundColor = (data.offerente == sessionStorage.getItem('id') ? '#f2c43a' : '#f24d3a');
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

                refInterval[asta.idAsta] = x;
                
                p2.appendChild(timer);
                div2.appendChild(h5);
                div2.appendChild(p);
                div2.appendChild(p2);
                card.appendChild(div2);
                cardDeck.appendChild(card);
            })
        })
        .catch( error => console.error(error) );
        column2.appendChild(cardDeck);
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

function aggiornaValoriNuovaCard(asta, timer, card) {
    now = new Date().getTime();
    inizioAste[asta.idAsta] = new Date(asta.inizioAsta).getTime();

    if((now > inizioAste[asta.idAsta]) != areAuctionOpen[asta.idAsta]) {
        areAuctionOpen[asta.idAsta] = (now > inizioAste[asta.idAsta]);
        toastr.info('L\'asta per <b>' + asta.dettagliProdotto.Nome + '</b> è iniziata', 'Asta aperta');
        let p2 = document.getElementById("p2"+asta.idAsta);
        p2.innerHTML = 'Tempo rimanente: ';
        p2.appendChild(timer);
    }

    if (asta.venditoreAsta._id == sessionStorage.getItem("id")){
        fetch(asta.self + '?get=valori', {
            method: 'GET'
        })
        .then((resp) => resp.json()) // Transform the data into json
        .then(function(data) {
            if(areAuctionOpen[asta.idAsta]) { // L'asta è aperta
                if(data.offerta != '' && data.offerta != document.getElementById('prezzo' + asta.idAsta).innerHTML && data.offerente != sessionStorage.getItem('id'))
                    toastr.warning('Qualcuno ha offerto <b>' + data.offerta + '€</b> per <b>' + asta.dettagliProdotto.Nome + '</b>', 'Nuova offerta');
                distance = new Date(data.fine).getTime() - now;
                document.getElementById('prezzo' + asta.idAsta).innerHTML = (data.offerta != '' ? data.offerta : 0);
                document.getElementById('label' + asta.idAsta).innerHTML = 'attuale';
            } else { // L'asta non è ancora aperta
                distance = inizioAste[asta.idAsta] - now;
                document.getElementById('label' + asta.idAsta).innerHTML = 'minimo';
            }
            
            timer.innerHTML = calcolaStringaDistanza();
            if(areAuctionOpen[asta.idAsta] && timer.innerHTML == "0d 0h 0m 0s"){
                clearInterval(refInterval[asta.idAsta]);
                refCard[asta.idAsta].remove();
            }
        })
        .catch(error => console.error(error));
    }
    else if(asta.tipoAsta == 0)
        fetch(asta.self + '?get=fine', {
            method: 'GET'
        })
        .then((resp) => resp.json()) // Transform the data into json
        .then(function(data) {
            distance = ((areAuctionOpen[asta.idAsta]) ? new Date(data.fine).getTime() - now : inizioAste[asta.idAsta] - now);
            timer.innerHTML = calcolaStringaDistanza();
            if(areAuctionOpen[asta.idAsta] && timer.innerHTML == "0d 0h 0m 0s"){
                clearInterval(refInterval[asta.idAsta]);
                refCard[asta.idAsta].remove();
            }
        })
        .catch(error => console.error(error));
    else
        fetch(asta.self + '?get=valori', {
            method: 'GET'
        })
        .then((resp) => resp.json()) // Transform the data into json
        .then(function(data) {
            if(areAuctionOpen[asta.idAsta]) { // L'asta è aperta
                if(data.offerta != '' && data.offerta != document.getElementById('prezzo' + asta.idAsta).innerHTML && data.offerente != sessionStorage.getItem('id'))
                    toastr.warning('Qualcuno ha offerto <b>' + data.offerta + '€</b> per <b>' + asta.dettagliProdotto.Nome + '</b>', 'Nuova offerta');

                distance = new Date(data.fine).getTime() - now;
                document.getElementById('prezzo' + asta.idAsta).innerHTML = (data.offerta != '' ? data.offerta : 0);
                card.style.backgroundColor = (data.offerente == sessionStorage.getItem('id') ? '#f2c43a' : '#f24d3a');
                document.getElementById('label' + asta.idAsta).innerHTML = 'attuale';
                //console.log('inizio per ' + asta.dettagliProdotto.Nome + ': ' + inizioAste[asta.idAsta]);
            } else { // L'asta non è ancora aperta
                distance = inizioAste[asta.idAsta] - now;
                document.getElementById('label' + asta.idAsta).innerHTML = 'minimo';
                //console.log('inizio per ' + asta.dettagliProdotto.Nome + ': ' + inizioAste[asta.idAsta]);
            }

            timer.innerHTML = calcolaStringaDistanza();
            if(areAuctionOpen[asta.idAsta] && timer.innerHTML == "0d 0h 0m 0s"){
                clearInterval(refInterval[asta.idAsta]);
                refCard[asta.idAsta].remove();
            }
        })
        .catch(error => console.error(error));
}

function aggiuniCard(idAsta){
    fetch('../api/v1/aste/' + idAsta, {
        method: 'GET'
    })
    .then((resp) => resp.json()) // Transform the data into json
    .then(function (asta) { // Here you get the data to modify as you please    
        let cardDeck = document.getElementById("card-deck");
        let card = document.createElement('div');
        refCard[asta.idAsta] = card;
        card.className = "card product rounded";
        //div.setAttribute('onclick', 'if(event.target.id != "input") window.location.href = "' + asta.self + '"');
        card.style = "background-color: #38d996; cursor: pointer; margin: 0 0 1% 0";
        let div2 = document.createElement('div');
        div2.className = "card-body";
        let h5 = document.createElement('h5');
        h5.className = "card-title";
        h5.innerHTML = asta.dettagliProdotto.Nome;
        h5.onclick = function () {caricaPaginaDettagli(asta.idAsta)};
        let p = document.createElement('p');
        p.className = "card-text";
        p.innerHTML = 'Prezzo <span id="label' + asta.idAsta + '">'+ (asta.tipoAsta ? '' : 'minimo') + '</span>: <span id="prezzo' + asta.idAsta + '">' + ((asta.prezzoMinimo) ? asta.prezzoMinimo : 0 ) + '</span>€';
        let p2 = document.createElement('p');
        p2.id = "p2"+asta.idAsta;
        p2.className = "card-text";
        let timer = document.createElement('span');
        now = new Date().getTime();
        inizioAste[asta.idAsta] = new Date(asta.inizioAsta).getTime();
        areAuctionOpen[asta.idAsta] = (now > inizioAste[asta.idAsta]);
        p2.innerHTML = (areAuctionOpen[asta.idAsta]) ? 'Tempo rimanente: ' : "L'asta inizierà tra: ";

        if (asta.venditoreAsta._id == sessionStorage.getItem("id")){
            fetch(asta.self + '?get=valori', {
                method: 'GET'
            })
            .then((resp) => resp.json()) // Transform the data into json
            .then(function(data) {
                if(areAuctionOpen[asta.idAsta]) { // L'asta è aperta
                    distance = new Date(data.fine).getTime() - now;
                    document.getElementById('prezzo' + asta.idAsta).innerHTML = (data.offerta != '' ? data.offerta : 0);
                    card.style.backgroundColor = "#2c5e86"
                    document.getElementById('label' + asta.idAsta).innerHTML = 'attuale';
                } else { // L'asta non è ancora aperta
                    distance = inizioAste[asta.idAsta] - now;
                    document.getElementById('label' + asta.idAsta).innerHTML = 'minimo';
                }
                
                timer.innerHTML = calcolaStringaDistanza();
            })
            .catch(error => console.error(error));
        }
        else if(asta.tipoAsta == 0)
            fetch(asta.self + '?get=fine', {
                method: 'GET'
            })
            .then((resp) => resp.json()) // Transform the data into json
            .then(function(data) {
                distance = ((areAuctionOpen[asta.idAsta]) ? new Date(data.fine).getTime() - now : inizioAste[asta.idAsta] - now);
                timer.innerHTML = calcolaStringaDistanza();
            })
            .catch(error => console.error(error));
        else
            fetch(asta.self + '?get=valori', {
                method: 'GET'
            })
            .then((resp) => resp.json()) // Transform the data into json
            .then(function(data) {
                if(areAuctionOpen[asta.idAsta]) { // L'asta è aperta
                    distance = new Date(data.fine).getTime() - now;
                    document.getElementById('prezzo' + asta.idAsta).innerHTML = (data.offerta != '' ? data.offerta : 0);
                    card.style.backgroundColor = (data.offerente == sessionStorage.getItem('id') ? '#f2c43a' : '#f24d3a');
                    document.getElementById('label' + asta.idAsta).innerHTML = 'attuale';
                } else { // L'asta non è ancora aperta
                    distance = inizioAste[asta.idAsta] - now;
                    document.getElementById('label' + asta.idAsta).innerHTML = 'minimo';
                }
                
                timer.innerHTML = calcolaStringaDistanza();
            })
            .catch(error => console.error(error));

        var x = setInterval(function() {
            aggiornaValoriNuovaCard(asta, timer, card);
        }, 1000);

        refInterval[asta.idAsta] = x; 
        
        p2.appendChild(timer);
        div2.appendChild(h5);
        div2.appendChild(p);
        div2.appendChild(p2);
        card.appendChild(div2);
        cardDeck.appendChild(card);
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
                aggiuniCard(idAsta)
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
            clearInterval(refInterval[idAsta]);
            refCard[idAsta].remove();
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
    for(let i = 0; i < refIntervalCat.length; i++){
        clearInterval(refIntervalCat[i]);
    }
    caricaAste();
}

function newOrderBy(){
    orderBy = document.getElementById("ordinamento").value;
    document.getElementById("cardDeck").innerHTML="";
    for(let i = 0; i < refIntervalCat.length; i++){
        clearInterval(refIntervalCat[i]);
    }
    caricaAste();
}

function changeTipo(tipo){
    if(tipo == 0){
        eBusta = (document.getElementById("cbBustaChiusa").checked) ? "" : "&eTipi=0";
    }
    else{
        eInglese = (document.getElementById("cbAstaInglese").checked) ? "" : "&eTipi=1";
    }
    document.getElementById("cardDeck").innerHTML="";
    for(let i = 0; i < refIntervalCat.length; i++){
        clearInterval(refIntervalCat[i]);
    }
    caricaAste();
}
function changeCategorie(categoria){
    if(categoria == 0){
        eCollezionismo = (document.getElementById("cbCollezionismo").checked) ? "" : "&eCategorie=Collezionismo";
    }
    else if(categoria == 1){
        eVinile = (document.getElementById("cbVinile").checked) ? "" : "&eCategorie=Vinile";
    }
    else if(categoria == 2){
        eArte = (document.getElementById("cbArte").checked) ? "" : "&eCategorie=Arte";
    }
    else{
        eAntico = (document.getElementById("cbAntico").checked) ? "" : "&eCategorie=Antico";
    }
    document.getElementById("cardDeck").innerHTML="";
    for(let i = 0; i < refIntervalCat.length; i++){
        clearInterval(refIntervalCat[i]);
    }
    caricaAste();
}

function changePrezzoMassimo(){
    ePrezzo = "&ePrezzo="+ (document.getElementById("prezzoMassimo").value * 1000);
    document.getElementById("cardDeck").innerHTML="";
    for(let i = 0; i < refIntervalCat.length; i++){
        clearInterval(refIntervalCat[i]);
    }
    caricaAste();
}

function resetFiltri(){
    caricaFiltri();
    document.getElementById("cardDeck").innerHTML="";
    for(let i = 0; i < refIntervalCat.length; i++){
        clearInterval(refIntervalCat[i]);
    }
    caricaAste();
}