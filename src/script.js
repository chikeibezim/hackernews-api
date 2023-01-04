//import the prismaClient constructor
const { PrismaClient } = require("@prisma/client");

//instantiate the PrismaClient
const prisma = new PrismaClient();

//define main function to send queries to the database
//all queries will be written inside this function

async function main(){
    // const newLink = await prisma.link.create({
    //     data: {
    //         description: "Fullstack tutorial for GraphQL 2",
    //         url: "www.next2you.com"
    //     }
    // })
    const allLinks = await prisma.link.findMany();
    console.log(allLinks)
}


//call the main function
main()
    .catch(e => {
        throw e
    })
    //close database connections when the script temrinates
    .finally(async () => {
        await prisma.$disconnect()
    })