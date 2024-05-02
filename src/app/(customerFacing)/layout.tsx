import { Nav, NavLink} from "@/components/Nav"

export const dynamic = "force-dynamic" // force nextjs to not cache any of our pages , want up to date recent stuff

export default function CustomerLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>){
    return (
    <>
        <Nav>
            <NavLink href="/">Home</NavLink>
            <NavLink href="/products">Products</NavLink>
            <NavLink href="/orders">Orders</NavLink>
        </Nav>
        <div className="container my-6">{children}</div>
    </>
    )
}


/*

"use client";
import Image from "next/image";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { formatCurrency } from "@/lib/formatters";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormEvent, useState } from "react";


const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY as string);
type CheckoutFormProps = {
    product: {
        imagePath: string
        name: string 
        priceInCents: number
        description: string 
    }
    clientSecret: string
}
export function CheckoutForm( { product, clientSecret }: CheckoutFormProps)
{


    return ( 
    <div className="max-w-5xl w-full mx-auto space-y-8">
        <div className="flex gap-4 items-center">
                <div className="aspect-video flex-shrink-0 w-1/3 relative">
                    <Image src={product.imagePath} fill alt={product.name} className="object-cover"/>
                </div>
                <div>
                    <div className="text-lg">
                        {formatCurrency(product.priceInCents / 100)}
                    </div>
                    <h1 className="text-2xl font-bold">{product.name}</h1>
                    <div className="line-clamp-3 text-muted-foreground">{product.description}</div>
                </div>
        </div>
        <Elements options={{ clientSecret }} stripe={stripePromise}>
                    <Form priceInCents={product.priceInCents}/>
        </Elements>
    </div>

    )
}

function Form({ priceInCents } : { priceInCents : number})
{
    const stripe = useStripe()
    const elements = useElements()
    const [isLoading, setIsLoading ] = useState(false);
    function handleSubmit(e : FormEvent)
    {
        e.preventDefault() // prevent the default behavior css etc

        if(stripe == null || elements == null)return
        setIsLoading(true)
    }

    return (<form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>Checkout</CardTitle>
                        <CardDescription className="text-destructive">Error</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <PaymentElement />
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" size="lg" disabled={stripe == null || elements == null || isLoading}>
                            {isLoading ? "Purchasing" : `Purchase - ${formatCurrency(priceInCents / 100)}`}
                        </Button>
                    </CardFooter>
                </Card>
        
        </form>)
}
*/

/*
import prismaDBConnection from "@/db/db"
import { notFound } from "next/navigation"
import Stripe from "stripe";
import { CheckoutForm } from "./purchase/_components/CheckoutForm";

const stripePromise = new Stripe(process.env.STRIPE_SECRET_KEY as string);

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


*/