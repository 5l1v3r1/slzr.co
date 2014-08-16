---
title: "Node's vm module"
slug: "nodes-vm-module"
date: "2014-03-27"
template: post.hbs
---

`vm` is a not-so-well-known but very useful module integrated into the node.js core.

It works similarily to `eval()`, but in a more isolated fashion. Therefore the JavaScript executed can run isolated from the rest of the process.

To try out vm, I wanted to create a node.js console over websockets. The user can write JavaScript, which is sent to the server and executed in a sandbox. Output is collected and sent back to the client.

Besides being for fun, this can also be useful for playing with node.js while not in front of a computer with it installed, or for experimenting conveniently.

### Usage of vm

See [the documentation](http://nodejs.org/api/vm.html#vm_executing_javascript) for all of `vm`'s methods.

`vm.runInContext(js, context)` will be passed a string of JavaScript and a context object created with `vm.createContext(sandbox)`.

A sandbox is simply an object that will be converted to a context.

#### an example

```JavaScript
var vm = require("vm");

var context = vm.createContext({
  a: "",
  b: 6,
  c: [0, 3]
});

vm.runInContext(
'a = "hello"; b++; c.push("hi")'
, context);

console.dir(context);
```

This will return `{ a: 'hello', b: 7, c: [ 0, 3, 'hi' ] }`


Obviously there should to be a way to log output.
Attempting to use `console.log` will throw an error.

`ReferenceError: console is not defined`

We could pass `console` through the sandbox like this:

```JavaScript
vm.createContext({
  "console": console
});
```

This doesn't do what is needed. The virtual machine will log into the standard output stream of the main process.

Reimplementing `console` is the solution (see [the file](https://github.com/AlexanderSelzer/node-web-console/blob/master/lib/vconsole.js)).

```JavaScript
var util = require("util");

function vmConsole() {
  this.output = "";
}

vmConsole.prototype.log = function() {
  this.output += util.format.apply(this, arguments) + "\n";
}
```

In contrast to the [node source](https://github.com/joyent/node/blob/master/lib/console.js), it does not write into a stream, and to a local variable, which can be inspected after the VM has finished execution :)

```JavaScript
var vm = require("vm");

var context = vm.createContext({
  console: new vmConsole()
});

vm.runInContext('console.log("hello"); console.log("hi"); console.log([4])', context);

console.dir(context);
console.log(context.console.output);
```

Now it works better:

```
{ console: { output: 'hello\nhi\n[ 4 ]\n' } }
hello
hi
[ 4 ]
```

### vm + socket.io

Socket.io is very stable, and always uses the fastest transfer option; WebSockets in modern browsers.
This makes it feel like directly typing into a Node.js console.

It is also great for experimenting with node.js, and more convenient than
"`vim test.js :wq node test.js`" (just my opinion :)

Here is the server-side application:
```JavaScript
var io = require("socket.io").listen(8767);

io.sockets.on("connection", function(socket) {
  socket.on("js", function(data) {
    console.log("Received:", data);

    var context = vm.createContext({
      "console": new vmConsole,
      "path": path,
      "Buffer": Buffer,
      "os": os,
      "url": url
    });

    try {
    	vm.runInContext(data, context);
    }
	catch (err) {
      // Errors shouldn't crash the server
      console.log(err);
      socket.emit("error", err.message);
    }

    socket.emit("output", context.console.output);
  });
});
```

It exports non-dangerous (to some extent) objects to the VM.
`vm.runInContext` is wrapped in a try-catch to catch any reference errors from non-existing variables.

See the example on the [GitHub page](https://github.com/AlexanderSelzer/node-web-console), which shows how this can be used.
