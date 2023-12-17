# Noroff

## Back-end Development Year 1

### EP - Course Assignment

#### David Hansen

---

.env example

ADMIN_USERNAME = "Admin"
ADMIN_PASSWORD = "Admin"
DATABASE_NAME = "ecommerce"
DIALECT = "mysql"
DIALECTMODEL = "mysql2"
PORT = "3000"
HOST = "localhost"
PRODUCTS_API = "http://backend.restapi.co.za/items/products"
TOKEN_SECRET= "Long random text"

---

Instructions:

Visual Studios Code:

1. Download the repository.
2. Open the repository in Visual Studios Code.
3. Open the terminal and type "npm install".
4. In the root of the folder create a .env and copy the .env example to it
5. Update the "PRODUCTS_API" if needed.
6. Type "node" in the terminal and then "require('crypto').randomBytes(64).toString('hex')".
7. Add the result to "TOKEN_SECRET".

MySQL Workbench:

1. Open MySQL Workbench. (if you dont have it, download and install https://dev.mysql.com/downloads/installer/ then https://dev.mysql.com/downloads/workbench/)
2. Login to workbench.
3. Open a new SQL Query and enter "CREATE DATABASE Ecommerce" and run it. Or chose a diffrent name, if you do, update the "DATABASE_NAME" in the .env.
4. Press Administration.
5. Press Users and Privileges and chose whitch account to use with the database or add a new one.
6. Press Administrative Roles and give all roles. Press Apply.
7. Press Schema Privileges and then Add Entry...
8. Chose Selected schema and chose Ecommerce or the name you created for the database. Press OK.
9. Press Select "Select ALL" to give that user all the privileges to the database. Then Apply.
10. Update the "ADMIN_USERNAME" and "ADMIN_PASSWORD" in the .env to the username and password of the user that is granted the privileges.

Populate the database:

1. in Visual Studios Code, in the terminal type "npm start".
2. You can either go to http://localhost:3000/admin/ and press the Populate button. Or go to postman and to a POST method to http://localhost:3000/init.

If you do not have postman you can download it from here https://www.postman.com/downloads/

This creates a Admin user with Email: "admin@noroff.no" and Password: "P@ssword2023"
You can change or add a new Admin user and delete the old one if you want on the page. 
The new user will always be a "User" but this can be upgraded to a "Admin" when you edit the user.
To delete the old Admin user you have to change it to "User" or it will not delete it.

go to http://localhost:3000/doc for documentation 

Run a test:

1. Run the application with "npm start".
2. Press the + button in the terminal (top right side).
3. In the new window type "npm test".

---

Nodejs version v18.16.0

axios version 1.6.2
body-parser version 1.20.2
cookie-parser version 1.4.4
debug version 2.6.9
dotenv version 16.3.1
ejs version 3.1.9
email-validator version 2.0.4
express version 4.18.2
http-errors version 1.6.3
jest version 29.7.0
jsonwebtoken version 9.0.2
morgan version 1.9.1
mysql version 2.18.1
mysql2 version 3.6.4
sequelize version 6.35.1
supertest version 6.3.3
swagger-autogen version 2.23.7
swagger-ui-express version 5.0.0
