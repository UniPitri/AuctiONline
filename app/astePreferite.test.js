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

describe('POST /api/v1/astePreferite', () => {
    let dummyUtente;
    let dummyAsta;
    let dummyAsta2;
    let dummyPayload;
    let dummyToken;
    let options;
    let invalidToken;

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
        dummyUtente.AstePreferite[0] = dummyAsta._id;
        await dummyUtente.save();
        dummyAsta2 = await new Asta({
            DettagliProdotto:{Nome:"prodottoTest2", Categorie:["t1","t2"],Descrizione:"Descrizione2",Foto:["foto3.jpeg","foto4.png"]},
            DettagliAsta:{Inizio:"2022-05-25T09:35:00.000+00:00",Fine:"2022-06-25T09:35:00.000+00:00",Tipo:0,PrezzoMinimo:15,Venditore:mongoose.Types.ObjectId(),Offerte:[],Offerenti:[]},
            Preferenze: [mongoose.Types.ObjectId()]
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

    test("Aggiungi asta ai preferiti senza essere loggato", async () => {
        const response = await request(app).post("/api/v1/astePreferite").send({
            idAsta: dummyAsta._id
        }).expect(401).expect("Content-Type", /json/)
        expect(response.body).toBeDefined()
        expect(response.body.success).toBe(false)
        expect(response.body.message).toBe('No token provided.')
    })

    test("Aggiungi asta ai preferiti con token non valido", async () => {
        const response = await request(app).post("/api/v1/astePreferite")
        .set("x-access-token", invalidToken)
        .send({
            userID: dummyUtente._id,
            idAsta: dummyAsta._id
        }).expect(403).expect("Content-Type", /json/)
        expect(response.body).toBeDefined()
        expect(response.body.success).toBe(false)
        expect(response.body.message).toBe('Failed to authenticate token.')
    })

    test("Aggiungi asta non esistente ai preferiti", async () => {
        const response = await request(app).post("/api/v1/astePreferite")
        .set("x-access-token", dummyToken)
        .send({
            userID: dummyUtente._id,
            idAsta: mongoose.Types.ObjectId()
        }).expect(404).expect("Content-Type", /json/)
        expect(response.body).toBeDefined()
        expect(response.body.success).toBe(false)
        expect(response.body.message).toBe('Asta non trovata')
    })

    test("Aggiungi asta già esistente tra i preferiti tra i preferiti", async () => {
        const response = await request(app).post("/api/v1/astePreferite")
        .set("x-access-token", dummyToken)
        .send({
            userID: dummyUtente._id,
            idAsta: dummyAsta._id
        }).expect(409).expect("Content-Type", /json/)
        expect(response.body).toBeDefined()
        expect(response.body.success).toBe(false)
        expect(response.body.message).toBe('Asta già presente tra i preferiti')
    })

    test("Aggiungi asta non preferita tra i preferiti", async () => {
        const response = await request(app).post("/api/v1/astePreferite")
        .set("x-access-token", dummyToken)
        .send({
            userID: dummyUtente._id,
            idAsta: dummyAsta2._id
        }).expect(201).expect("Content-Type", /json/)
        expect(response.body).toBeDefined()
        expect(response.body).toMatchObject({ success: true, message: 'Asta aggiunta ai preferiti',self: /\/api\/v1\/aste\/(.*)/ })
    })
});

describe('DELETE /api/v1/astePreferite', () => {
    let dummyUtente;
    let dummyAsta;
    let dummyAsta2;
    let dummyPayload;
    let dummyToken;
    let options;
    let invalidToken;

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
        dummyUtente.AstePreferite[0] = dummyAsta._id;
        await dummyUtente.save();
        dummyAsta2 = await new Asta({
            DettagliProdotto:{Nome:"prodottoTest2", Categorie:["t1","t2"],Descrizione:"Descrizione2",Foto:["foto3.jpeg","foto4.png"]},
            DettagliAsta:{Inizio:"2022-05-25T09:35:00.000+00:00",Fine:"2022-06-25T09:35:00.000+00:00",Tipo:0,PrezzoMinimo:15,Venditore:mongoose.Types.ObjectId(),Offerte:[],Offerenti:[]},
            Preferenze: [mongoose.Types.ObjectId()]
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

    test("Rimozione asta dai preferiti senza essere loggato", async () => {
        const response = await request(app).delete("/api/v1/astePreferite").send({
            idAsta: dummyAsta._id
        }).expect(401).expect("Content-Type", /json/)
        expect(response.body).toBeDefined()
        expect(response.body.success).toBe(false)
        expect(response.body.message).toBe('No token provided.')
    })

    test("Rimozione asta dai preferiti con token non valido", async () => {
        const response = await request(app).delete("/api/v1/astePreferite")
        .set("x-access-token", invalidToken)
        .send({
            userID: dummyUtente._id,
            idAsta: dummyAsta._id
        }).expect(403).expect("Content-Type", /json/)
        expect(response.body).toBeDefined()
        expect(response.body.success).toBe(false)
        expect(response.body.message).toBe('Failed to authenticate token.')
    })

    test("Rimozione asta non esistente dai preferiti", async () => {
        const response = await request(app).delete("/api/v1/astePreferite")
        .set("x-access-token", dummyToken)
        .send({
            userID: dummyUtente._id,
            idAsta: mongoose.Types.ObjectId()
        }).expect(404).expect("Content-Type", /json/)
        expect(response.body).toBeDefined()
        expect(response.body.success).toBe(false)
        expect(response.body.message).toBe('Asta non trovata')
    })

    test("Rimozione aste non tra i preferiti dai preferiti", async () => {
        const response = await request(app).delete("/api/v1/astePreferite")
        .set("x-access-token", dummyToken)
        .send({
            userID: dummyUtente._id,
            idAsta: dummyAsta2._id
        }).expect(409).expect("Content-Type", /json/)
        expect(response.body).toBeDefined()
        expect(response.body.success).toBe(false)
        expect(response.body.message).toBe('Asta non è tra i preferiti')
    })

    test("Rimozione asta preferita dai preferiti", async () => {
        const response = await request(app).delete("/api/v1/astePreferite")
        .set("x-access-token", dummyToken)
        .send({
            userID: dummyUtente._id,
            idAsta: dummyAsta._id
        }).expect(201).expect("Content-Type", /json/)
        expect(response.body).toBeDefined()
        expect(response.body).toMatchObject({ success: true, message: 'Asta rimossa dai preferiti',self: /\/api\/v1\/aste\/(.*)/ })
    })
});