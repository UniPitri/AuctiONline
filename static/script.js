var categoriaClick = 0;

function login() {
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;

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
            sessionStorage.setItem("id",data.it);
            sessionStorage.setItem("self",data.self);
            window.location.href = "index.html";
        } else {
            document.getElementById('message').innerHTML = data.message;
            $('#alert').modal('show');
        }
    })
    .catch(error => console.error(error));
};

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
        .catch( error => console.error(error) );
    }
}

function caricaAste() {
    const cardDeck = document.getElementById('cardDeck');
    fetch('../api/v1/aste', {
        method: 'GET',
    })
    .then((resp) => resp.json())
    .then(function(data) {    
        return data.map(function(asta) {
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
    .catch( error => console.error(error) );
}
function nuovaAsta(){
    window.location.href = "creazioneAsta.html";
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
        fd.append("prezzoMinimo", (prezzoMinimoProdotto != null) ? prezzoMinimoProdotto : null);

        fetch('../api/v1/aste', {
            method: 'POST',
            headers: {
                'x-access-token': sessionStorage.getItem("token")
            },
            body: fd
        })
        .then((resp) => resp.json())
        .then(function(data) {
            window.alert(data.message);
            window.location.href = "index.html";
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