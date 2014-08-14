var Metalsmith = require("metalsmith"),
    markdown = require("metalsmith-markdown"),
    collections = require("metalsmith-collections"),
    permalinks = require("metalsmith-permalinks"),
    templates = require("metalsmith-templates"),
    less = require("metalsmith-less"),
    branch = require("metalsmith-branch"),

    Handlebars = require("handlebars"),
    path = require("path")

Handlebars.registerHelper("basename", function(input) {
  return new Handlebars.SafeString(
    path.basename(input)
  )
})

function log() {
  return function(files, metalsmith, done) {
    console.log(files)
    done()
  }
}

Metalsmith(__dirname)
  .source("./site")
  .use(markdown())
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
  .use(log())
  .destination("./dist")
  .build(function(err) {
    if (err) console.error(err)
  })
