---
title: "nodemailer + mailgun"
date: "2014-03-28"
template: post.hbs
---

Setting up anything in any way related to email ends up in trouble quite often.

for [Branches](http://branches.io), there is a need to send emails verifying users. Later news will be sent too

It could be done using Gmail or Amazon SES, but Mailgun seemed like the best choice.
It is cheap and includes 10.000 free emails per month for starting.
SES even requires verification to send 100+ mails per day, and because Mailgun was so easy to set up and just scales up into production, there was no need to create just another Gmail account .

However, documentation on using Mailgun with Nodemailer is somehow thin.

Mailgun provides HTTP and SMTP interfaces. This seemed to confuse a few people including me.

The nice [CURL example](http://documentation.mailgun.com/quickstart.html#sending-messages) is using the HTTP API for sending the mail.

Nodemailer uses SMTP. It does not have special Mailgun bindings, but it knows address and ports.

[This](http://stackoverflow.com/questions/13738392/how-to-attach-files-to-post-request-to-mailguns-api-using-node-js-and-the-reque) looks like a good answer, but it does not work.

The API uses HTTP basic authentication; a user `api` with the generated API key as password.

This key:

![](../images/posts/nodemailer-mailgun/key.jpg)

When initializing the transport like this:

```JavaScript
 var smtp = nodemailer.createTransport("SMTP",  {
   service: "Mailgun",
   auth: {
     user: "mail@branches.io",
 	pass: "supersecretkey"
   }
});
```
SMTP is used

The credentials should be generated under the domain settings and "Manage SMTP credentials".

![](../images/posts/nodemailer-mailgun/smtp.jpg)
