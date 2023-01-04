function newLinkSubscribe(parent, args, context, info){
    return context.pubsub.asyncItertor("NEW_LINK")
}

const newLink = {
    subscribe: newLinkSubscribe,
    resolve: payload => {
        return payload
    }
}

module.exports = {
    newLink
}