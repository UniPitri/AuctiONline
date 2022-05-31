var categoriaClick = 0;

function login() {
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;

    if (username == "") {
        window.alert("Devi inserire un username");
    }
    else if (password == "") {
        window.alert("Devi inserire una password");
    }
    else {
        fetch('../api/v1/autenticazione', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: username, password: password }),
        })
            .then((resp) => resp.json())
            .then(function (data) {
                if (data.success) {
                    sessionStorage.setItem("token", data.token);
                    sessionStorage.setItem("email", data.email);
                    sessionStorage.setItem("id", data.id);
                    sessionStorage.setItem("self", data.self);
                    window.location.href = "index.html";
                } else {
                    document.getElementById('message').innerHTML = data.message;
                    $('#alert').modal('show');
                }
            })
            .catch(error => console.error(error));
    }
};

function logout() {
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

    if (username == "") {
        window.alert("E' richiesto l'username!");
    }
    else if (password == "") {
        window.alert("E' richiesta la password!");
    }
    else if (email == "") {
        window.alert("E' richiesta la mail!");
    }
    else {
        fetch('../api/v1/registrazione', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: username, password: password, email: email }),
        })
            .then((resp) => resp.json())
            .then(function (data) {
                if (data.success) {
                    sessionStorage.setItem("token", data.token);
                    sessionStorage.setItem("email", data.email);
                    sessionStorage.setItem("id", data.id);
                    sessionStorage.setItem("self", data.self);
                    sessionStorage.setItem("username", data.username);
                    window.location.href = "index.html";
                } else {
                    document.getElementById('message').innerHTML = data.message;
                    $('#alert').modal('show');
                }
            })
            .catch(error => console.error(error));
    }
}

function offerta(asta, prezzo) {
    
    if (sessionStorage.getItem('id') == null)
        window.location.href = 'login.html';
    else if (prezzo.value % 1 != 0 && prezzo.value.split('.')[1].length > 2) {
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
        body: JSON.stringify({ prezzo: prezzo.value }),
    })
        .then((resp) => resp.json())
        .then(function (data) {
            if (data.success) {
                document.getElementById('modalContent').className = 'modal-content bg-success';
                document.getElementById('modalTitle').innerHTML = 'Successo';
            } else {
                document.getElementById('modalContent').className = 'modal-content bg-danger';
                document.getElementById('modalTitle').innerHTML = 'Errore';
                document.getElementById('message').innerHTML = data.message;
                $('#alert').modal('show');
            }

            
        })
        .catch(error => console.error(error));
}

function redirect2(e, n) {
    if (e.target.id != "input")
        alert(n);
}

function caricaAste() {
    if (sessionStorage.getItem("token")) {
        document.getElementById("headerLoggati").hidden = false;
    }
    else {
        document.getElementById("headerSloggati").hidden = false;
    }
    const cardDeck = document.getElementById('cardDeck');
    fetch('../api/v1/aste', {
        method: 'GET',
    })
        .then((resp) => resp.json()) // Transform the data into json
        .then(function (data) { // Here you get the data to modify as you please        
            return data.map(function (asta) { // Map through the results and for each run the code below
                let container = document.createElement('div');
                container.className = "container";
                container.style = "margin: 0";
                let row = document.createElement('div');
                row.className = "row";
                let div = document.createElement('div');
                div.className = "card rounded";
                //div.setAttribute('onclick', 'if(event.target.id != "input") window.location.href = "' + asta.self + '"');
                div.style = "background-color: #38d996; cursor: pointer; margin: 1% 0%";
                let row2 = document.createElement('div');
                row2.className = "row no-gutters";
                let col1 = document.createElement('div');
                col1.className = "col-md-4";
                let imgProdotto = document.createElement('img');
                imgProdotto.src = "fotoProdotti/" + asta.dettagliProdotto.Foto[0];
                imgProdotto.style.width = "200px";
                imgProdotto.style.height = "200px";
                imgProdotto.style = "width:200px;object-fit: cover;height:200px";
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
                if (asta.dettagliAsta.Offerte.length != 0) {
                    offer.value = asta.dettagliAsta.Offerte[asta.dettagliAsta.Offerte.length - 1] + 0.01;
                    offer.min = asta.dettagliAsta.Offerte[asta.dettagliAsta.Offerte.length - 1] + 0.01;
                }
                else {
                    if (asta.dettagliAsta.PrezzoMinimo != null) {
                        offer.value = asta.dettagliAsta.PrezzoMinimo + 0.01;
                        offer.min = asta.dettagliAsta.PrezzoMinimo + 0.01;
                    }
                    else {
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
                        if (asta.dettagliAsta.Offerte.length != 0) {
                            p.innerHTML = "Prezzo attuale: " + asta.dettagliAsta.Offerte[asta.dettagliAsta.Offerte.length - 1] + "€";
                        }
                        else {
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
                button.onclick = function () {
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

                div.onclick = function () { caricaPaginaDettagli(asta.idAsta) };

                if (sessionStorage.getItem("token")) {
                    var img = document.createElement('img');
                    div.appendChild(img);
                    if (asta.preferenze != null && asta.preferenze.includes(sessionStorage.getItem("id"))) {
                        img.src = '/icone/Plain_Yellow_Star.png';
                    }
                    else {
                        img.onclick = function () { aggiungiPreferita(asta.idAsta) };
                        img.src = '/icone/star-empty.webp';
                    }
                    img.id = "star" + asta.idAsta;
                    img.style.height = '20px';
                    img.style.width = '20px';
                    img.style.position = 'absolute';
                    img.style.top = '5px';
                    img.style.right = '5px';
                }
                row.appendChild(div);
                container.appendChild(row);
                cardDeck.appendChild(container);
            })
        })
        .catch(error => console.error(error));
}

function nuovaAsta() {
    window.location.href = "creazioneAsta.html?token=" + sessionStorage.getItem("token");
}

function annullaCreazioneAsta() {
    window.location.href = "index.html";
}

function cardAstaOn() {
    document.getElementById("cardProdotto").hidden = true;
    document.getElementById("cardAsta").hidden = false;
}

function cardProdottoOn() {
    document.getElementById("cardAsta").hidden = true;
    document.getElementById("cardProdotto").hidden = false;
}

function creaAsta() {
    var nomeProdotto = document.getElementById("nomeProdotto").value;
    var descrizioneProdotto = document.getElementById("descrizioneProdotto").value;
    var immaginiProdotto = document.getElementById("immagineProdotto").files[0];
    var inizioAsta = document.getElementById("inizioAsta").value;
    var fineAsta = document.getElementById("fineAsta").value;
    var tipoAsta = document.querySelector('input[name="tipoAsta"]:checked').value;
    var prezzoMinimoProdotto = document.getElementById("prezzoMinimo").value;

    if (nomeProdotto == "" || descrizioneProdotto == "" || !immaginiProdotto || !inizioAsta || !fineAsta) {
        window.alert("Devi compilare tutti i campi obbligatori!");
    }
    else {
        var fd = new FormData();
        fd.append("nome", nomeProdotto);

        for (let i = 0; i <= categoriaClick && i < 4; i++) {
            fd.append("categoria", document.getElementById("categoriaProdotto" + i).value);
        }

        fd.append("descrizione", descrizioneProdotto);
        fd.append("foto", immaginiProdotto);
        fd.append("inizio", inizioAsta);
        fd.append("fine", fineAsta);
        fd.append("tipo", tipoAsta);
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
            .then(function (data) {
                window.alert(data.message);
                if (data.success) {
                    window.location.href = "index.html";
                }
            })
            .catch(error => console.error(error));
    }
}

function extraCategoriaClick() {
    if (categoriaClick < 3) {
        document.getElementById("menoCategoria").hidden = false;
        categoriaClick++;
        document.getElementById("categoriaProdotto" + categoriaClick).hidden = false;
        if (categoriaClick == 3) {
            document.getElementById("extraCategoria").hidden = true;
        }
    }
}

function menoCategoriaClick() {
    if (categoriaClick > 0) {
        document.getElementById("extraCategoria").hidden = false;
        document.getElementById("categoriaProdotto" + categoriaClick).hidden = true;
        categoriaClick--;
        if (categoriaClick == 0) {
            document.getElementById("menoCategoria").hidden = true;
        }
    }
}

function redirectSicuro(file) {
    window.location.href = file + "?token=" + sessionStorage.getItem("token");
}

function aggiungiPreferita(idAsta) {
    document.getElementById("star" + idAsta).src = '/icone/Plain_Yellow_Star.png';
    document.getElementById("star" + idAsta).onclick = null;
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




function caricaDettagliAsta() {

    if (sessionStorage.getItem("token")) {
        document.getElementById("headerLoggati").hidden = false;

    }
    else {
        document.getElementById("headerSloggati").hidden = false;
    }



    const params = new URLSearchParams(window.location.search)
    idAsta = params.get('idAsta');

    fetch('../api/v1/aste/' + idAsta, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    })
        .then((resp) => resp.json())
        .then(function (data) {
            if (data.success == true) {

                if (sessionStorage.getItem("token")) {

                    img = document.getElementById('preferenze');
                    
                    if (data.preferenze != null && data.preferenze.includes(sessionStorage.getItem("id"))) {
                        img.src = '/icone/Plain_Yellow_Star.png';
                    }
                    else {
                        img.onclick = function () { aggiungiPreferita(data.idAsta) };
                        img.src = '/icone/star-empty.webp';
                    }
                    img.id = "star" + data.idAsta;
                    
                    img.style.width = '40px';
                    img.style.height = '40px';
                }

                document.getElementById("nomeAsta").innerHTML = data.dettagliProdotto.Nome;
                document.getElementById("descrizione").innerHTML = data.dettagliProdotto.Descrizione;
                //document.getElementById("venditore").innerHTML = data.dettagliProdotto.Descrizione;
                
                //document.getElementById("immaginiAsta").src = "fotoProdotti/" + data.dettagliProdotto.Foto[0];


                if (data.dettagliProdotto.Categorie != null) {
                    //alert(data.dettagliProdotto.Categorie.length);
                    document.getElementById("categorie").innerHTML = data.dettagliProdotto.Categorie[0];
                    for (var i = 1; i < data.dettagliProdotto.Categorie.length; i++) {
                        document.getElementById("categorie").innerHTML = document.getElementById("categorie").innerHTML + " - " + data.dettagliProdotto.Categorie[i];
                    }
                }
                offer = document.getElementById("offerta");


                if (data.venditoreAsta._id != sessionStorage.getItem("id")) {
                    var i = 0;
                    while (i < data.offerentiAsta.length && data.offerentiAsta[i] != sessionStorage.getItem("id")) {
                        console.log(data.offerteAsta[i]);
                        i++;
                    }

                    if (data.tipoAsta == 1) {
                        document.getElementById("titoloOfferta").innerHTML = "mia Offerta:";

                        if (i < data.offerentiAsta.length) {
                            document.getElementById("miaOfferta").innerHTML = data.offerteAsta[i];
                        } else {
                            document.getElementById("miaOfferta").innerHTML = "--";
                        }

                    }
                    else {

                        if (i < data.offerentiAsta.length) {
                            document.getElementById("offri").hidden = true;
                        }

                        document.getElementById("titoloOfferta").innerHTML = "busta chiusa:";
                        document.getElementById("miaOfferta").innerHTML = "--";
                    }

                    if (data.offerteAsta.length != 0) {
                        offer.value = data.offerteAsta[data.offerteAsta.length - 1] + 0.01;
                        offer.min = data.offerteAsta[data.offerteAsta.length - 1] + 0.01;
                    }
                    else {
                        if (data.PrezzoMinimo != null) {
                            offer.value = data.PrezzoMinimo + 0.01;
                            offer.min = data.PrezzoMinimo + 0.01;
                        }
                        else {
                            offer.value = 0.01;
                            offer.min = 0.01;
                        }
                    }
                    document.getElementById("inviaOfferta").onclick = function () {
                        offerta(data.self, offer);
                    }
                } else {
                    offer.style = "display:none";
                    document.getElementById("inviaOfferta").style = "display:none";
                }

                if (data.tipoAsta == 1) {
                    var x = setInterval(function () {

                        fetch('..' + data.self, {
                            method: 'GET',
                        })
                            .then((resp) => resp.json())
                            .then(function (data) {
                                var now = new Date().getTime();

                                if (new Date(data.inizioAsta).getTime() > now) {
                                    countDownDate = new Date(data.inizioAsta).getTime();
                                } else {
                                        if (data.offerteAsta.length != 0) {
                                            document.getElementById("ultimaOfferta").innerHTML = data.offerteAsta[0] + "€";
                                        }
                                        else {
                                            document.getElementById("ultimaOfferta").innerHTML = "00€";
                                        }
                                    

                                    if (data.venditoreAsta._id != sessionStorage.getItem("id")) {
                                        var i = 0;
                                        while (i < data.offerentiAsta.length && data.offerentiAsta[i] != sessionStorage.getItem("id")) {
                                            console.log(data.offerteAsta[i]);
                                            i++;
                                        }
                    
                                            document.getElementById("titoloOfferta").innerHTML = "mia Offerta:";
                    
                                            if (i < data.offerentiAsta.length) {
                                                document.getElementById("miaOfferta").innerHTML = data.offerteAsta[i];
                                            } else {
                                                document.getElementById("miaOfferta").innerHTML = "--";
                                            }
                    
                                        }

                                    countDownDate = new Date(data.fineAsta).getTime();

                                }

                                if (new Date(data.inizioAsta).getTime() > now) {

                                    document.getElementById("titoloTempo").innerHTML = "L'asta inizierà tra: ";
                                    countDownDate = new Date(data.inizioAsta).getTime();
                                } else {

                                    document.getElementById("titoloTempo").innerHTML = "Tempo rimanente: ";
                                    countDownDate = new Date(data.fineAsta).getTime();
                                    //form.style = "display: show";
                                }

                                var distance = countDownDate - now;
                                var days = Math.floor(distance / (1000 * 60 * 60 * 24));
                                var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                                var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                                var seconds = Math.floor((distance % (1000 * 60)) / 1000);

                                document.getElementById("tempoRimanente").innerHTML = days + "d " + hours + "h " + minutes + "m " + seconds + "s ";

                                if (distance < 0) {
                                    clearInterval(x);
                                    document.getElementById("titoloTempo").innerHTML = "";
                                    document.getElementById("tempoRimanente").innerHTML = "EXPIRED";
                                }
                            })
                    }, 1000);
                }
                else{
                    document.getElementById("ultimaOfferta").innerHTML = "--€";
                    var x = setInterval(function () {
                    var now = new Date().getTime();

                                if (new Date(data.inizioAsta).getTime() > now) {
                                    countDownDate = new Date(data.inizioAsta).getTime();
                                } else {
                                    countDownDate = new Date(data.fineAsta).getTime();
                                }

                                if (new Date(data.inizioAsta).getTime() > now) {

                                    document.getElementById("titoloTempo").innerHTML = "L'asta inizierà tra: ";
                                    countDownDate = new Date(data.inizioAsta).getTime();
                                } else {

                                    document.getElementById("titoloTempo").innerHTML = "Tempo rimanente: ";
                                    countDownDate = new Date(data.fineAsta).getTime();
                                    //form.style = "display: show";
                                }

                                var distance = countDownDate - now;
                                var days = Math.floor(distance / (1000 * 60 * 60 * 24));
                                var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                                var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                                var seconds = Math.floor((distance % (1000 * 60)) / 1000);

                                document.getElementById("tempoRimanente").innerHTML = days + "d " + hours + "h " + minutes + "m " + seconds + "s ";

                                if (distance < 0) {
                                    clearInterval(x);
                                    document.getElementById("titoloTempo").innerHTML = "";
                                    document.getElementById("tempoRimanente").innerHTML = "EXPIRED";
                                }
                            }, 1000);
                }

                caricaImmagini(data);

            } else {
                //document.getElementById('message').innerHTML = data.message;
                $('#alert').modal('show');
            }
        })
        .catch(error => console.error(error)); // If there is any error you will catch them here
}

function caricaImmagini(data){
    console.log(data);
    let container = document.getElementById('imgSLider');
    for (let i = 0; i < data.dettagliProdotto.Foto.length; i++) {
        let slideFade = document.createElement('div');
        let index = document.createElement('div');
        let img = document.createElement('img');
        slideFade.className = "mySlides fade";
        slideFade.style="opacity:1";
        index.className = "numbertext";
        index.style="color:black";
        img.src="fotoProdotti/" +data.dettagliProdotto.Foto[i];
        index.innerHTML=(i+1)+"/"+data.dettagliProdotto.Foto.length;

        img.style = "width:300px;object-fit: cover;height:300px";
        slideFade.appendChild(index);
        slideFade.appendChild(img);
        container.appendChild(slideFade);
        
    }
   
    showSlides(slideIndex);
    
}


let slideIndex = 1;

            function plusSlides(n) {
            showSlides(slideIndex += n);
            }

            function currentSlide(n) {
            showSlides(slideIndex = n);
            }

            function showSlides(n) {
            //alert("entrato");
            let i;
            let slides = document.getElementsByClassName("mySlides");
            //console.log("LENGTH"+slides.length);
            if (n > slides.length) {slideIndex = 1}    
            if (n < 1) {slideIndex = slides.length}
            for (i = 0; i < slides.length; i++) {
                slides[i].style.display = "none";  
            }
            
            slides[slideIndex-1].style.display = "block"; 
            }