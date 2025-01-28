"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormField } from "../ui/form";
import { Button } from "../ui/button";
import { updateCategoryAction } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { z } from "zod";
import AppFormInput from "../form/AppFormInput";
import AppFormCheckbox from "../form/AppFormCheckbox";
import { Category } from "@/lib/model/category-model";

export const categorySchema = z.object({
  id: z.string(),
  name: z.string().min(2, {
    message: "Category name must be at least 2 characters",
  }),
  version: z.coerce.number(),
  enabled: z.boolean().default(false),
  createdAt: z.string(),
  modifiedAt: z.string(),
});

export type ZodCategoryEdit = z.infer<typeof categorySchema>;

export default function AppCategoryEdit({ category }: { category: Category }) {
  const router = useRouter();

  const form = useForm<ZodCategoryEdit>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      id: category.id,
      name: category.name,
      version: category.version,
      enabled: category.enabled,
      createdAt: category.createdAt,
      modifiedAt: category.modifiedAt,
    },
  });

  async function onSubmit(value: ZodCategoryEdit) {
    console.log("ZodCategoryEdit", value);
    await updateCategoryAction(value);
    router.push("/category/list");
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
              label="Category ID"
              inputProps={{ ...field }}
              readOnly={true}
            />
          )}
        />
        <FormField
          control={form.control}
          name={"name"}
          render={({ field }) => (
            <AppFormInput
              type="text"
              label="Category name"
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
