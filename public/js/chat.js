const socket = io()

//Elements - 
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//Templates - 
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//Options - 
const {username,room} = Qs.parse(location.search, { ignoreQueryPrefix:true})

const autoscroll = () =>{
    //new message element 
    const $newMessage = $message.lastElementChild

    //height of new message - 
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //we grab the new message(line 20)... then we get the margin value(line 23 & 24)...then we take the margin and add it to the height of the message, getting its total height 
    
    //Visible Hright - 
    const visibleHeight = $messages.offsetHeight

    // Height of message container - 
    const containerHeight = $messages.scrollHeight

    //How far have i scrolled ? -
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <=scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight

    }
}   
socket.on ('message' , (message) => {

    console.log(message)
    const html = Mustache.render(messageTemplate, {
        username:message.username,
        message:message.text,
        createdAt:moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend' , html)
    autoscroll()
})

socket.on('locationMessage' , (message) =>{
    console.log(message)
    const html = Mustache.render(locationMessageTemplate, {
        username:message.username,
        url:message.url,
        createdAt:moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomData',({room, users}) =>{
    const html = Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})
// refer line 41 - 
document.querySelector('#message-form').addEventListener('submit',(e) =>{
    e.preventDefault()

    $messageFormButton.setAttribute('disabled', 'disabled')

    const message = document.querySelector('input').value

    socket.emit('sendMessage', message, error => {

        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = '';
        $messageFormInput.focus()

        if(error){
            return console.log(error)
        }

        console.log('Message Delivered ! ')
    })
})
document.querySelector('#send-location').addEventListener('click',() =>{
    
    if(!navigator.geolocation)
    {
        return alert('Geolocation is not supported by your browser')
    }

    $sendLocationButton.setAttribute('disabled' , 'disabled')

    navigator.geolocation.getCurrentPosition((position)=>{
        socket.emit('sendLocation',{
            latitude:position.coords.latitude,
            longitude:position.coords.longitude
        }, () =>{
            $sendLocationButton.removeAttribute('disabled  ')
            console.log('Location Shared')
        })
    })
})

socket.emit('join' , {username , room} , (error) =>{
    if(error){
        alert(error)
        location.href = '/'
    }
})






