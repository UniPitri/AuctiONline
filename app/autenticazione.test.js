
/**
 * https://www.npmjs.com/package/supertest
 */
 const request  = require('supertest');
 const app      = require('./app');
 const jwt      = require('jsonwebtoken'); // used to create, sign, and verify tokens
 const mongoose = require('mongoose');
 
describe('POST /api/v1/autenticazione', () => {
    test("Login con account non registrato", async () => {
        const response = await request(app).post("/api/v1/autenticazione").send({
            username: "UsernameNonRegistrato",
            password: "PasswordNonRegistrata",
        }).expect(401).expect("Content-Type", /json/)
        expect(response.body).toBeDefined()
        expect(response.body.success).toBe(false)
        expect(response.body.message).toBe('Autenticazione fallita. Utente o password errati')
    })

    test("Login con password sbagliata", async () => {
        const response = await request(app).post("/api/v1/autenticazione").send({
            username: "a",
            password: "nonPasswordDiA",
        }).expect(401).expect("Content-Type", /json/)
        expect(response.body).toBeDefined()
        expect(response.body.success).toBe(false)
        expect(response.body.message).toBe('Autenticazione fallita. Utente o password errati')
    })

    test("Login con campo username vuoto", async () => {
        const response = await request(app).post("/api/v1/autenticazione").send({
            username: "a",
            password: "nonPasswordDiA",
        }).expect(401).expect("Content-Type", /json/)
        expect(response.body).toBeDefined()
        expect(response.body.success).toBe(false)
        expect(response.body.message).toBe('Autenticazione fallita. Utente o password errati')
    })

    test("Login utilizzando un account registrato", async () => {
        const response = await request(app).post("/api/v1/autenticazione").send({
            username: "a",
            password: "a",
        }).expect(201).expect("Content-Type", /json/)
        expect(response.body).toBeDefined()
        expect(response.body).toMatchObject({ success: true, message: 'Enjoy your token!',token: /(.*)/, email: /(.*)/, id: /(.*)/,self: /\/api\/v1\/utenti\/(.*)/ })
    })
 });