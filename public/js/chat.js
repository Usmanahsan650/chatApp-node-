//const e = require("express");

const socket=io();
const $form=document.querySelector("#message-form");
const $input=$form.elements.message;
const $messages=document.querySelector("#messages");
const $sidebar=document.getElementById('sidebar');
var {username,room}=Qs.parse(location.search,{ignoreQueryPrefix:true});
username=username.trim().toLowerCase();
console.log(username,room)
//template
const userslists=document.getElementById("userlist").innerHTML;
const  messagetemp=document.getElementById('messages-temp').innerHTML;
//console.log(messagetemp)
const template=Handlebars.compile(messagetemp);

//autoscroll
function autoscroll(){
    const $newmessage=$messages.lastElementChild;
    //height of new message;
    const messageStyle=getComputedStyle($newmessage);
    const messageMargin=parseInt(messageStyle.marginBottom);
    const messageheight=$newmessage.offsetHeight+messageMargin;

    //visible height
    const visibleHeight=$messages.offsetHeight;
    //container height
    const  containerHeight=$messages.scrollHeight;

    //how far have i scrolled?
    const scrolled=$messages.scrollTop+visibleHeight;
    if(containerHeight-messageheight<=scrolled)
    $messages.scrollTop=$messages.scrollHeight;
}

$form.addEventListener('submit',(event)=>{
    $form.querySelector('button').setAttribute("disabled","disabled");
    event.preventDefault();
    const message=event.target.elements.message.value;
    socket.emit('sendMessage',message,()=>{
        $input.value="";
        $input.focus();
        $form.querySelector('button').removeAttribute("disabled");
        console.log('message delivered');
    })
})
socket.on("joined",(message)=>{
    console.log(message)
    const html=template({from:message.from,message:message.text
        ,createdAt:moment(message.createdAt).format('h:mm a')});
    $messages.insertAdjacentHTML("beforeend",html)
})
socket.on('left',(message)=>{
    const html=template({from:message.from,message:message.text
    ,createdAt:moment(message.createdAt).format('h:mm a')

    });
    $messages.insertAdjacentHTML('beforeend',html);
})
socket.on("recieveIt",(message)=>{
    console.log(message);
    var html;
    if(message.from!==username){
    html=template({from:message.from,message:message.text
        ,createdAt:moment(message.createdAt).format('h:mm a')})
    }else{
        html=template({message:message.text
            ,createdAt:moment(message.createdAt).format('h:mm a')})
    }
    $messages.insertAdjacentHTML('beforeend',html);
    autoscroll()
        
})
const $sendLocation=document.getElementById("sendloc");
$sendLocation.addEventListener('click',()=>{
  $sendLocation.setAttribute('disabled','disabled');
    navigator.geolocation.getCurrentPosition((position)=>{
        console.log(position);
        socket.emit('sendLocation',{latitude:position.coords.longitude,longitude:position.coords.latitude},()=>{
            $sendLocation.removeAttribute('disabled')
            console.log("Location Shared");
        })
    })
})
socket.on('getLocation',message=>{
    
    console.log(message)
    var html
    if(message.from!=username){
    html=template({from:message.from,location:message.text
        ,createdAt:moment(message.createdAt).format('h:mm a')})
    }else{
        html=template({location:message.text
            ,createdAt:moment(message.createdAt).format('h:mm a')})
    }
    $messages.insertAdjacentHTML('beforeend',html);
    autoscroll()
})
socket.emit('join',{username,room},(error)=>{
    if(error){
        alert("Error",error);
        location.href="/"
    }
});

socket.on('getUsers',({room,users})=>{
    console.log(users)
 const html=ejs.render(userslists,{users,room,username});
 $sidebar.innerHTML=html;

})



Handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
    return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});