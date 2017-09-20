// This loads the environment variables from the .env file
require('dotenv-extended').load();

var builder = require('botbuilder');
var restify = require('restify');
var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var fs = require('fs');
var util = require('util');
  

var LOBS = [];
var Products = [];

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});

// Create connector and listen for messages
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

server.post('/api/messages', connector.listen());

// Create your bot with a function to receive messages from the user
// Create bot and default message handler
var bot = new builder.UniversalBot(connector, function (session) {
session.sendTyping();
// Create connection to database
var config = {
 userName: 'testdbuser', // update me
 password: 'h#^E*9%Jgh', // update me
 server: 'testserverforpoc.database.windows.net', // update me
 options: {
 encrypt: true,
 database: 'TestChatBot', //update me
 rowCollectionOnDone:true, //for large number of data enabling this would result in huge memory usage
 rowCollectionOnRequestCompletion : true
 }
}
var connection1 = new Connection(config);

// Attempt to connect and execute queries if connection goes through
connection1.on('connect', function(err) {
if (err) {
console.log(err)
}
else{
var result2 = [];
request = new Request(
"select * from UserLog where UserName = '"+session.message .user.name+"'",
function(err, rowCount, rows) {
console.log(rowCount + ' row(s) returned');
rows.forEach(function (row){
result2.push(row[0].value);
});
if(result2.length > 0)
{
session.send("Hi "+session.message .user.name+" , How are you , Which Line of Business i can help you with today ?");
session.send("Type LOB to list the available Business areas");
session.userData.jolly = "Jolly";
}
else
{
session.send("Hi "+session.message .user.name+" , You dont have access to chat with me . Please contact administrator?");
}
}
);
connection1.execSql(request);
}
});

});

bot.set('persistUserData',false);
bot.set('persistConversationData',false);

// Add dialog to return list of shirts available
bot.dialog('LOB', function (session) {
    // var msg = new builder.Message(session);
    // msg.attachmentLayout(builder.AttachmentLayout.list)
    // msg.attachments([
    //     new builder.HeroCard(session)
    //         .buttons([
    //             builder.CardAction.imBack(session, "Display available products in Consumer LoB", "Consumer")
    //         ]),
    //     new builder.HeroCard(session)
    //         .buttons([
    //             builder.CardAction.imBack(session, "Display available products in Commercial LoB", "Commercial")
    //         ]),
// new builder.HeroCard(session)
// .buttons([
// builder.CardAction.imBack(session, "Display available products in Free services LoB", "Free services")
// ])
    // ]);
    //session.send(msg).endDialog();

session.beginDialog('LOBDialog');
}).triggerAction({ matches: /^(LOB|list)/i });


// Add dialog to handle 'options' button click
bot.dialog('LOBDialog', [
    function (session, args) {
// Create connection to database
var config = {
 userName: 'testdbuser', // update me
 password: 'h#^E*9%Jgh', // update me
 server: 'testserverforpoc.database.windows.net', // update me
 options: {
 encrypt: true,
 database: 'TestChatBot', //update me
 rowCollectionOnDone:true, //for large number of data enabling this would result in huge memory usage
 rowCollectionOnRequestCompletion : true
 }
}
var connection1 = new Connection(config);

// Attempt to connect and execute queries if connection goes through
connection1.on('connect', function(err) {
if (err) {
console.log(err)
}
else{
queryDatabase()
}
});
//session.send("Campaigns are available for below products , What product would you like to see today ?");
session.sendTyping();
function queryDatabase(){
console.log('Reading rows from the Table...');
// Read all rows from table
request = new Request(
"select ID,Entity_Name from MS_ENTITY where entity_type = 'LOB'",
function(err, rowCount, rows) {
console.log(rowCount + ' row(s) returned');
rows.forEach(function (row){
var tempcard = new builder.HeroCard(session)
.buttons([
builder.CardAction.imBack(session, "Display available LOB", row[1].value)
]);
//result2.push(tempcard);
var obj = {"ID":+row[0].value,"value":row[1].value}
LOBS.push(
obj
);
//result2.push(JSON.stringify(row, null, 2));
//console.log(JSON.stringify(row, null, 2));
});
// var msg = new builder.Message(session);
// msg.attachmentLayout(builder.AttachmentLayout.list)
// msg.attachments(JSON.stringify(rows, null, 2));
// session.send(msg).endDialog();

builder.Prompts.choice(session, "Display available LOB", LOBS,{ listStyle: builder.ListStyle.button });

}
);
connection1.execSql(request);
}
    },
    function (session, results) {
        // Save size if prompted
       if (results.response) {
var obj = LOBS[results.response.index];
session.userData.LOB = obj.ID;
session.beginDialog('LOBButtonClick');
}
    }
]).triggerAction({ matches: /(Display|Outcome)\s.*Business Area/i });

// Add dialog to handle 'options' button click
bot.dialog('LOBButtonClick', [
    function (session, args) {
// Create connection to database
var config = {
 userName: 'testdbuser', // update me
 password: 'h#^E*9%Jgh', // update me
 server: 'testserverforpoc.database.windows.net', // update me
 options: {
 encrypt: true,
 database: 'TestChatBot', //update me
 rowCollectionOnDone:true, //for large number of data enabling this would result in huge memory usage
 rowCollectionOnRequestCompletion : true
 }
}
var connection1 = new Connection(config);

// Attempt to connect and execute queries if connection goes through
connection1.on('connect', function(err) {
if (err) {
console.log(err)
}
else{
queryDatabase()
}
});
session.send("Campaigns are available for below products , What product would you like to see today ?");
session.sendTyping();
function queryDatabase(){
console.log('Reading rows from the Table...');
// Read all rows from table
var result2 = [];
request = new Request(
"Select ID,Entity_Name from MS_Entity where Entity_Parent_ID ="+session.userData.LOB,
function(err, rowCount, rows) {
console.log(rowCount + ' row(s) returned');
rows.forEach(function (row){
var tempcard = new builder.HeroCard(session)
.buttons([
builder.CardAction.imBack(session, "Display available campaign for product - Outlook", row[1].value)
]);
var objProd = {"ID":+row[0].value,"value":row[1].value}
Products.push(objProd);
//result2.push(tempcard);
result2.push(row[0].value);
});
builder.Prompts.choice(session, "Display available campaign for product - Outlook", Products,{ listStyle: builder.ListStyle.button });
}
);
connection1.execSql(request);
}
    },
    function (session, results) {
        // Save size if prompted
       if (results.response) {
  var objprod = Products[results.response.index];
session.userData.product=  objprod.ID;
session.beginDialog('reporttypeselection');
}
    }
]).triggerAction({ matches: /(Display|Outcome)\s.*LoB/i });

// choose a campaign
bot.dialog('CampaignDialog', [
    function (session, args) {

// Create connection to database
var config = {
 userName: 'testdbuser', // update me
 password: 'h#^E*9%Jgh', // update me
 server: 'testserverforpoc.database.windows.net', // update me
 options: {
 encrypt: true,
 database: 'TestChatBot', //update me
 rowCollectionOnDone:true, //for large number of data enabling this would result in huge memory usage
 rowCollectionOnRequestCompletion : true
 }
}
var connection1 = new Connection(config);

// Attempt to connect and execute queries if connection goes through
connection1.on('connect', function(err) {
if (err) {
console.log(err)
}
else{
queryDatabase()
}
});
session.sendTyping();

function queryDatabase(){
console.log('Reading rows from the Table...');
// Read all rows from table
var result2 = [];
request = new Request(
"SELECT entity_Name from Ms_Entity where entity_parent_id = 4",
function(err, rowCount, rows) {
console.log(rowCount + ' row(s) returned');
rows.forEach(function (row){
result2.push(row[0].value);
});
console.log(result2)
builder.Prompts.choice(session, "Choose a campaign.", result2,{ listStyle: builder.ListStyle.button })
}
);
connection1.execSql(request);
}
    },
    function (session, results) {
console.log('selection...' + results.response.entity.toLowerCase()); 
var titls = results.response.entity;
// Create connection to database
var config = {
 userName: 'testdbuser', // update me
 password: 'h#^E*9%Jgh', // update me
 server: 'testserverforpoc.database.windows.net', // update me
 options: {
 encrypt: true,
 database: 'TestChatBot', //update me
 rowCollectionOnDone:true, //for large number of data enabling this would result in huge memory usage
 rowCollectionOnRequestCompletion : true
 }
}
var connection1 = new Connection(config);

// Attempt to connect and execute queries if connection goes through
connection1.on('connect', function(err) {
if (err) {
console.log(err)
}
else{
queryDatabase()
}
});
session.sendTyping();
function queryDatabase(){
console.log('Reading rows from the Table...');
// Read all rows from table
var result2 = [];
request = new Request(
"SELECT entity_name,value from MS_ENTITY where entity_parent_id = 17",
function(err, rowCount, 
rows) {
console.log(rowCount + ' row(s) returned');
var objkey=[] ;
var objvalue=[];
rows.forEach(function (row){
var objCampstat = {"value":+row[1].value,"color":"#EAC130"+result2.length}
objkey.push(row[0].value);
objvalue.push(row[1].value);
result2.push(objCampstat);
});
var Canvas = require('canvas')
, canvas = new Canvas(800, 800)
, ctx = canvas.getContext('2d')
, Chart = require('nchart')
, fs = require('fs');
 
new Chart(ctx).Pie(
result2
, {
scaleShowValues: true
, scaleFontSize: 24
}
);
canvas.toBuffer(function (err, buf) {
if (err) throw err;
fs.writeFile(__dirname + '/pie1.png', buf);
});
//setTimeout(100,sendInline(session, __dirname + '/pie1.png', 'image/png', 'pie1.png'));
//sendInline(session, __dirname + '/pie1.png', 'image/png', 'pie1.png');

var barChartData = {
 labels : objkey,
 datasets : [
{
 fillColor : "rgba(220,220,220,0.5)",
 strokeColor : "rgba(220,220,220,0.8)",
 highlightFill: "rgba(220,220,220,0.75)",
 highlightStroke: "rgba(220,220,220,1)",
 data : objvalue
},
 ]
};
var Canvas = require('canvas')
 , canvas = new Canvas(800, 800)
 , ctx = canvas.getContext('2d')
 , Chart = require('nchart')
 , fs = require('fs');

 
ctx.fillStyle = '#ffa';
ctx.fillRect(0, 0, canvas.width, canvas.height);
new Chart(ctx).Bar(barChartData);

canvas.toBuffer(function (err, buf) {
 if (err) throw err;
 fs.writeFile(__dirname + '/pie.png', buf);
});
var card = createReceiptCard(session);
var msgs = new builder.Message(session).addAttachment(card);
session.send(msgs);
//sendInline(session, __dirname + '/pie.png', 'image/png', 'pie.png');
}
);
connection1.execSql(request);
}
    }
]).triggerAction({ matches: /(Display|show)\s.*campaign/i });;;

// Sends attachment inline in base64
function sendInline(session, filePath, contentType, attachmentFileName) {
    fs.readFile(filePath, function (err, data) {
        if (err) {
            
        
            return session.send('Oops. Error reading file.');
        }

        var base64 = Buffer.from(data).toString('base64');

        var msg = new builder.Message(session)
            .addAttachment({
                contentUrl: util.format('data:%s;base64,%s', contentType, base64),
                contentType: contentType,
                name: attachmentFileName
            });

        session.send(msg);
    });
}


// select a report type - Delivery Health|Outcome
bot.dialog('reporttypeselection', [
    function (session, args) {
builder.Prompts.choice(session, "Following reports are available , What type of report would you like to see today ?", "Delivery Health Report|Outcome Report",{ listStyle: builder.ListStyle.button });
    },
    function (session, results) {
session.beginDialog('CampaignDialog');
    }
]).triggerAction({ matches: /(Display|show)\s.*product/i });;

bot.dialog('/delete', (session) => {
delete session.userData
session.endDialog('Everything has been wiped out')

})
.triggerAction({
matches: /delete all/i,
confirmPrompt: "This will wipe everything out. Are you sure?"
});

function queryDB(query){
console.log('Reading rows from the Table...');
// Read all rows from table
var result2 = [];
request = new Request(
query,
function(err, rowCount, rows) {
console.log(rowCount + ' row(s) returned');
rows.forEach(function (row){
result2.push(row[0].value);
});
}
);
connection1.execSql(request);
}

function createReceiptCard(session) {
    return new builder.ReceiptCard(session)
        .title('Report')

        .items([
            builder.ReceiptItem.create(session, '100000', 'Actual Sent')
                .quantity(100000),
               // .image(builder.CardImage.create(session, 'https://github.com/amido/azure-vector-icons/raw/master/renders/traffic-manager.png')),
            builder.ReceiptItem.create(session, '90000', 'Read')
                .quantity(90000),
                //.image(builder.CardImage.create(session, 'https://github.com/amido/azure-vector-icons/raw/master/renders/cloud-service.png')),
            builder.ReceiptItem.create(session, '90000', 'Read')
                .quantity(90000),
               // .image(builder.CardImage.create(session, 'https://github.com/amido/azure-vector-icons/raw/master/renders/cloud-service.png')),
            builder.ReceiptItem.create(session, '80000', 'Bounced')
                .quantity(90000)
               // .image(builder.CardImage.create(session, 'https://github.com/amido/azure-vector-icons/raw/master/renders/cloud-service.png'))
        ]);
}