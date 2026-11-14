import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { PageContainer, PageHeader } from '@/components/layout/page'
const schema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, 'Enter at least 2 characters.')
    .max(80, 'Use 80 characters or fewer.'),
})
export default function FormExample() {
  const [submitted, setSubmitted] = useState(false)
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { displayName: '' },
  })
  return (
    <PageContainer>
      <PageHeader
        title="Form example"
        description="Development only. Validates locally; nothing is sent or saved."
      />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(async () => {
            await Promise.resolve()
            setSubmitted(true)
          })}
          className="max-w-md space-y-5"
        >
          <FormField
            control={form.control}
            name="displayName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Display name</FormLabel>
                <FormControl>
                  <Input
                    autoComplete="nickname"
                    {...field}
                    onChange={(event) => {
                      setSubmitted(false)
                      field.onChange(event)
                    }}
                  />
                </FormControl>
                <FormDescription>Use 2–80 characters.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button disabled={form.formState.isSubmitting} type="submit">
            {form.formState.isSubmitting ? 'Validating…' : 'Validate example'}
          </Button>
          {submitted && (
            <p role="status" className="text-sm">
              Validation complete. Nothing was saved.
            </p>
          )}
        </form>
      </Form>
    </PageContainer>
  )
}
