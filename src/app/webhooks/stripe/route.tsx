


import prismaDBConnection from "@/db/db";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { Resend } from "resend";

// verify that everything being sent is from Stripe and not another Host
const stripePromise = new Stripe(process.env.STRIPE_SECRET_KEY as string);

const resend = new Resend(process.env.RESEND_API_KEY as string);

export async function POST(request: NextRequest) {
     // stripe instance constructs event -->
     // parse the request text , check if the stripe signature of the request matches our Stripe hook secret
    const event = stripePromise.webhooks.constructEvent(await request.text(), 
        request.headers.get("stripe-signature") as string, 
        process.env.STRIPE_WEBHOOK_SECRET as string)

        // if payment succeeded 
    if( event.type === "charge.succeeded")
        {
            const charge = event.data.object;
            const productId = charge.metadata.productId;
            const email = charge.billing_details.email;
            const pricePaidInCents = charge.amount;
            
            // make sure product exists
            const product = await prismaDBConnection.product.findUnique({ where: { id : productId} })
            if(product == null || email == null)
                {
                    return new NextResponse("Bad Request", { status: 400})
                }
                //create a user or update a user 
                // need to give instructions to prisma on creation of user and or update user
                // creates new email and order with this productId and price paid 

                const userFields = {
                    email,
                    orders: { create: { productId, pricePaidInCents}},
                } 
                
                const { orders: [order], } = await prismaDBConnection.user.upsert({ 
                    where: { email },
                    create: userFields, 
                    update: userFields,
                    select : { orders: { orderBy: { createdAt: "desc"}, take: 1}},
                
                }) 

                // send download verification link 
                const downloadVerification = await prismaDBConnection.downloadVerification.create({
                    data: { 
                        productId, 
                        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
                    },
                })

                // resend email 
                await resend.emails.send({
                    from: `onboarding@resend.dev`,
                    to: [email],
                    subject: "Order Confirmation",
                    html: '<p>Congrats on sending your <strong>Second Email</strong>!</p>'
                })
        }
    return new NextResponse(); // it will return NextResponse if everything works
}

// called by stripe when successful payment
// that is when we create an order and a customer
// Only invoked from our Stripe Server for security
// Stripe performs the webhook then we respond