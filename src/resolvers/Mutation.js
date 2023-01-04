const bycrpt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { APP_SECRET, getUserId } = require('../utils');
const { newLink } = require('./Subscription');

async function signup(parent, args, context, info){
    //encrypt password using bycryptjs lib
    const password = await bycrpt.hash(args.password, 10);

    //use primaclient instance through context to store the record in databse
    const user = await context.prisma.user.create({
        data: {
            ...args,
            password
        }
    })

    //generate the json web token signed by secret for authentication
    const token = jwt.sign({ userId: user.id }, APP_SECRET);

    //return the token and the user in an object that adheres to the shape of the 
    //AuthPayLoad object from the graphql schema
    return {
        token,
        user
    }

}

async function login(parent, args, context, info){
    //using prismaclient instance, retrieve an existing user record by email
    const user = await context.prisma.user.findUnique({ where: { email: args.email }});
    if(!user){
        throw new Error('No such user found')
    }

    //using bycrypt library, validate the password
    const valid = await bycrpt.compare(args.password, user.password);
    if(!valid){
        throw new Error('Invalid password')
    }

    //generate user token for authentication
    const token = jwt.sign({ userId: user.id }, APP_SECRET);

    //return the auth payload
    return {
        token,
        user
    }
}

const post = async (parent, args, context, info) => {
    const { userId } = context;

    const newLink = await context.prisma.link.create({
        data: {
            url: args.url,
            description: args.description,
            postedBy: { connect: { id: userId }}
        }
    });

    context.pubsub.publish("NEW_LINK", newLink);

    return newLink;
}

const vote = async (parent, args, context, info) => {
    const { userId } = context;

    const vote = await context.prisma.vote.findUnique({
        where: {
            linkId_userId: {
                linkId: Number(args.linkId),
                userId: userId
            }
        }
    });

    if(Boolean(vote)){
        throw new Error(`Already voted for the link: ${args.linkId}`)
    }

    const newVote = context.prisma.vote.create({
        data: {
            user: { connect: { id: userId }},
            link: { connect: { id: Number(args.linkId)}}
        }
    });

    context.pubsub.publish("NEW_VOTE", newVote);

    return newVote;
}

module.exports = {
    signup,
    login,
    post,
    vote
}