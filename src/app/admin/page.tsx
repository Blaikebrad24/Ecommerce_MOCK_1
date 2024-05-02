import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import prismaDBConnection from "@/db/db";
import { formatCurrency, formatNumber } from "@/lib/formatters";


function wait(duration: number){
    return new Promise(resolve => setTimeout(resolve, duration));
}


// directly from database
async function getSalesData(){
    // serach docs for nextjs prisma client
    const data =  await prismaDBConnection.order.aggregate({
        _sum: { pricePaidInCents: true},
        _count: true 
    })
    await wait(200);
    return {
        amount: (data._sum.pricePaidInCents || 0) / 100 ,
        numberOfSales: data._count
    }
}

async function getUserData()
{
    const [userCount, orderData] = await Promise.all([
        prismaDBConnection.user.count(),
        prismaDBConnection.order.aggregate({_sum: {pricePaidInCents: true}})
    ])
   return {
    userCount,
    averageValuePerUser: userCount === 0 ? 0 : (orderData._sum.pricePaidInCents || 0) / userCount / 100
   }
}

async function getProductsData(){

    const [activeCount, inactiveCount] = await Promise.all([
        prismaDBConnection.product.count({ where: {isAvailableForPurchase: true}}),
        prismaDBConnection.product.count({ where: {isAvailableForPurchase: false}})
    ])

    return { activeCount, inactiveCount}; 
}



export default async function AdminDashboard(){

    // execute in parallel 
    // const salesData = await getSalesData();
    // const userData = await getUserData();

    const [salesData, userData, productData] = await Promise.all([
        getSalesData(),
        getUserData(),
        getProductsData(),
    ])

    return (
        <div className=" grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <DashboardCard 
                title="Sales" 
                subtitle={`${formatNumber(salesData.numberOfSales)} orders`} 
                body={formatCurrency(salesData.amount)}
            />
            <DashboardCard 
                title="Customers" 
                subtitle={`${formatCurrency(userData.averageValuePerUser)} Average Value `} 
                body={formatNumber(userData.userCount)}
            />
            <DashboardCard 
                title="Active Products" 
                subtitle={`${formatNumber(productData.inactiveCount)} Inactive `} 
                body={`${formatNumber(productData.activeCount)}`}
            />


        </div>
    )
}

type DashoardCardProps = {
    title: string,
    subtitle: string,
    body: string,
}

function DashboardCard({ title, subtitle, body}: DashoardCardProps)
{


    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>                
                <CardDescription>{subtitle}</CardDescription>
            </CardHeader>
            <CardContent>
                <p>{body}</p>
            </CardContent>
        </Card>
    )
}