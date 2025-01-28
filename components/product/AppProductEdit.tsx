"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormField } from "../ui/form";
import { Button } from "../ui/button";
import { Product } from "@/lib/model/product-model";
import { updateProductAction } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { z } from "zod";
import AppFormInput from "../form/AppFormInput";
import AppFormCheckbox from "../form/AppFormCheckbox";

export const productSchema = z.object({
  id: z.string(),
  name: z.string().min(2, {
    message: "Product name must be at least 2 characters",
  }),
  price: z.coerce.number(),
  quantity: z.coerce.number(),
  version: z.coerce.number(),
  enabled: z.boolean().default(false),
  createdAt: z.string(),
  modifiedAt: z.string(),
});

export type ZodProductEdit = z.infer<typeof productSchema>;

export default function AppProductEdit({ product }: { product: Product }) {
  const router = useRouter();

  const form = useForm<ZodProductEdit>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: product.quantity,
      version: product.version,
      enabled: product.enabled,
      createdAt: product.createdAt,
      modifiedAt: product.modifiedAt,
    },
  });

  async function onSubmit(value: ZodProductEdit) {
    console.log("ZodProductEdit", value);
    await updateProductAction(value);
    router.push("/product/list");
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name={"id"}
          render={({ field }) => (
            <AppFormInput
              type="text"
              label="Product ID"
              inputProps={{ ...field }}
              readOnly={true}
            />
          )}
        />
        <FormField
          control={form.control}
          name={"name"}
          render={({ field }) => (
            <AppFormInput type="text" label="Product name" inputProps={field} />
          )}
        />
        <FormField
          control={form.control}
          name={"price"}
          render={({ field }) => (
            <AppFormInput
              type="text"
              label="Product price"
              inputProps={field}
            />
          )}
        />
        <FormField
          control={form.control}
          name={"quantity"}
          render={({ field }) => (
            <AppFormInput
              type="text"
              label="Product quantity"
              inputProps={field}
            />
          )}
        />
        <FormField
          control={form.control}
          name={"enabled"}
          render={({ field }) => (
            <AppFormCheckbox
              type="checkbox"
              label="Enabled"
              inputProps={{ ...field }}
            />
          )}
        />
        <FormField
          control={form.control}
          name={"createdAt"}
          render={({ field }) => (
            <AppFormInput
              type="text"
              label="Created At"
              inputProps={{ ...field }}
              readOnly={true}
            />
          )}
        />
        <FormField
          control={form.control}
          name={"modifiedAt"}
          render={({ field }) => (
            <AppFormInput
              type="text"
              label="Modified At"
              inputProps={{ ...field }}
              readOnly={true}
            />
          )}
        />
        <Button type="submit">Save</Button>
      </form>
    </Form>
  );
}
