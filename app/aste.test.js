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

    test("Visione dettagli chiave asta di asta estitente", async () => {
        const response = await request(app).get("/api/v1/aste/"+dummyAsta._id+"?get=valori").send().expect(200).expect("Content-Type", /json/)
        expect(response.body).toBeDefined()
        expect(response.body).toMatchObject({ fine: /(.*)/, offerta: /(.*)/, offerente: /(.*)/})
    })

    test("Visione fine asta di asta estitente", async () => {
        const response = await request(app).get("/api/v1/aste/"+dummyAsta._id+"?get=fine").send().expect(200).expect("Content-Type", /json/)
        expect(response.body).toBeDefined()
        expect(response.body).toMatchObject({ fine: /(.*)/})
    })

    test("Visione dettagli completi asta di asta estitente", async () => {
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

describe('PUT /api/v1/aste/:id', () => {
    let dummyUtente;
    let dummyAsta1;
    let dummyAsta2;
    let dummyAsta3;
    let dummyAsta4;
    let dummyPayload;
    let dummyToken;
    let options;
    let invalidToken;

    beforeAll(async () => {
        jest.setTimeout(8000);
        mongoServer = await MongoMemoryServer.create();
        app.locals.db = await mongoose.connect(mongoServer.getUri())
        dummyUtente = await new Utente({Mail: "test@test", Username: "test", Password: "test"}).save();
        dummyAsta1 = await new Asta({
            DettagliProdotto:{Nome:"prodottoTest", Categorie:["t1","t2"],Descrizione:"Descrizione",Foto:["foto1.jpeg","foto2.png"]},
            DettagliAsta:{Inizio:"2022-05-25T09:35:00.000+00:00",Fine:"2022-06-25T09:35:00.000+00:00",Tipo:1,PrezzoMinimo:12.12,Venditore:mongoose.Types.ObjectId(),Offerte:[40.25],Offerenti:[mongoose.Types.ObjectId()]},
            Preferenze: []
        }).save();
        dummyAsta2 = await new Asta({
            DettagliProdotto:{Nome:"prodottoTest2", Categorie:["t3","t4"],Descrizione:"Descrizione2",Foto:["foto3.jpeg"]},
            DettagliAsta:{Inizio:"2022-05-25T09:35:00.000+00:00",Fine:"2022-06-25T09:35:00.000+00:00",Tipo:0,PrezzoMinimo:null,Venditore:dummyUtente._id,Offerte:[],Offerenti:[]},
            Preferenze: [dummyUtente._id]
        }).save();
        dummyAsta3 = await new Asta({
            DettagliProdotto:{Nome:"prodottoTest3", Categorie:["t1","t2"],Descrizione:"Descrizione",Foto:["foto1.jpeg","foto2.png"]},
            DettagliAsta:{Inizio:"2022-05-25T09:35:00.000+00:00",Fine:"2022-05-31T09:35:00.000+00:00",Tipo:1,PrezzoMinimo:34,Venditore:mongoose.Types.ObjectId(),Offerte:[],Offerenti:[]},
            Preferenze: []
        }).save();
        dummyAsta4 = await new Asta({
            DettagliProdotto:{Nome:"prodottoTest4", Categorie:["t4","t5"],Descrizione:"Descrizione",Foto:["foto5.jpeg","foto6.png"]},
            DettagliAsta:{Inizio:"2022-05-25T09:35:00.000+00:00",Fine:"2022-06-31T09:35:00.000+00:00",Tipo:0,PrezzoMinimo:24,Venditore:mongoose.Types.ObjectId(),Offerte:[40, 35.50],Offerenti:[mongoose.Types.ObjectId(),dummyUtente._id]},
            Preferenze: []
        }).save();
        
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

    test("Offerta senza essere loggato", async () => {
        const response = await request(app).put("/api/v1/aste/"+dummyAsta1._id)
        .set("id-account", "")
        .send({
            prezzo: 35.50
        }).expect(401).expect("Content-Type", /json/)
        expect(response.body).toBeDefined()
        expect(response.body.success).toBe(false)
        expect(response.body.message).toBe('No token provided.')
    })

    test("Offerta con token non valido", async () => {
        const response = await request(app).put("/api/v1/aste/"+dummyAsta1._id)
        .set("x-access-token", invalidToken)
        .set("id-account", dummyUtente._id)
        .send({
            prezzo: 35.50
        }).expect(403).expect("Content-Type", /json/)
        expect(response.body).toBeDefined()
        expect(response.body.success).toBe(false)
        expect(response.body.message).toBe('Failed to authenticate token.')
    })

    test("Offerta per asta inesistente", async () => {
        const response = await request(app).put("/api/v1/aste/"+mongoose.Types.ObjectId())
        .set("x-access-token", dummyToken)
        .set("id-account", dummyUtente._id)
        .send({
            prezzo: 35.50
        }).expect(404).expect("Content-Type", /json/)
        expect(response.body).toBeDefined()
        expect(response.body.success).toBe(false)
        expect(response.body.message).toBe('Asta non trovata')
    })

    test("Offerta per asta di cui sono il venditore", async () => {
        const response = await request(app).put("/api/v1/aste/"+dummyAsta2._id)
        .set("x-access-token", dummyToken)
        .set("id-account", dummyUtente._id)
        .send({
            prezzo: 35.50
        }).expect(400).expect("Content-Type", /json/)
        expect(response.body).toBeDefined()
        expect(response.body.success).toBe(false)
        expect(response.body.message).toBe("Non puoi offrire per un'asta creata da te stesso")
    })

    test("Offerta per asta conclusa o che deve ancora iniziare", async () => {
        const response = await request(app).put("/api/v1/aste/"+dummyAsta3._id)
        .set("x-access-token", dummyToken)
        .set("id-account", dummyUtente._id)
        .send({
            prezzo: 35.50
        }).expect(400).expect("Content-Type", /json/)
        expect(response.body).toBeDefined()
        expect(response.body.success).toBe(false)
        expect(response.body.message).toBe("Non puoi offrire per questa asta")
    })

    test("Offerta inferiore rispetto al prezzo corrente", async () => {
        const response = await request(app).put("/api/v1/aste/"+dummyAsta1._id)
        .set("x-access-token", dummyToken)
        .set("id-account", dummyUtente._id)
        .send({
            prezzo: 35.50
        }).expect(400).expect("Content-Type", /json/)
        expect(response.body).toBeDefined()
        expect(response.body.success).toBe(false)
        expect(response.body.message).toBe("Prezzo troppo basso")
    })

    test("Offerta inserendo una stringa o null", async () => {
        const response = await request(app).put("/api/v1/aste/"+dummyAsta1._id)
        .set("x-access-token", dummyToken)
        .set("id-account", dummyUtente._id)
        .send({
            prezzo: "35.50euro"
        }).expect(400).expect("Content-Type", /json/)
        expect(response.body).toBeDefined()
        expect(response.body.success).toBe(false)
        expect(response.body.message).toBe("Prezzo non valido")
    })

    test("Offerta per un'asta a busta chiusa a cui si è già offerto", async () => {
        const response = await request(app).put("/api/v1/aste/"+dummyAsta4._id)
        .set("x-access-token", dummyToken)
        .set("id-account", dummyUtente._id)
        .send({
            prezzo: 50.55
        }).expect(400).expect("Content-Type", /json/)
        expect(response.body).toBeDefined()
        expect(response.body.success).toBe(false)
        expect(response.body.message).toBe("L'asta è a busta chiusa ed è presente già una tua offerta")
    })

    test("Offerta", async () => {
        const response = await request(app).put("/api/v1/aste/"+dummyAsta1._id)
        .set("x-access-token", dummyToken)
        .set("id-account", dummyUtente._id)
        .send({
            prezzo: 50.55
        }).expect(200).expect("Content-Type", /json/)
        expect(response.body).toBeDefined()
        expect(response.body).toMatchObject({ success: true, message: 'Nuova offerta avvenuta con successo',self: /\/api\/v1\/aste\/(.*)/ })
    })
});