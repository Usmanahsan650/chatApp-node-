const users=[];
const addUser=({id,username,room})=>{
    username=username.trim().toLowerCase();
    room=room.trim().toLowerCase();

    if(!username || !room){
        return {Error:"Username and room are required! "}
    }
    //check existing user
    const existing=users.find((user)=>{
        return user.room==room&&user.username==username;
    })

    if(existing){
        return { Error:"Username already taken!"}
    }
    else{
        const user={id,username,room}
        users.push(user);
        //console.log(user)
        return {user};
    }
    
}
const removeUser=(id)=>{
    const index=users.findIndex((user)=>user.id==id);
    if(index!=-1){
       return users.splice(index,1)[0]
    }

}
function getUsersInRoom(room){
    room=room.trim().toLowerCase();
    return users.filter((user)=>user.room===room)
}
function getUser(id){
    return users.find((user)=>user.id==id);
}
module.exports={
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}