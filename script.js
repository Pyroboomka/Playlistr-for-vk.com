
(() => {
  var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver

  var _SAVEPLAYLISTHASH_ = ''

/*
  TBD: warn user that he doesn't own any playlists,
  so vk hasn't generated his savePlaylistHash yet => extension will silently fail.
*/

  function generateButtons (collection) {
    if (collection.nodeType === 1 || collection.nodeType === 9) {
      const anchor = collection.querySelectorAll('.wall_audio_rows')
      for (var i = 0; i < anchor.length; i++) {
        let item = anchor[i]
        if (item.childElementCount > 1 && item.querySelectorAll('.addPlaylist').length === 0) {
          const PlaylistButton = document.createElement('div')
          PlaylistButton.className = 'addPlaylist'
          PlaylistButton.innerHTML = '<div class="audio_row_inner clear_fix"><button class="flat_button" style="float:right">Плейлист</button></div>'
          PlaylistButton.addEventListener('click', function () {
            choosePost(item)
          })
          item.appendChild(PlaylistButton)
        }
      }
    }
  }

  function choosePost (item) {
    var box = new MessageBox({dark: 1})
    box.setOptions({title: 'Создать плейлист', hideButtons: true})
    let modalContent = createModalContent(item, box)
    box.content('<div id="messagebox"></div>')
    box.show()
    document.getElementById('messagebox').appendChild(modalContent)
  }

  function createModalContent (item, box) {
    let playlistUserInfo = document.createElement('div')
    playlistUserInfo.id = 'playlistpopup'

    let nameInput = document.createElement('input')
    nameInput.type = 'text'
    nameInput.id = 'playlistName'
    nameInput.className = 'dark ape_pl_input'
    nameInput.setAttribute('placeholder', 'Название плейлиста')
    nameInput.setAttribute('style', 'display: block; width: 100%; margin-bottom: 5px;')

    let descrInput = document.createElement('input')
    descrInput.type = 'text'
    descrInput.id = 'description'
    descrInput.className = 'dark ape_pl_input'
    descrInput.setAttribute('placeholder', 'Описание')
    descrInput.setAttribute('style', 'display: block; width: 100%; margin-bottom: 5px;')

    let submitButton = document.createElement('button')
    submitButton.className = 'flat_button button_big_width'
    submitButton.setAttribute('style', 'margin-left: 273px')
    submitButton.innerHTML = 'Сохранить'
    submitButton.addEventListener('click', function () {
      grabInfoFromInputsAndContinue(item, box)
    })

    playlistUserInfo.appendChild(nameInput)
    playlistUserInfo.appendChild(descrInput)
    playlistUserInfo.appendChild(submitButton)
    return playlistUserInfo
  }

  function grabInfoFromInputsAndContinue (item, box) {
    let playlistName = document.getElementById('playlistName').value
    let description = document.getElementById('description').value
    // cur.audioPage._data.createPlaylistHash
    let savePlaylistHash = _SAVEPLAYLISTHASH_
    // cur.audioPage._data.createPlaylistHash
    let vkid = window.vk.id
    let tracks = item.querySelectorAll('.audio_row')
    let tracksIDs = []
    for (var i = 0; i < tracks.length; i++) {
      tracksIDs.push(tracks[i].getAttribute('data-full-id'))
    }
    let tracksIDsString = tracksIDs.join(',')
    let reqBody = `act=save_playlist&al=1&Audios=${tracksIDsString}&cover=0&description=${encodeURI(description)}&hash=${savePlaylistHash}&owner_id=${vkid}&playlist_id=0&title=${encodeURI(playlistName)}`
    const xhr = new XMLHttpRequest()
    xhr.open('POST', 'https://vk.com/al_audio.php', true)
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest')
    xhr.onreadystatechange = function (e) {
      if (xhr.readyState !== 4) return
      if (xhr.status !== 200) {
        console.log('failed to push playlist', xhr.responseText)
      } else {
        box.hide()
      }
    }
    xhr.send(reqBody)
  }

  var observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      if (mutation.type === 'childList') {
        for (let i = 0; i < mutation.addedNodes.length; i++) {
          generateButtons(mutation.addedNodes[i])
        }
      }
    })
  })

  observer.observe(document.body, {
    childList: true,
    subtree: true
  })
/*  Quality hacks
  If the current window contains createPlaylist hash, attemt to grab it
  and save it to chrome storage via injector.js
*/

  if (window.location.href === `https://vk.com/audios${window.vk.id}`) {
    _SAVEPLAYLISTHASH_ = window.cur.audioPage._data.createPlaylistHash
    var data = { type: 'SAVE_HASH', payload: _SAVEPLAYLISTHASH_ }
    window.postMessage(data, '*')
  }

/*
  If there's no hash in current window, ask injector.js to access storage.
  If it's empty, it will redirect to /audios{vk.id}, where hash is present
*/

  if (_SAVEPLAYLISTHASH_ === '') {
    var data = { type: 'REQUEST_HASH', payload: window.vk.id }
    window.postMessage(data, '*')
  }

/*
  Set up an even listener for getting playlist hash from storage.
*/
  window.addEventListener('message', function (event) {
    if (event.source !== window) {
      return
    }

    if (event.data.type && (event.data.type === 'SEND_HASH')) {
      _SAVEPLAYLISTHASH_ = event.data.payload
    }
  })

// Quality hacks end

  generateButtons(document)

})()
