"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormField } from "../ui/form";
import { Button } from "../ui/button";
import AppFormField from "@/components/form/AppFormInput";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { createCategoryAction } from "@/lib/actions";
import AppFormCheckbox from "../form/AppFormCheckbox";

export const categorySchema = z.object({
  name: z.string().min(2, {
    message: "Category name must be at least 2 characters",
  }),
  enabled: z.boolean().default(false),
});

export type ZodCategoryCreate = z.infer<typeof categorySchema>;

export default function AppCategoryCreate() {
  const router = useRouter();

  const form = useForm<ZodCategoryCreate>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      enabled: false,
    },
  });

  async function onSubmit(value: ZodCategoryCreate) {
    await createCategoryAction(value);
    router.push("/category/list");
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name={"name"}
          render={({ field }) => (
            <AppFormField
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
        <Button type="submit">Save</Button>
      </form>
    </Form>
  );
}
