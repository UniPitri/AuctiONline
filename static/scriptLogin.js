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