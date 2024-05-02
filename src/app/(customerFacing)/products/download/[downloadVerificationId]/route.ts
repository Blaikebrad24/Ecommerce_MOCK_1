import prismaDBConnection from "@/db/db";
import { NextResponse, NextRequest } from "next/server";
import fs from "fs/promises";

export async function GET(request: NextRequest, { params: { downloadVerificationId },}:{ params : {downloadVerificationId : string}} )
{
    // only get the download verification where the expires is greater than current time
    // only need the name and filePath for download
    const data = await prismaDBConnection.downloadVerification.findUnique({
        where: { id: downloadVerificationId, expiresAt: {gt: new Date()}},
        select: { product: { select: { filePath: true, name: true}}}
    })
    if(data == null)
        {
            return NextResponse.redirect(new URL("/products/download/expired", request.url))

        }

        const { size } = await fs.stat(data.product.filePath);
        const file = await fs.readFile(data.product.filePath);
        const extension = data.product.filePath.split(".").pop();

        return new NextResponse(file, {
            headers:{
                "Content-Disposition": `attachment; filename="${data.product.name}.${extension}"`,
                "Content-Length": size.toString(),
            },
        })
    }

    