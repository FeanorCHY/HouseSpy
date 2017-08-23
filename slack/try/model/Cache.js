'use strict'

const path = require("path")


class Cache{


    constructor(){
        this._user = new Map()
    }
    hasUser(userId){
        return userId in this._user
    }

    get(userId){
        return this._user[userId];
    }

    addUser(userId){
        this._user[userId] = {
            status:Cache.status.IDLE,
            data:{}
        }
    }

    addUserIfNotExists(userId){
        if(userId in this._user){
            return
        }

        this.addUser(userId)
    }

    load(persistent_file_path){
        this._user = require(path.resolve(persistent_file_path))
    }

    recordMessage(user, field, cb){
        return (err,message)=>{
            user.data[field] = message

            if(cb){
                cb(err,message);
            }
        }
    }
}

Cache.status =  {
    APT_FIND:"apt.search",
    IDLE:"idle"
}





let t = new Cache();
t.load(path.join(__dirname,"userStatus.json"))

module.exports = Cache