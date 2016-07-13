let request = require('request');
let config = require('./config');

function receivedMessage(event) {
    let senderID = event.sender.id;
    let recipientID = event.recipient.id;
    let timeOfMessage = event.timestamp;
    let message = event.message;

    console.log("Received message for user %d and page %d at %d with message:", senderID, recipientID, timeOfMessage);
    console.log(JSON.stringify(message));

    //let messageId = message.mid;

    let messageText = message.text;
    let messageAttachments = message.attachments;

    if (messageText) {
        sendTextMessage(senderID, "文字訊息");
    } else if (messageAttachments) {
        messageAttachments.forEach(function(messageAttachment){
            switch(messageAttachment.type){
                case 'image':
                    sendTextMessage(senderID, "圖片");
                    break;
                case 'audio':
                    sendTextMessage(senderID, "音檔");
                    break;
                case 'video':
                    sendTextMessage(senderID, "影片");
                    break;
                case 'file':
                    sendTextMessage(senderID, "檔案");
                    break;
                case 'location':
                    sendTextMessage(senderID, "位置");
                    break;
                default:
                    sendTextMessage(senderID, "無法分辨");
            }
        });
    }
}

function sendTextMessage(recipientId, messageText) {
    let messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            text: messageText
        }
    };

    callSendAPI(messageData);
}

function callSendAPI(messageData) {
    request({
        uri: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: config.PageAccessToken },
        method: 'POST',
        json: messageData
    }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            let recipientId = body.recipient_id;
            let messageId = body.message_id;

            console.log("Successfully sent generic message with id %s to recipient %s", messageId, recipientId);
        } else {
            console.error("Unable to send message.");
            console.error(response);
            console.error(error);
        }
    });  
}

function verify(req, res) {
    if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === config.VerifyToken) {
        console.log("Validating webhook");
        res.status(200).send(req.query['hub.challenge']);
    } else {
        console.error("Failed validation. Make sure the validation tokens match.");
        res.sendStatus(403);
    }
}

function callback(req, res) {
    let data = req.body;

    if (data.object == 'page') {
        data.entry.forEach(function(pageEntry) {
            let pageID = pageEntry.id;
            let timeOfEvent = pageEntry.time;

            pageEntry.messaging.forEach(function(messagingEvent) {
                if (messagingEvent.optin) {
                    //receivedAuthentication(messagingEvent);
                } else if (messagingEvent.message) {
                    receivedMessage(messagingEvent);
                } else if (messagingEvent.delivery) {
                    //receivedDeliveryConfirmation(messagingEvent);
                } else if (messagingEvent.postback) {
                    //receivedPostback(messagingEvent);
                } else {
                    console.log("Webhook received unknown messagingEvent: ", messagingEvent);
                }
            });
        });

        res.sendStatus(200);
    }
}

module.exports = {
    verify: verify,
    callback: callback
};