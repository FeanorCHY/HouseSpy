class AttachmentBuilder {
    constructor(){
        this._result = {}
        // return this;
    }

    title(title, title_link){
        this._result.title = title
        if(title_link){
            this._result.title_link = title_link
        }
        return this
    }

    text(text){
        this._result.text = text
        return this
    }

    image(img_url){
        this._result.image_url = img_url
        return this
    }

    create(){
        return this._result
    }

}

//
// button(name,options={}){
//     this._result =  {
//         name:name,
//         value:options.value || name,
//         text: options.text || name,
//         type:"button",
//         style: options.style || ""
//     }
//     return this;
// }
//
// Button (...args){
//     this.button(...args)
//     return this._result;
// }

// get Own propertyNames
Object.getOwnPropertyNames(AttachmentBuilder.prototype)

console.log(this);

module.exports = ()=>{
    return new AttachmentBuilder();
}

