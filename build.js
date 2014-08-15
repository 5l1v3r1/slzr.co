var Metalsmith = require("metalsmith"),
    markdown = require("metalsmith-markdown"),
    collections = require("metalsmith-collections"),
    permalinks = require("metalsmith-permalinks"),
    templates = require("metalsmith-templates"),
    less = require("metalsmith-less"),
    branch = require("metalsmith-branch"),

    Handlebars = require("handlebars"),
    highlight = require("highlight.js"),
    path = require("path")

Handlebars.registerHelper("basename", function(input) {
  return new Handlebars.SafeString(
    path.basename(input)
  )
})

Handlebars.registerHelper("formatdate", function(date) {
  return new Handlebars.SafeString(
    date.getFullYear() + ", " + date.getMonth() + ", " + date.getDay()
  )
})

function log() {
  return function(files, metalsmith, done) {
    console.log(files)
    done()
  }
}

Metalsmith(__dirname)
  .source("./content")
  .use(markdown({
    highlight: function(text) {
      return highlight.highlightAuto(text).value
    }
  }))
  .use(collections({
    posts: {
      pattern: "posts/*",
      reverse: true,
      sortBy: "date"
    }
  }))
  .use(branch("posts/*")
    .use(permalinks({
      pattern: ":title"
    }))
  )
  .use(templates("handlebars"))
  .use(less())
  .destination("./dist")
  .build(function(err) {
    if (err) console.error(err)
  })
