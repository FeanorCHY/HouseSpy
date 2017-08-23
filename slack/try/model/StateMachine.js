'use strict'

class StateMachine {
    constructor(config){
        this._states = config.states
        this._context = config.context || {}
        Object.assign(this._context, {
            to:this.to.bind(this),
            setContext: this.setContext.bind(this),
            process:this.process.bind(this)

        })
        this._currentState = this._states.default

    }

    start(){
        this._currentState.enter && this._currentState.enter.call(this._context)
    }

    process(){
        let nextStateName = this._currentState.do.apply(this._context)
        this.to(nextStateName)
    }

    to(stateName){
        if(stateName && stateName in this._states){
            this._currentState.exit && this._currentState.exit.call(this._context)
            this._currentState = this._states[stateName]
            this._currentState.enter && this._currentState.enter.call(this._context)
        }
    }

    setContext(context){
        Object.assign(this._context,context)
    }
}


//
//
// let t = new StateMachine(
//     {
//         states:{
//             "apt.search":{
//                 do:function(){
//                     console.log("searching.." + this.message);
//                 },
//                 enter:function(){
//                     console.log("enter");
//                 },
//                 exit:function(){
//
//                 }
//             },
//             "default":{
//                 do:function(){
//                     this.to("apt.search")
//                     this.setContext({
//                         message:"test"
//                     })
//                     this.process()
//
//                 }
//             }
//
//         },
//         context:{
//
//         }
//     }
// )
//
// // t.setContext()
// t.start()
// t.process()
//
// // t.setContext()
// //t.to("apt.search")
// //t.process()

module.exports = StateMachine