#!/usr/bin/env node

require('dotenv-safe').load()

const del = require('del')
const electronDocs = require('electron-docs')
const fs = require('fs')
const got = require('got')
const mkdir = require('make-dir').sync
const objectifyArray = require('objectify-array')
const path = require('path')
const shakeTree = require('shake-tree')
const YAML = require('js-yaml')

const englishBasepath = path.join(__dirname, '..', 'content', 'en')
const GitHub = require('github')
const github = new GitHub({
  debug: false,
  Promise: Promise,
  token: process.env.GITHUB_TOKEN
})

let release

del(englishBasepath)
  .then(fetchRelease)
  .then(fetchDocs)
  .then(writeDocs)
  .then(fetchApiData)
  .then(writeApiData)
  .then(writeApiDescriptions)
  .then(fetchWebsiteContent)
  .then(writeWebsiteContent)

function fetchRelease (tag) {
  let fetcher
  let repo = {owner: 'electron', repo: 'electron'}

  if (false && tag && tag.length) {
    console.log(`Fetching Electron ${tag}`)
    fetcher = github.repos.getReleaseByTag(Object.assign(repo, {tag: tag}))
  } else {
    console.log('Fetching the latest release of Electron')
    fetcher = github.repos.getLatestRelease(repo)
  }

  return fetcher
  .catch(err => {
    console.error(`Unable to fetch latest Electron release`)
    throw err
  }).then(r => {
    release = r.data
    return Promise.resolve()
  })
}

function fetchDocs () {
  console.log(`Fetching ${release.tag_name} docs from electron/electron repo`)

  return electronDocs(release.tag_name)
    .then(docs => {
      const nonApiDocs = docs.filter(doc => !doc.filename.split(path.sep).includes('api'))
      return Promise.resolve(nonApiDocs)
  }).catch(err => {
    console.error(`Unable to fetch docs for Electron ${release.tag_name}`)
    throw err
  })
}

function writeDocs (docs) {
  console.log(`Writing ${docs.length} markdown docs`)

  docs.forEach(doc => {
    const filename = path.join(englishBasepath, 'docs', doc.filename)
    mkdir(path.dirname(filename))
    fs.writeFileSync(filename, doc.markdown_content)
    console.log('   ' + path.relative(englishBasepath, filename))
  })

  return Promise.resolve()
}

function fetchApiData () {
  console.log(`Fetching API definitions`)
  const asset = release.assets.find(asset => asset.name === 'electron-api.json')

  if (!asset) {
    return Promise.reject(Error(`No electron-api.json asset found for ${release.tag_name}`))
  }

  return got(asset.browser_download_url, {json: true})
    .catch(err => {
      console.error(`Unable to fetch ${asset.browser_download_url}`)
      throw err
    })
    .then(response => {
      return Promise.resolve(response.body)
    })
}

function writeApiData (apis) {
  const filename = path.join(englishBasepath, 'api', 'electron-api.json')
  mkdir(path.dirname(filename))
  console.log(`Writing ${path.relative(englishBasepath, filename)} (without changes)`)
  fs.writeFileSync(filename, JSON.stringify(apis, null, 2))
  return Promise.resolve(apis)
}

function writeApiDescriptions (apis) {
  const tree = objectifyArray(apis)
  const descriptions = shakeTree(tree, 'description', {flat: true})
  const filename = path.join(englishBasepath, 'api', 'api-descriptions.yml')
  mkdir(path.dirname(filename))
  console.log(`Writing ${path.relative(englishBasepath, filename)}`)
  fs.writeFileSync(filename, YAML.safeDump(descriptions))

  return Promise.resolve()
}

function fetchWebsiteContent () {
  console.log(`Fetching locale.yml from electron/electron.atom.io gh-pages branch`)

  const url = 'https://cdn.rawgit.com/electron/electron.atom.io/gh-pages/_data/locale.yml'
  return got(url)
    .catch(err => {
      console.error(`Unable to fetch ${url}`)
      throw err
    })
    .then(response => {
      return Promise.resolve(response.body)
    })
}

function writeWebsiteContent (content) {
  const websiteFile = path.join(englishBasepath, 'website', `locale.yml`)
  mkdir(path.dirname(websiteFile))
  console.log(`Writing ${path.relative(englishBasepath, websiteFile)}`)
  fs.writeFileSync(websiteFile, content)
  return Promise.resolve()
}
