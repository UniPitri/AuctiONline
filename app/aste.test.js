const request  = require('supertest');
const app      = require('./app');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require("mongodb-memory-server");
const jwt = require('jsonwebtoken');
const Asta = require('./models/asta');
const Utente = require('./models/utente');

async function cleanDB() {
   const collections = mongoose.connection.collections

   for (const key in collections) {
       await collections[key].deleteMany()
   }
}

let mongoServer

describe('GET /api/v1/aste', () => {
    let dummyUtente;
    let dummyAsta;

    beforeAll(async () => {
        jest.setTimeout(8000);
        mongoServer = await MongoMemoryServer.create();
        app.locals.db = await mongoose.connect(mongoServer.getUri())
        dummyUtente = await new Utente({Mail: "test@test", Username: "test", Password: "test"}).save();
        dummyAsta = await new Asta({
            DettagliProdotto:{Nome:"prodottoTest", Categorie:["t1","t2"],Descrizione:"Descrizione",Foto:["foto1.jpeg","foto2.png"]},
            DettagliAsta:{Inizio:"2022-05-25T09:35:00.000+00:00",Fine:"2022-06-25T09:35:00.000+00:00",Tipo:1,PrezzoMinimo:12.12,Venditore:dummyUtente._id,Offerte:[],Offerenti:[]},
            Preferenze: [dummyUtente._id]
        }).save();
    })

    afterAll(async () => {
        await cleanDB();
        await mongoose.connection.close();
        await mongoServer.stop();
        console.log("CONN", mongoose.connection.readyState);
        console.log("MONGO CONN", mongoServer.state);

    })

    test("Visione catalogo", async () => {
        const response = await request(app).get("/api/v1/aste").send().expect(200).expect("Content-Type", /json/)
        expect(response.body).toBeDefined()
    })
});

describe('GET /api/v1/aste/:id', () => {
    let dummyUtente;
    let dummyAsta;
    let dummyId;

    beforeAll(async () => {
        jest.setTimeout(8000);
        mongoServer = await MongoMemoryServer.create();
        app.locals.db = await mongoose.connect(mongoServer.getUri())
        dummyUtente = await new Utente({Mail: "test@test", Username: "test", Password: "test"}).save();
        dummyAsta = await new Asta({
            DettagliProdotto:{Nome:"prodottoTest", Categorie:["t1","t2"],Descrizione:"Descrizione",Foto:["foto1.jpeg","foto2.png"]},
            DettagliAsta:{Inizio:"2022-05-25T09:35:00.000+00:00",Fine:"2022-06-25T09:35:00.000+00:00",Tipo:1,PrezzoMinimo:12.12,Venditore:dummyUtente._id,Offerte:[],Offerenti:[]},
            Preferenze: [dummyUtente._id]
        }).save();
        dummyId = mongoose.Types.ObjectId();
    })

    afterAll(async () => {
        await cleanDB();
        await mongoose.connection.close();
        await mongoServer.stop();
        console.log("CONN", mongoose.connection.readyState);
        console.log("MONGO CONN", mongoServer.state);

    })

    test("Visione dettaglia asta di asta inestitente", async () => {
        const response = await request(app).get("/api/v1/aste/"+dummyId).send().expect(404).expect("Content-Type", /json/)
        expect(response.body).toBeDefined()
        expect(response.body.success).toBe(false)
        expect(response.body.message).toBe('Asta non trovata')
    })

    test("Visione dettaglia asta di asta estitente", async () => {
        const response = await request(app).get("/api/v1/aste/"+dummyAsta._id).send().expect(200).expect("Content-Type", /json/)
        expect(response.body).toBeDefined()
        expect(response.body).toMatchObject({ success: true,self: /\/api\/v1\/aste\/(.*)/, idAsta: /(.*)/, dettagliProdotto: /(.*)/, inizioAsta: /(.*)/, fineAsta: /(.*)/, tipoAsta: /(.*)/, prezzoMinimo: /(.*)/, offerteAsta: /(.*)/, offerentiAsta: /(.*)/, venditoreAsta: /(.*)/, preferenze: /(.*)/})
    })
});

describe('POST /api/v1/aste', () => {
    let dummyUtente;
    let dummyPayload;
    let dummyToken;
    let options;
    let invalidToken;

    beforeAll(async () => {
        jest.setTimeout(8000);
        mongoServer = await MongoMemoryServer.create();
        app.locals.db = await mongoose.connect(mongoServer.getUri())
        dummyUtente = await new Utente({Mail: "test@test", Username: "test", Password: "test"}).save();
        dummyPayload = {
			email: dummyUtente.Mail,
			id: dummyUtente._id,
			username: dummyUtente.Username
		}
        options = {
			expiresIn: 86400
		}
        invalidToken = jwt.sign(dummyPayload, "fakeSupersecret", options);
		dummyToken = jwt.sign(dummyPayload, process.env.SUPER_SECRET, options);
    })

    afterAll(async () => {
        await cleanDB();
        await mongoose.connection.close();
        await mongoServer.stop();
        console.log("CONN", mongoose.connection.readyState);
        console.log("MONGO CONN", mongoServer.state);

    })

    test("Creazione asta con token non valido", async () => {
        const response = await request(app).post("/api/v1/aste")
        .set('Content-type', 'multipart/form-data')
        .set("x-access-token", invalidToken)
        .set("id-account", dummyUtente._id)
        .field("nome", "testProdotto")
        .field("categoria", ["t1","t2"])
        .field("descrizione", "testDescrizione")
        .field("nomeFoto", ["foto1.png"])
        .field("inizio", "1995-12-17T12:12:00")
        .field("fine", "2022-12-17T12:12:00")
        .field("tipo", 0)
        .field("prezzoMinimo", 12.55)
        .expect(403).expect("Content-Type", /json/)
        expect(response.body).toBeDefined()
        expect(response.body.success).toBe(false)
        expect(response.body.message).toBe('Failed to authenticate token.')
    })

    test("Creazione asta con DateTime dell'attributo Inizio già superato", async () => {
        const response = await request(app).post("/api/v1/aste")
        .set('Content-type', 'multipart/form-data')
        .set("x-access-token", dummyToken)
        .set("id-account", dummyUtente._id)
        .field("nome", "testProdotto")
        .field("categoria", ["t1","t2"])
        .field("descrizione", "testDescrizione")
        .field("nomeFoto", ["foto1.png"])
        .field("inizio", "1995-12-17T12:12:00")
        .field("fine", "2022-12-17T12:12:00")
        .field("tipo", 0)
        .field("prezzoMinimo", 12.55)
        .expect(400).expect("Content-Type", /json/)
        expect(response.body).toBeDefined()
        expect(response.body.success).toBe(false)
        expect(response.body.message).toBe('Attributo Inizio o Fine non valido')
    })

    test("Creazione asta con DateTime dell'attributo Fine che è precedente a quello di Inizio", async () => {
        const response = await request(app).post("/api/v1/aste")
        .set('Content-type', 'multipart/form-data')
        .set("x-access-token", dummyToken)
        .set("id-account", dummyUtente._id)
        .field("nome", "testProdotto")
        .field("categoria", ["t1","t2"])
        .field("descrizione", "testDescrizione")
        .field("nomeFoto", ["foto1.png"])
        .field("inizio", "2022-12-17T12:12:00")
        .field("fine", "2021-12-17T12:12:00")
        .field("tipo", 0)
        .field("prezzoMinimo", 12.55)
        .expect(400).expect("Content-Type", /json/)
        expect(response.body).toBeDefined()
        expect(response.body.success).toBe(false)
        expect(response.body.message).toBe('Attributo Inizio o Fine non valido')
    })

    test("Creazione asta con prezzo minimo non valido", async () => {
        const response = await request(app).post("/api/v1/aste")
        .set('Content-type', 'multipart/form-data')
        .set("x-access-token", dummyToken)
        .set("id-account", dummyUtente._id)
        .field("nome", "testProdotto")
        .field("categoria", ["t1","t2"])
        .field("descrizione", "testDescrizione")
        .field("nomeFoto", ["foto1.png"])
        .field("inizio", "2022-12-17T12:12:00")
        .field("fine", "2022-12-18T12:12:00")
        .field("tipo", 0)
        .field("prezzoMinimo", "Stringa")
        .expect(400).expect("Content-Type", /json/)
        expect(response.body).toBeDefined()
        expect(response.body.success).toBe(false)
        expect(response.body.message).toBe('Attributo prezzo minimo non valido')
    })

    test("Creazione asta", async () => {
        const response = await request(app).post("/api/v1/aste")
        .set('Content-type', 'multipart/form-data')
        .set("x-access-token", dummyToken)
        .set("id-account", dummyUtente._id)
        .field("nome", "testProdotto")
        .field("categoria", ["t1","t2"])
        .field("descrizione", "testDescrizione")
        .field("nomeFoto", ["foto1.png"])
        .field("inizio", "2022-12-17T12:12:00")
        .field("fine", "2022-12-18T12:12:00")
        .field("tipo", 0)
        .field("prezzoMinimo", "null")
        .expect(200).expect("Content-Type", /json/)
        expect(response.body).toBeDefined()
        expect(response.body).toMatchObject({ success: true, message: 'Nuova asta aggiunta correttamente',self: /\/api\/v1\/aste\/(.*)/ })
    })
});