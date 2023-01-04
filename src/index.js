const { ApolloServer, PubSub } = require('apollo-server');
const { PrismaClient } = require("@prisma/client")
const fs = require("fs");
const path = require("path");
const { getUserId } = require('./utils')

const Query = require("./resolvers/Query")
const Mutation = require("./resolvers/Mutation")
const User = require("./resolvers/User")
const Link = require("./resolvers/Link")
const Subscription = require("./resolvers/Subscription")

let prisma = new PrismaClient();

//graphql subscriptions
const pubsub = new PubSub();

const resolvers = {
    Query,
    Mutation,
    Subscription,
    User,
    Link,
    /* we could add the resolver functions for the Link type as follows
        id: (parent) => parent.id,
        description: (parent) => parent.description,
        url: (parent) => parent.url

      but we've omitted it because it's trivial(less important)
    */
    
}

/* We're reading typeDefs from an imported graphql file */
/* Alternatively, we could specify the typeDef as string within this file */
/* And just reference it in the object below */

const server = new ApolloServer({
    typeDefs: fs.readFileSync(
        path.join(__dirname, 'schema.graphql'),
        'utf-8'
    ),
    resolvers,
    //to access a request object on the context, we attach a request object to the context
    //advantage of this approach is that we can attach HTTP request that carries the incoming GraphQL query or
    //mutation to the context as well. This will allow resolvers to read Authorization header and validare
    //if the user who submitted the request is eligible to perform the requested operation
    context: ({ req }) => {
        return{
            ...req,
            prisma,
            pubsub,
            userId:
                req && req.headers.authorization ? getUserId(req) : null
        }
    }
        
})

server
    .listen()
    .then(({ url }) => 
        console.log(`Server is running ${url}`)
    );