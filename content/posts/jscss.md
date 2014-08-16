---
title: "Embedding CSS in JavaScript - JsCSS"
slug: "embedding-css-in-javascript"
date: "2014-04-25"
template: post.hbs
---

Several CSS preprocessors have problems with actions as complex as loops.
They often implement a complex language.

JsCSS is an experimental approach at solving a few problems of these problems.

React recently brought us an interesting feature: JSX -
a language making it possible to embed XML objects/HTML DOM nodes into JavaScript.
JSX will be compiled to JavaScript. The XML tags will become calls to functions.

To copy directly from the [React/JSX Documentation](http://facebook.github.io/react/docs/jsx-in-depth.html):

JSX
```JavaScript
var app =   <Nav color="blue">
			  <Profile>click</Profile>
        	</Nav>;
```

which will be compiled to this:
```
var app = Nav(
  {color:"blue"},
  Profile(null, "click")
);
```

JsCSS, the small CSS preprocessor I recently created, converts JavaScript with embedded CSS into CSS.
Complex actions are not a problem.

JsCSS
```
for (var i = 0; i < 5; i++) {
  div .hello:nth-child(|i|) {
    color: rgb(| i * 10 |, 20, |i * 20|);
  }
}
```
will be converted to a repetitive sequence.
```
div .hello:nth-child(0) {
  color: rgb(0, 20, 0);
}

div .hello:nth-child(1) {
  color: rgb(10, 20, 20);
}

div .hello:nth-child(2) {
  color: rgb(20, 20, 40);
}

div .hello:nth-child(3) {
  color: rgb(30, 20, 60);
}

div .hello:nth-child(4) {
  color: rgb(40, 20, 80);
}

```

The input goes through two stages.
First it is converted to an intermediate form, then it is interpreted by the JavaScript runtime.

Here is the intermediate output:

```
for (var i = 0; i < 5; i++) {
	css(
    "div .hello:nth-child(",
    i,
    ") { color: rgb(",
    i * 10 ,
    ",
    20,
    ",
    i * 20,
    "); }"
    );
}
```

Inline CSS is now a `css()` function, which the interpreter will provide, concatenating the input while giving it access to the outer variables.

See [JsCSS](https://github.com/AlexanderSelzer/jscss). It is quite useful.
