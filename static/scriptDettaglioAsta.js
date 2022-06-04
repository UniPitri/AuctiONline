let slideIndex = 1;

function logout() {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("email");
    sessionStorage.removeItem("id");
    sessionStorage.removeItem("self");
    window.location.href = "index.html";
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

function offerta(asta, prezzo) {
    
    if (sessionStorage.getItem('id') == null){
        window.location.href = 'login.html';
    }
    else if (prezzo.value % 1 != 0 && prezzo.value.split('.')[1].length > 2) {
        document.getElementById('modalContent').className = 'modal-content bg-danger';
        document.getElementById('modalTitle').innerHTML = 'Errore';
        document.getElementById('message').innerHTML = 'Massimo due decimali';
        $('#alert').modal('show');
    } else{
        fetch(asta.self, {
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
                document.getElementById('message').innerHTML = data.message;
                $('#alert').modal('show');

                if(asta.tipoAsta == 0){
                    document.getElementById("offri").remove();
                }
            } else {
                document.getElementById('modalContent').className = 'modal-content bg-danger';
                document.getElementById('modalTitle').innerHTML = 'Errore';
                document.getElementById('message').innerHTML = data.message;
                $('#alert').modal('show');
            }
        })
        .catch(error => console.error(error));
    }
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
    caricaDettagliAsta();
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

function caricaDettagliAstaAttiva(data, now){
    countDownDate = new Date(data.fineAsta).getTime();
    offer = document.getElementById("offerta");

    if(data.tipoAsta == 1 || data.venditoreAsta._id == sessionStorage.getItem("id")){
        if(data.offerteAsta.length != 0){
            document.getElementById("ultimaOfferta").innerHTML = data.offerteAsta[0] + "€";
        }
        else{
            document.getElementById("ultimaOfferta").innerHTML = "--";
        }
    }else{
        document.getElementById("titoloUltimaOfferta").innerHTML = "<b>Prezzo minimo richiesto:</b>"
        if(data.prezzoMinimo != null){
            document.getElementById("ultimaOfferta").innerHTML = data.prezzoMinimo + "€";
        }
        else{
            document.getElementById("ultimaOfferta").innerHTML = "--";
        }
    }

    if (data.venditoreAsta._id != sessionStorage.getItem("id")) {
        document.getElementById("titoloOfferta").hidden = false;

        let i = 0;
        while (i < data.offerentiAsta.length && data.offerentiAsta[i] != sessionStorage.getItem("id")) {
            console.log(data.offerteAsta[i]);
            i++;
        }

        if (i < data.offerentiAsta.length) {
            document.getElementById("miaOfferta").innerHTML = data.offerteAsta[i] + "€";
        } 
        else {
            document.getElementById("miaOfferta").innerHTML = "--";
        }

        if (data.tipoAsta == 1 && data.offerteAsta.length != 0) {
            offer.value = (data.offerteAsta[0] + 0.01).toFixed(2);
            offer.min = (data.offerteAsta[0] + 0.01).toFixed(2);
        }
        else {
            if (data.prezzoMinimo != null) {
                offer.value = (data.prezzoMinimo + 0.01).toFixed(2);
                offer.min = (data.prezzoMinimo + 0.01).toFixed(2);
            }
            else {
                offer.value = 0.01;
                offer.min = 0.01;
            }
        }
        document.getElementById("inviaOfferta").onclick = function () {
            offerta(data, offer);
        }

        if(data.tipoAsta == 0 && i < data.offerentiAsta.length){
            document.getElementById("offri").remove();
        }
        else{
            document.getElementById("offri").hidden = false;
        }
    }
    else{
        document.getElementById("titoloOfferta").remove();
        document.getElementById("offri").remove();
    }
    var distance = countDownDate - now;
    var days = Math.floor(distance / (1000 * 60 * 60 * 24));
    var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((distance % (1000 * 60)) / 1000);
    document.getElementById("tempoRimanente").innerHTML = "<b>Tempo rimanente: </b>" + days + "d " + hours + "h " + minutes + "m " + seconds + "s ";

    var x = setInterval(function(){
        fetch('..' + data.self, {
            method: 'GET',
        })
        .then((resp) => resp.json())
        .then(function (data) {
            let now = new Date().getTime();
            countDownDate = new Date(data.fineAsta).getTime();

            if(data.tipoAsta == 1 || data.venditoreAsta._id == sessionStorage.getItem("id")){
                if(data.offerteAsta.length != 0){
                    document.getElementById("ultimaOfferta").innerHTML = data.offerteAsta[0] + "€";
                }
                else{
                    document.getElementById("ultimaOfferta").innerHTML = "--";
                }
            }

            if (data.venditoreAsta._id != sessionStorage.getItem("id")) {
                document.getElementById("titoloOfferta").hidden = false;

                let i = 0;
                while (i < data.offerentiAsta.length && data.offerentiAsta[i] != sessionStorage.getItem("id")) {
                    console.log(data.offerteAsta[i]);
                    i++;
                }

                if (i < data.offerentiAsta.length) {
                    document.getElementById("miaOfferta").innerHTML = data.offerteAsta[i] + "€";
                } 
                else {
                    document.getElementById("miaOfferta").innerHTML = "--";
                }
            }

            var distance = countDownDate - now;
            if(distance > 0){
                var days = Math.floor(distance / (1000 * 60 * 60 * 24));
                var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                var seconds = Math.floor((distance % (1000 * 60)) / 1000);
                document.getElementById("tempoRimanente").innerHTML = ((new Date(data.inizioAsta).getTime() > now) ? "<b>L'asta inizierà tra:</b> " : "<b>Tempo rimanente: </b>") + days + "d " + hours + "h " + minutes + "m " + seconds + "s ";
            }
            else{
                window.location.href = "index.html";
            }
        })
    }, 1000);
}

function caricaDettagliAstaInAttesa(data, now){
    countDownDate = new Date(data.inizioAsta).getTime();
    document.getElementById("titoloUltimaOfferta").innerHTML = "<b>Prezzo minimo richiesto:</b>"
    if(data.prezzoMinimo != null){
        document.getElementById("ultimaOfferta").innerHTML = data.prezzoMinimo + "€";
    }
    else{
        document.getElementById("ultimaOfferta").innerHTML = "--";
    }
    var distance = countDownDate - now;
    var days = Math.floor(distance / (1000 * 60 * 60 * 24));
    var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((distance % (1000 * 60)) / 1000);
    document.getElementById("tempoRimanente").innerHTML = "<b>L'asta inizierà tra:</b> " + days + "d " + hours + "h " + minutes + "m " + seconds + "s ";
    var x = setInterval(function(){
        let now = new Date().getTime();
        countDownDate = new Date(data.inizioAsta).getTime();
        var distance = countDownDate - now;
        if(distance > 0){
            var days = Math.floor(distance / (1000 * 60 * 60 * 24));
            var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            var seconds = Math.floor((distance % (1000 * 60)) / 1000);
            document.getElementById("tempoRimanente").innerHTML = ((new Date(data.inizioAsta).getTime() > now) ? "<b>L'asta inizierà tra:</b> " : "<b>Tempo rimanente: </b>") + days + "d " + hours + "h " + minutes + "m " + seconds + "s ";
        }
        else{
            clearInterval(x);
            caricaDettagliAstaAttiva(data,now);
        }
    },1000);
}

function caricaDettagliAsta() {
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
                    if(data.preferenze != null && data.preferenze.includes(sessionStorage.getItem("id"))){
                        img.onclick = function () {rimuoviPreferita(data.idAsta) };
                        img.src = '/icone/Plain_Yellow_Star.png';
                    }
                    else{
                        img.onclick = function () {aggiungiPreferita(data.idAsta) };
                        img.src = '/icone/star-empty.webp';
                    }  
                    img.id = "star" + data.idAsta;
                    
                    img.style.width = '40px';
                    img.style.height = '40px';
                }

                document.getElementById("nomeAsta").innerHTML = "<h3><b>"+data.dettagliProdotto.Nome+"</h3></b>";
                document.getElementById("descrizione").innerHTML = data.dettagliProdotto.Descrizione;
                document.getElementById("venditore").innerHTML = data.venditoreAsta.Username;
                document.getElementById("tipo").innerHTML = (data.tipoAsta == 0) ? "Asta a busta chiusa" : "Asta all'inglese";

                if (data.dettagliProdotto.Categorie != null) {
                    document.getElementById("categorie").innerHTML = data.dettagliProdotto.Categorie[0];
                    for (var i = 1; i < data.dettagliProdotto.Categorie.length; i++) {
                        document.getElementById("categorie").innerHTML = document.getElementById("categorie").innerHTML + " - " + data.dettagliProdotto.Categorie[i];
                    }
                }

                let now = new Date().getTime();
                if(new Date(data.inizioAsta).getTime() < now){
                    caricaDettagliAstaAttiva(data, now);
                }
                else{
                    caricaDettagliAstaInAttesa(data, now);
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