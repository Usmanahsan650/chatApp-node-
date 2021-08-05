function generateMessage(text,from){
    return {
        from:from,
        text,
        createdAt: new Date().getTime()
    }
}
module.exports={
    generateMessage
}