import prismaDBConnection from "@/db/db"
import { notFound } from "next/navigation"
import Stripe from "stripe";
import { CheckoutForm } from "./_components/CheckoutForm";

const stripePromise = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function generateStaticParams(){

    const productIds = await prismaDBConnection.product.findMany();
    return productIds.map((product) =>({
        id: product.id,
    }))
}

export default async function PurchasePage( { params: { id }} : { params: { id : string}})
{
    const product = await prismaDBConnection.product.findUnique({ where : { id }})
    if (product == null) return notFound()

        //metadata helps user with info on what is being purchased
    const paymentIntent = await stripePromise.paymentIntents.create({
        amount: product.priceInCents,
        currency: "USD",
        metadata: { productId: product.id}
    })

    if(paymentIntent.client_secret == null)
        {
            throw Error("Stripe failed to make the payment intent")
        }

    return ( <CheckoutForm product={product} clientSecret={paymentIntent.client_secret}/>

    )
}