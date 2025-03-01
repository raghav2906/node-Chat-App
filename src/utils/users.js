const users = []

//addUser, removeUser, getUser, getUserInRoom
const addUser = ({id, username, room}) => {
    //Clean the data
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    //Validate!
    if(!username || !room){
        return {
            error:'Valid Username and Room required'
        }
    }

    //check for existing user
    const existingUser = users.find((user)=>{
        return user.room === room && user.username === username
    })

    //Validate username
    if(existingUser){
        return {
            error:'Username is in Use!'
        }
    }

    //storing users
    const user = {id,username,room}
    users.push(user)
    return {user}

}

const getUser = (id) => {
    const user = users.find((user) => {
        return user.id === id
    })

    return user
}

const getUserInRoom = (room) => {
    room = room.trim().toLowerCase()
    const userInRoom = users.filter((user) => {
        return user.room === room
    })

    return userInRoom
}

const removeUser = (id) => {
    const index = users.findIndex((user) => {
        return user.id === id
    })

    if(index !==-1){
        return users.splice(index, 1)[0]
    }
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUserInRoom
}
