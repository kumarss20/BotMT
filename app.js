// This loads the environment variables from the .env file
require('dotenv-extended').load();

var builder = require('botbuilder');
var restify = require('restify');
var Connection = require('tedious').Connection;
var Request = require('tedious').Request;


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
				  userName: 'kumarss', // update me
				  password: 'Hahaha123#', // update me
				  server: 'mtbot.database.windows.net', // update me
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
											"select * from UserLog where UserID = '"+session.message .user.id+"'",
											function(err, rowCount, rows) {
												console.log(rowCount + ' row(s) returned');
												rows.forEach(function (row){
													result2.push(row[0].value);
												});
											if(result2.length > 0)
											{
												session.say('Hello World', 'This is the text that will be spoken by Cortana.');
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

// Add dialog to return list of shirts available
bot.dialog('LOB', function (session) {
    var msg = new builder.Message(session);
    msg.attachmentLayout(builder.AttachmentLayout.list)
    msg.attachments([
        new builder.HeroCard(session)
            .buttons([
                builder.CardAction.imBack(session, "Display available products in Consumer LoB", "Consumer")
            ]),
        new builder.HeroCard(session)
            .buttons([
                builder.CardAction.imBack(session, "Display available products in Commercial LoB", "Commercial")
            ]),
		new builder.HeroCard(session)
			.buttons([
				builder.CardAction.imBack(session, "Display available products in Free services LoB", "Free services")
		])
    ]);
    session.send(msg).endDialog();
}).triggerAction({ matches: /^(LOB|list)/i });

// Add dialog to handle 'options' button click
bot.dialog('LOBButtonClick', [
    function (session, args) {
				// Create connection to database
				var config = {
				  userName: 'kumarss', // update me
				  password: 'Hahaha123#', // update me
				  server: 'mtbot.database.windows.net', // update me
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
						"select distinct product from product p inner join campaign c on c.productid = p.id",
						function(err, rowCount, rows) {
							console.log(rowCount + ' row(s) returned');
							rows.forEach(function (row){
								
							var tempcard = new builder.HeroCard(session)
												.buttons([
													builder.CardAction.imBack(session, "Display available campaign for product - Outlook", row[0].value)
												]);
												
								//result2.push(tempcard);
								result2.push(row[0].value);
							});
							
							builder.Prompts.choice(session, "Display available campaign for product - Outlook", result2,{ listStyle: builder.ListStyle.button });

							console.log(result2)
							// var msg = new builder.Message(session);
							// 	msg.attachmentLayout(builder.AttachmentLayout.list)
							// 	msg.attachments(result2);
							// 	session.send(msg).endDialog();
									}
								);
								
							connection1.execSql(request);
				}
    },
    function (session, results) {
        // Save size if prompted
       if (results.response) {
			session.userData.product=  results.response.entity;
			session.beginDialog('reporttypeselection');
			}
    }
]).triggerAction({ matches: /(Display|Outcome)\s.*LoB/i });

// choose a campaign
bot.dialog('CampaignDialog', [
    function (session, args) {

			// Create connection to database
				var config = {
				  userName: 'kumarss', // update me
				  password: 'Hahaha123#', // update me
				  server: 'mtbot.database.windows.net', // update me
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
						"SELECT distinct CAMPAIGNNAME from campaign where product = '"+session.userData.product+"'",
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
				  userName: 'kumarss', // update me
				  password: 'Hahaha123#', // update me
				  server: 'mtbot.database.windows.net', // update me
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
						"SELECT TOP 1 ACTUALSENT,DEVLIVERED,BOUNCED,UNSUBSCRIBED,CLICKED,OPENED from campaign where campaignname = '" + titls +"'",
						function(err, rowCount, rows) {
							console.log(rowCount + ' row(s) returned');
							
							    rows.forEach(function (columns) {
								var rowObject = {};
								columns.forEach(function (column) {
											//var tempcard = new builder.ReceiptItem.create(session,column.value,column.metadata.colName)
												//.image(builder.CardImage.create(session, 'https://maxcdn.icons8.com/Share/icon/nolan/Messaging//sent1600.png'))
											//result2.push(tempcard);
											
								// 			var tempcard = new builder.HeroCard(session)
								// 				.buttons([
								// 					builder.CardAction.imBack(session, column.metadata.colName +"  -   "+ column.value, column.value)
								// 				]);
												
								// result2.push(tempcard);

								session.send(column.metadata.colName +"  -   "+ column.value);
				
								});
								});
							    // var msg = new builder.Message(session);
								// msg.attachmentLayout(builder.AttachmentLayout.list)
								// msg.attachments([
									
								// 	msg.attachments(result2)
								// 	//new builder.ReceiptCard(session)
								// 	//.title(titls)
								// 	//.items(result2)
								// 	//.buttons([
								// 	//	builder.CardAction.openUrl(session, 'https://azure.microsoft.com/en-us/pricing/', 'More Information')
								// 	//		.image('https://raw.githubusercontent.com/amido/azure-vector-icons/master/renders/microsoft-azure.png')
								// 	//])
								// ]);
								// session.send(msg).endDialog();
						}
					);
				connection1.execSql(request);
				}
		//session.beginDialog('flipCoinDialog');
    }
]);

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