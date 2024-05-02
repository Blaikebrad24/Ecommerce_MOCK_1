"use server"

import prismaDBConnection from "@/db/db";
import { z } from "zod";
import fs from "fs/promises"
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";


const fileSchema = z.instanceof(File, { message: "Required" })
const imageSchema = fileSchema.refine(
  file => file.size === 0 || file.type.startsWith("image/") // if file sz is 0, then no file was submit(ignore&continue) or ...
)
const addSchema = z.object({
    name: z.string().min(1),
    description: z.string().min(1),
    priceInCents: z.coerce.number().int().min(1),
    file: fileSchema.refine(file => file.size > 0, "Required"),
    image: imageSchema.refine(file => file.size > 0, "Required"),
})

const editSchema = addSchema.extend({

    file: fileSchema.optional(),
    image: imageSchema.optional()
})

// need to make sure the action has 2 different states
export async function addProduct(prevState : unknown,formData : FormData){
    const result = addSchema.safeParse(Object.fromEntries(formData.entries())) // true = data , false = none

    if(result.success === false){
        return result.error.formErrors.fieldErrors ;// return all errors
    }
    const data = result.data;

    await fs.mkdir("products", { recursive: true }) ;// creates them recursively if theres multiple 
    const filePath = `products/${crypto.randomUUID()}-${data.file.name}`;
    await fs.writeFile(filePath, Buffer.from(await data.file.arrayBuffer())) // convert file into buffer, so node can process as file

    await fs.mkdir("public/products", { recursive: true }) ;// creates them recursively if theres multiple 
    const imagePath = `/products/${crypto.randomUUID()}-${data.image.name}`;
    await fs.writeFile(`public${imagePath}`, Buffer.from(await data.image.arrayBuffer())) // convert file into buffer, so node can process as file

    // need to save the file in filesystem before saving to/in db 
    await prismaDBConnection.product.create({
        data:{
            isAvailableForPurchase: false,
            name: data.name,
            description: data.description,
            priceInCents: data.priceInCents,
            filePath,
            imagePath,
        }
    })

revalidatePath("/")
revalidatePath("/products")
redirect("/admin/products")
}

export async function toggleProductAvailability( id: string ,isAvailableForPurchase : boolean)
{
    await prismaDBConnection.product.update({ where: { id }, data: { isAvailableForPurchase} })
    revalidatePath("/")
    revalidatePath("/products")
}

export async function deleteProduct(id: string)
{
    const deletedProduct = await prismaDBConnection.product.delete({ where : { id }})
    if(deletedProduct == null ) return notFound();

    // unlink files 
    await fs.unlink(deletedProduct.filePath);
    await fs.unlink(`public${deletedProduct.imagePath}`);

    revalidatePath("/")
    revalidatePath("/products")
}

export async function updateProduct(id: string, prevState : unknown,formData : FormData){
    const result = editSchema.safeParse(Object.fromEntries(formData.entries())) // true = data , false = none

    if(result.success === false){
        return result.error.formErrors.fieldErrors ;// return all errors
    }
    const data = result.data;
    const product = await prismaDBConnection.product.findUnique({ where: {id}}); // where id == id
    if(product == null)return notFound()

    let filePath = product.filePath;
    if(data.file != null && data.file.size > 0)
        {
            await fs.unlink(product.filePath) // remove the existing file
            filePath = `products/${crypto.randomUUID()}-${data.file.name}`; //overwrite filePath (i.e. save file path to new file)
            await fs.writeFile(filePath, Buffer.from(await data.file.arrayBuffer())) // convert file into buffer, so node can process as file

        }
 
    let imagePath = product.imagePath
    if (data.image != null && data.image.size > 0) 
        {
            await fs.unlink(`public${product.imagePath}`)
            imagePath = `/products/${crypto.randomUUID()}-${data.image.name}`   
            await fs.writeFile(`public${imagePath}`,Buffer.from(await data.image.arrayBuffer()))
        }
    // need to save the file in filesystem before saving to/in db 
    await prismaDBConnection.product.update({
        where: { id},
        data:{
            name: data.name,
            description: data.description,
            priceInCents: data.priceInCents,
            filePath,
            imagePath,
        }
    })
// whenever using cache always invoke revalidation before the redirect

revalidatePath("/")
revalidatePath("/products")
redirect("/admin/products")
}