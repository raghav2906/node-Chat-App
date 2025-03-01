const socket = io()

//server (emit) -> client (recieve) --acknowlegdement --> server

//client (emit) -> server (recieve) --acknowledgement --> client

// Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input') 
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')


//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML 
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML
const messageOwnTemplate = document.querySelector('#message-own-template').innerHTML
const locationMessageOwnTemplate = document.querySelector('#location-message-own-template').innerHTML


//Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })


const autoScroll = () => {
    //New message element
    const $newMessage = $messages.lastElementChild

    //Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //visible height
    const visibleHeight = $messages.offsetHeight

    // height of messages contianer
    const contianerHeight = $messages.scrollHeight

    //How far have i scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if(contianerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight
    }
}


socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate,{
        username:message.username,
        message: message.text,
        createdAt:moment(message.createdAt).format('h:mm a')
        
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

socket.on('messageOwn',(message) => {
    console.log(message)
    const html = Mustache.render(messageOwnTemplate,{
        username:message.username,
        message: message.text,
        createdAt:moment(message.createdAt).format('h:mm a')
        
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

socket.on('locationMessage',(message) => {
    console.log(message)
    const html = Mustache.render(locationMessageTemplate,{
        username:message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
        
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

socket.on('locationMessageOwn',(message) => {
    console.log(message)
    const html = Mustache.render(locationMessageOwnTemplate,{
        username:message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
        
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

socket.on('roomData', ({room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

$messageForm.addEventListener('submit', (e)=>{
    e.preventDefault()

    $messageFormButton.setAttribute('disabled','disabled')

    //disable
    const message = e.target.elements.message.value

    socket.emit('sendMessage',message, (error) => {
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value=""
        $messageFormInput.focus()
        //enable
        if(error){
            return console.log(error)
        }
        console.log('Message Delievered! ')
    })
})


$sendLocationButton.addEventListener('click', () => {
    

    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser.')
    }

    $sendLocationButton.setAttribute('disabled', 'disabled')
    
    navigator.geolocation.getCurrentPosition((position)=>{
        console.log(position.coords)
        socket.emit('sendLocation',{
            latitude:position.coords.latitude,
            longitude:position.coords.longitude
        },() => {
            $sendLocationButton.removeAttribute('disabled')
            console.log('Location shared')
        })
        
    })
    
})

socket.emit('join',{ username, room },(error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})

// socket.on('countUpdated', (count) => {
//     console.log('The count has updated!',count)

// })

// document.querySelector('#increment').addEventListener('click', () => {
//     console.log('clicked')
//     socket.emit('increment')
// })