const express = require ('express');
const bodyParser = require ('body-parser')



const app =  express()

app.use(bodyParser.json());//api entender informações em json
app.use(bodyParser.urlencoded({ extended: false})); //descodar parametros de uma url

//referencia o controle de autenticação autController
require('./Controllers/autController')(app);
require('./Controllers/projectController')(app);


app.listen(3001, () => {
    console.log("Servidor Rodando");
});