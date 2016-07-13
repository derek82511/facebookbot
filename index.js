let express = require('express');
let bodyParser = require('body-parser');
let request = require('request');

let facebookbot = require('./facebookbot');

let app = express();

app.set('port', (process.env.PORT || 5000));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', function(req, res) {
    res.send('home');
});

app.get('/webhook', facebookbot.verify);

app.post('/webhook', facebookbot.callback);

app.listen(app.get('port'), function() {
    console.log('App is running on port', app.get('port'));
});