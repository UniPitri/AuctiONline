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

describe('GET /api/v1/utenti/:id/aste', () => {
    let dummyUtente;
    let dummyAsta1;
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
        dummyAsta1 = await new Asta({
            DettagliProdotto:{Nome:"prodottoTest1", Categorie:["t4","t5"],Descrizione:"Descrizione",Foto:["foto5.jpeg","foto6.png"]},
            DettagliAsta:{Inizio:"2022-05-25T09:35:00.000+00:00",Fine:"2022-05-31T09:35:00.000+00:00",Tipo:0,PrezzoMinimo:24,Venditore:mongoose.Types.ObjectId(),Offerte:[40, 35.50],Offerenti:[dummyUtente._id, mongoose.Types.ObjectId()]},
            Preferenze: []
        }).save();
        dummyAsta2 = await new Asta({
            DettagliProdotto:{Nome:"prodottoTest2", Categorie:["t4","t5"],Descrizione:"Descrizione",Foto:["foto5.jpeg","foto6.png"]},
            DettagliAsta:{Inizio:"2022-05-25T09:35:00.000+00:00",Fine:"2022-06-31T09:35:00.000+00:00",Tipo:0,PrezzoMinimo:24,Venditore:mongoose.Types.ObjectId(),Offerte:[40],Offerenti:[mongoose.Types.ObjectId()]},
            Preferenze: [dummyUtente._id]
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

    test("Visione aste vinte con token non valido", async () => {
        const response = await request(app).get("/api/v1/utenti/"+dummyUtente._id+"/aste?get=vinte")
        .set("x-access-token", invalidToken)
        .send().expect(403).expect("Content-Type", /json/)
        expect(response.body.success).toBe(false)
        expect(response.body.message).toBe('Failed to authenticate token.')
    })

    test("Visione aste vinte", async () => {
        const response = await request(app).get("/api/v1/utenti/"+dummyUtente._id+"/aste?get=vinte")
        .set("x-access-token", dummyToken)
        .send().expect(200).expect("Content-Type", /json/)
        expect(response.body).toBeDefined()
    })

    test("Visione aste preferite con token non valido", async () => {
        const response = await request(app).get("/api/v1/utenti/"+dummyUtente._id+"/aste?get=preferite")
        .set("x-access-token", invalidToken)
        .send().expect(403).expect("Content-Type", /json/)
        expect(response.body.success).toBe(false)
        expect(response.body.message).toBe('Failed to authenticate token.')
    })

    test("Visione aste preferite", async () => {
        const response = await request(app).get("/api/v1/utenti/"+dummyUtente._id+"/aste?get=preferite")
        .set("x-access-token", dummyToken)
        .send().expect(200).expect("Content-Type", /json/)
        expect(response.body).toBeDefined()
    })
});