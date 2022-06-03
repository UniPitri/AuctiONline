var categoriaClick = 0;

function logout() {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("email");
    sessionStorage.removeItem("id");
    sessionStorage.removeItem("self");
    window.location.href = "index.html";
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