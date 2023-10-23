# Stock2Shop RESTful server demo

S2S Interview REST server.

Below is an explanation of the technologies used.

## Technologies

### core

- Node.js

### libraries

- express.js: easy to use framework for node that makes creating routes easy, simple and maintainable
- SQLite3: as test database for api
- body-parser: parses json data in endpoints on the fly
- nodemon: easy to use node development server

## why node

- I am comfortable using javascript and node
- Node is non blocking and fast (can handle a large number of concurrent requests)
- large ecosystem and easy to learn
- Node supports middleware which makes it cleaner and easier to use
- Easy to scale as you can just add more instances to your existing server
- various tools available for performance monitoring

## how to build

- Clone repo
- open a cmd in the root folder
- run the command "npm install"
- run "npm start"

## using the api

- make sure the server is running by checking the terminal opened in the previous step
- go to localhost:3000/v1/products?sku=1 (feel free to change the ID, values between 1 and 10 will work)
- use postman or similar tool to create a post request, similar to the above but an sku is optional.
