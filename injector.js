(function () {
  $.get(chrome.extension.getURL('/script.js'), function (code) {
    var script = document.createElement('script')
    script.setAttribute('type', 'text/javascript')
    script.setAttribute('id', 'PlaylistrScript')
    script.setAttribute('defer', 'defer')
    script.innerHTML = code
    document.body.appendChild(script)
  })

  window.addEventListener('message', function (event) {
    if (event.source !== window) {
      return
    }

    if (event.data.type && (event.data.type === 'REQUEST_HASH')) {
      // check if we already got hash in storage
      chrome.storage.sync.get(['saveplaylisthash'], function (item) {
        var hash = item.saveplaylisthash
        if (typeof hash !== 'undefined') {
          var data = { type: 'SEND_HASH', payload: hash }
          window.postMessage(data, '*')
        }
        if (typeof hash === 'undefined') {
          let url = `https://vk.com/audios${event.data.payload}`
          if (window.location.href !== url) {
            let hashWindow = window.open(url)
          }
        }
      })
    }

    if (event.data.type && (event.data.type === 'SAVE_HASH')) {
      chrome.storage.sync.set({ 'saveplaylisthash': event.data.payload }, function () {
        console.log('Settings saved')
      })
    }
  })
})()
