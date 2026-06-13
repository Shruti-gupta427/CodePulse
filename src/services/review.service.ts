import { prisma } from '../config/prisma'
async function createReview (userId: string, code: string, language: string){

    const Review = await prisma.review.create({
           data:{
             userId,
             code,
             language,
             status: 'PENDING'
           }
    })
    
return Review  
}
async function getReviews (userId: string){
    const reviews = await prisma.review.findMany({where: {userId},orderBy: { createdAt: 'desc' }});
    return reviews;
}
async function getReviewwithIssues (id : string,userId: string){
    const OneReview=await prisma.review.findFirst({
  where: { id, userId },
  include: { issues: true }
})
return OneReview
}
export { createReview, getReviews, getReviewwithIssues }