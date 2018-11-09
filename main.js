var wikiApiUrl = 'https://en.wikipedia.org/w/api.php?'
var searchResults = {
  totalHits: 0,
  totalPages: 0,
  currPage: 1,
  offSet: 0,
  offSetIncrement: 10,
  results: []
}

var handleWikiSearch = function() {
  var searchOpts = {
    action: 'query',
    list: 'search',
    utf8: true,
    format: 'json',
    srlimit: searchResults.offSetIncrement,
    sroffset: searchResults.offSet,
    srprop: 'size|wordcount|timestamp|snippet|sectiontitle|categorysnippet',
    srsearch: $('#searchForm input[type=search]').val()
  }

  var ajax = $.ajax({ type: 'GET', url: wikiApiUrl, data: searchOpts, contentType: 'application/json; charset=utf-8', dataType: 'jsonp' })
    .done(function(resp) {
      // handle successful call
      searchResults.totalHits = resp.query.searchinfo.totalhits
      searchResults.totalPages = Math.ceil(searchResults.totalHits / searchResults.offSetIncrement)
      searchResults.currPage = (searchResults.offSet / searchResults.offSetIncrement)
      searchResults.results = resp.query.search.map(function(data) {
        // add url back to Wikipedia to seach results
        data['wikiurl'] = 'https://en.wikipedia.org/?curid=' + data.pageid
        return data
      })
      updateSearchResults()
    })
    .fail(function() {
      // handle failed call
      searchResults.totalHits = 0
      searchResults.totalPages = 0
      searchResults.currPage = 1
      searchResults.offSet = 0
      searchResults.results = []
      updateSearchResults()
    })
}

var updateSearchResults = function() {
  var resultsEl = $('#results')
  var displayResults = searchResults.totalHits > 0

  if (displayResults) {
    if (searchResults.offSet === 0) resultsEl.empty() // clear results area

    var resultEls = searchResults.results.map(function(data) {
      // create article title element
      var titleEl = document.createElement('h3')
      var titleLink = document.createElement('a')
      var titleText = document.createTextNode(data.title)
      titleLink.href = data.wikiurl
      titleLink.appendChild(titleText)
      titleEl.appendChild(titleLink)
      // create timestamp element
      var lastUpdated = new Date(data.timestamp)
      var month = lastUpdated.getMonth() + 1
      var day = lastUpdated.getDate()
      var formattedDate = (month < 10 ? '0' + month : month) + '.' + (day < 10 ? '0' + day : day) + '.' + lastUpdated.getFullYear()
      var lastupdateEl = document.createElement('time')
      var lastupdateText = document.createTextNode('last updated: ' + formattedDate)
      lastupdateEl.datetime = data.timestamp
      lastupdateEl.appendChild(lastupdateText)
      // create snippet element
      var snippetEl = document.createElement('p')
      snippetEl.innerHTML = data.snippet + '...'
      // create word count element
      var formattedWordCount = data.wordcount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      var wordcountEl = document.createElement('aside')
      var wordcountText = document.createTextNode('word count: ' + formattedWordCount)
      wordcountEl.appendChild(wordcountText)
      // create the containing article element
      var itemEl = document.createElement('article')
      itemEl.id = 'wiki_' + data.pageid
      itemEl.appendChild(titleEl)
      itemEl.appendChild(lastupdateEl)
      itemEl.appendChild(snippetEl)
      itemEl.appendChild(wordcountEl)

      return itemEl
    })
    resultsEl.append(resultEls)
  } else {
    resultsEl.empty() // clear results area
    var errorMessageEl = document.createElement('p')
    var errorMessageText = document.createTextNode('There was a problem getting your search results online. May I suggest going to the library?')
    errorMessageEl.className = 'error'
    errorMessageEl.appendChild(errorMessageText)
    resultsEl.append(errorMessageEl)
  }
}

$(function() {
  $('#searchForm').submit(function(e) {
    e.preventDefault()
    handleWikiSearch()
  })

  $(window).scroll(function() {
    if($(window).scrollTop() + $(window).height() === $(document).height()) {
        searchResults.offSet += searchResults.offSetIncrement
        handleWikiSearch()
    }
  })
})