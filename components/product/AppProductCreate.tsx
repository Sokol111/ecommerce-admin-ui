"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormField } from "../ui/form";
import { Button } from "../ui/button";
import AppFormField from "@/components/form/AppFormInput";
import { createProductAction } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { z } from "zod";
import AppFormCheckbox from "../form/AppFormCheckbox";

export const productSchema = z.object({
  name: z.string().min(2, {
    message: "Product name must be at least 2 characters",
  }),
  price: z.coerce.number(),
  quantity: z.coerce.number(),
  enabled: z.boolean().default(false),
});

export type ZodProductCreate = z.infer<typeof productSchema>;

export default function AppProductCreate() {
  const router = useRouter();

  const form = useForm<ZodProductCreate>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      price: 0,
      quantity: 0,
      enabled: false,
    },
  });

  async function onSubmit(value: ZodProductCreate) {
    await createProductAction(value);
    router.push("/product/list");
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name={"name"}
          render={({ field }) => (
            <AppFormField type="text" label="Product name" inputProps={field} />
          )}
        />
        <FormField
          control={form.control}
          name={"price"}
          render={({ field }) => (
            <AppFormField
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
            <AppFormField
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
        <Button type="submit">Save</Button>
      </form>
    </Form>
  );
}
