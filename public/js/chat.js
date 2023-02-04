const socket = io()
// elements

const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $messageLocationButton = document.querySelector('#share-location')
const $message = document.querySelector('#message')

// templates
const massegeTemplates = document.querySelector('#message-templates').innerHTML
const locationMessageTemplates = document.querySelector('#location-message-templates').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// Options

const {username , room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoscroll = () => {
    // New message element
    const $newMessage = $message.lastElementChild

    // Height of the message
    const $newMessageStyle = getComputedStyle($newMessage)
    const $newMessageMargin = parseInt($newMessageStyle.marginBottom)
    const $newMessageHeight = $newMessage.offsetHeight + $newMessageMargin

    // Visible height
    const visibleHeight = $message.offsetHeight

    // height of messages container
    const containerHeight = $message.scrollHeight

    // how far i scroll
    const scrollOffSet = $message.scrollTop + visibleHeight

    if(containerHeight - $newMessageHeight <= scrollOffSet){
        $message.scrollTop = $message.scrollHeight
    }
}
socket.on('message', (message) => {
    const html = Mustache.render(massegeTemplates, {
        username : message.username,
        message: message.text,
        createAt: moment(message.createAt).format('h:mm a')
    })
    $message.insertAdjacentHTML('beforebegin', html)
    autoscroll()
    console.log(message.text)
})

socket.on('locationMessage', (message) => {
    console.log(message)
    const html = Mustache.render(locationMessageTemplates, {
        username : message.username,
        url: message.url,
        createdAt: moment(message.createAt).format('h:mm a')
    })

    $message.insertAdjacentHTML('beforebegin', html)
    autoscroll()

})
socket.on('roomData',({room , users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })

    document.querySelector('#sidebar').innerHTML = html
})


$messageForm.addEventListener('submit', (e) => {

    $messageFormButton.setAttribute('disabled', 'disabled')

    e.preventDefault()

    // disable
    const message = e.target.elements.msg.value

    socket.emit('sendMesage', message, (error) => {

        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = " "
        $messageFormInput.focus()

        if (error) {
            return console.log(error)
        }
        console.log("The message is deliverd !")
    })

})

// elements

$messageLocationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocationn is no supported in this browser !')
    }

    $messageLocationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {


        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            $messageLocationButton.removeAttribute('disabled')
            console.log('Location Shared !')
        })

    })
})
socket.emit('join',{username, room },(error) => {
    if(error){
        alert(error)
        location.href = '/'
    }

})
// socket.on('countUpdateted', (count) => {
//     console.log('newww',count )
// })

// document.querySelector('#increment').addEventListener('click', () => {
//     console.log("clicked !")

//     socket.emit("increment")
// })

