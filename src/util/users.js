const users = []

// addUser , removeUser , getuser , getUserInRoom

const addUser = ({ id, username, room }) => {
    // Clean data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    // Validate data
    if (!username || !room) {
        return {
            error: 'Username and Room is required !'
        }
    }

    //Check exsisting user

    const exsistingUser = users.find((user) => {
        return user.username === username && user.room === room
    })

    // validate user
    if (exsistingUser) {
        return {
            error: 'Username is used !'
        }
    }

    //store user
    const user = { id, username, room }
    users.push(user)
    return { user }
}

const removeUser = (id) => {

    const index = users.findIndex((user) => user.id === id)

    if (index !== -1) {
        return users.splice(index, 1)[0]
    }

}

const getUser = (id) => {
    return users.find((user) => user.id === id)
}

const getUserInRoom = (room) => {
    return users.filter((user) => user.room === room)
}
module.exports = {
    addUser,
    removeUser,
    getUser,
    getUserInRoom
}

