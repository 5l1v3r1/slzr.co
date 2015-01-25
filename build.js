var Metalsmith = require("metalsmith"),
    markdown = require("metalsmith-markdown"),
    collections = require("metalsmith-collections"),
    permalinks = require("metalsmith-permalinks"),
    templates = require("metalsmith-templates"),
    ignore = require("metalsmith-ignore"),
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
    done()
  }
}

// Replaces auto-generated slug for custom slug if there is a slug field.
// Only works in this specific case, with permalinks...
function manualSlugs(files, metalsmith, done) {
  Object.keys(files).forEach(function(key) {
    var file = files[key]
    if (file.slug !== undefined) {
      delete files[key]
      file.path = file.slug
      files[file.slug + "/index.html"] = file
    }
  })
  done()
}

function ignoreDrafts(files, metalsmith, done) {
  Object.keys(files).forEach(function(key) {
    console.log(files[key])
    if (files[key].draft !== undefined) {
      delete files[key]
    }
  })
  done()
}

Metalsmith(__dirname)
  .source("./content")
  .use(ignore(
    "images/**/*.src.jpg"
  ))
  .use(ignoreDrafts)
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
  .use(manualSlugs)
  .use(templates("handlebars"))
  .use(less())
  .destination("./dist")
  .build(function(err) {
    if (err) console.error(err)
  })
