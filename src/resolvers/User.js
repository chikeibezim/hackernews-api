function links(parent, args, context){
    //adding a links resolver because we need a way for the reolver to read relations
    return context.prisma.user.findUnique({ where: { id: parent.id }}).links()
}

module.exports = {
    links
}