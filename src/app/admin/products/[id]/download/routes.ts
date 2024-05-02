import prismaDBConnection from "@/db/db";
import { notFound } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";

export async function GET(request: NextRequest, { params: { id }}: { params: { id: string}})
{
    const product2Dwnload = await prismaDBConnection.product.findUnique({ where: {id}, select: {filePath: true, name: true},})
    if(product2Dwnload == null){return notFound();}
    const { size } = await fs.stat(product2Dwnload.filePath);
    const file = await fs.readFile(product2Dwnload.filePath);
    const extension = product2Dwnload.filePath.split(".").pop();

    return new NextResponse(file, { headers: {
        "Content-Disposition": `attachment; filename="${product2Dwnload.name}.${extension}"`,
        "Content-Length": size.toString(),
    },})

}