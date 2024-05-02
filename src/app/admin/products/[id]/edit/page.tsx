import prismaDBConnection from "@/db/db";
import { PageHeader } from "../../../_components/PageHeader";
import { ProductForm } from "../../_components/ProductForm";

export default async function EditProductPage({
    params: { id },
  }: {
    params: { id: string }
  }) {
    const product = await prismaDBConnection.product.findUnique({ where: { id } })
  
    return (
      <>
        <PageHeader>Edit Product</PageHeader>
        <ProductForm product={product} />
      </>
    )
  }