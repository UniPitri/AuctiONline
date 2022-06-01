const request  = require('supertest');
const app      = require('./app');
const mongoose = require('mongoose');
const Utente = require('./models/utente');
 
describe('POST /api/v1/autenticazione', () => {
    let connection;

    beforeAll( async () => {
        jest.setTimeout(8000);
        jest.unmock('mongoose');
        connection = await  mongoose.connect(process.env.DB_URL, {useNewUrlParser: true, useUnifiedTopology: true});
        console.log('Database connected!');
        await request(app).post('/api/v1/registrazione').send({
            username: "test",
            password: "test",
            email: "test@test",
            name: "test",
            surname: "test",
        })
    });

    afterAll(async () => {
        await Utente.deleteOne({Username: "test"});
        await Utente.deleteOne({Username: "test2"});
        await mongoose.connection.close();
    });

    test("Registrazione con email già associata ad un account", async () => {
        const response = await request(app).post("/api/v1/registrazione").send({
            username: "test2",
            password: "test2",
            email: "test@test"
        }).expect(409).expect("Content-Type", /json/)
        expect(response.body).toBeDefined()
        expect(response.body.success).toBe(false)
        expect(response.body.message).toBe('Email già in utilizzo')
    })

    test("Registrazione con username già utilizzato", async () => {
        const response = await request(app).post("/api/v1/registrazione").send({
            username: "test",
            password: "test2",
            email: "test2@test"
        }).expect(409).expect("Content-Type", /json/)
        expect(response.body).toBeDefined()
        expect(response.body.success).toBe(false)
        expect(response.body.message).toBe('Username già in utilizzo')
    })    

    test("Registrazione riuscita di un nuovo utente", async () => {
        const response = await request(app).post("/api/v1/registrazione").send({
            username: "test2",
            password: "test2",
            email: "test2@test"
        }).expect(201).expect("Content-Type", /json/)
        expect(response.body).toBeDefined()
        expect(response.body).toMatchObject({ success: true, message: 'Nuovo Utente registrato con successo',token: /(.*)/, email: /(.*)/, id: /(.*)/,self: /\/api\/v1\/utenti\/(.*)/ })
    }) 
})