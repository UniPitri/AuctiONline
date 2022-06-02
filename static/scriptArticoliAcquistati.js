var down = true;
var orderBy = document.getElementById("ordinamento").value;
var order = "asc";

function logout(){
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("email");
    sessionStorage.removeItem("id");
    sessionStorage.removeItem("self");
    window.location.href = "index.html";
}

function redirectSicuro(file) {
    window.location.href = file + "?token=" + sessionStorage.getItem("token");
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
    caricaAsteVinte();
}

function newOrderBy(){
    orderBy = document.getElementById("ordinamento").value;
    document.getElementById("cardDeck").innerHTML="";
    caricaAsteVinte();
}