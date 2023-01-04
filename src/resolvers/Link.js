function postedBy(parent, args, context) {
    //adding a links resolver because we need a way for the reolver to read relations
    return context.prisma.link.findUnique({ where: { id: parent.id }}).postedBy()
}

module.exports = {
    postedBy
}