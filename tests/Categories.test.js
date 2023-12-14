const express = require('express');
const request = require('supertest');
const URL = 'http://localhost:3000';
const bodyParser = require("body-parser");


var token;
var categoryId;
var userId;
var oldCategory;
var productId;

describe('testing category-products-failLogin-login-addCategory-addProduct-changeCategoryName-changeProductName-changeCategory-deleteProduct-deleteCategory ', () => {

    test('GET /categories- success', async () => {
        await request(URL).get('/categories')
        const { body } = await request(URL).get('/categories')
        expect(body).toHaveProperty('result');
        expect(body.result).toEqual("Success")
    });

    test('GET /products- success', async () => {
        await request(URL).get('/categories')
        const { body } = await request(URL).get('/products')
        expect(body).toHaveProperty('result');
        expect(body.result).toEqual("Success")
    });

    test('POST auth/login - fail', async () => {
        const credentials = { Email: 'testFail', Password: 'testfail' };
        const { body } = await request(URL).post('/auth/login').send(credentials);
        expect(body).toHaveProperty("status");
        expect(body.status).toEqual("error")
    });

    test('POST auth/login - success', async () => {
        const credentials = { Email: 'admin@noroff.no', Password: 'P@ssword2023' };
        const { body } = await request(URL).post('/auth/login').send(credentials);
        expect(body).toHaveProperty("result");
        expect(body).toHaveProperty('token');
        token = body.token;
        userId = body.UserId;
    });

    test('POST /categories/add - success', async () => {
        let categoryObj = { "Name": "TEST_CATEGORY", }
        const { body } = await request(URL).post("/categories/add").set('Authorization', 'Bearer ' + token).send(categoryObj);
        expect(body.result).toEqual("Success")
        categoryId = body.addedCategory.Id;
        expect(body.addedCategory.Name).toEqual("TEST_CATEGORY")
    });
    
    test('POST /products/add - success', async () => {
        let ProductObj = {
            "Name": "TEST_PRODUCT",
            "ImageURL": "http://143.42.108.232/products/test.png",
            "Description": "Test Product",
            "Price": 213,
            "Quantity": 12,
            "Brand": 1,
            "Category": "TEST_CATEGORY"
         }
        const { body } = await request(URL).post("/products/add").set('Authorization', 'Bearer ' + token).send(ProductObj);
        expect(body.result).toEqual("Success")
        productId = body.addedProduct.Id;
    });

    test('PUT /categories/change/:id - success', async () => {
        let categoryObj = { "Name": "TEST_CATEGORY2", }
        const { body } = await request(URL).put("/categories/change/" + categoryId).set('Authorization', 'Bearer ' + token).send(categoryObj);
        expect(body.result).toEqual("Success")
        expect(body.oldName.Name).toEqual("TEST_CATEGORY")
        expect(body.newName.Name).toEqual("TEST_CATEGORY2")
    });

    test('PUT /products/change/:id - success', async () => {
        let ProductObj = {
            "Name": "TEST_PRODUCT2",
            "ImageURL": "http://143.42.108.232/products/test.png",
            "Description": "Test Product",
            "Price": 213,
            "Quantity": 12,
            "Brand": 1,
            "Category": "TEST_CATEGORY2"
         }
        const { body } = await request(URL).put("/products/edit/" + productId).set('Authorization', 'Bearer ' + token).send(ProductObj);
        expect(body.result).toEqual("Success")
    });

    test('PUT /categories/product/:id - success', async () => {
        let categoryObj = { "newCategory": "Phones", }
        const { body } = await request(URL).put("/categories/product/" + productId).set('Authorization', 'Bearer ' + token).send(categoryObj);
        expect(body.Result).toEqual("Success")
        expect(body.OldCategory).toEqual("TEST_CATEGORY2")
        expect(body.NewCategory).toEqual("Phones")
    });

    test('DELETE /products/delete/delete/:id - success', async () => {
        
        const { body } = await request(URL).delete("/products/delete/delete/" + productId).set('Authorization', 'Bearer ' + token);
        expect(body.result).toEqual("Success")
    });

    test('DELETE /categories/delete/:id - success', async () => {
        
        const { body } = await request(URL).delete("/categories/delete/" + categoryId).set('Authorization', 'Bearer ' + token);
        expect(body.result).toEqual("Success")
    });
});

