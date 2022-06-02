const request  = require('supertest');
const app      = require('./app');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require("mongodb-memory-server");
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