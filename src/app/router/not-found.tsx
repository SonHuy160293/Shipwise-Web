import { Link } from 'react-router'
import { PageContainer, PageHeader } from '@/components/layout/page'
import { Button } from '@/components/ui/button'
export default function NotFound() {
  return (
    <PageContainer>
      <PageHeader
        title="Page not found"
        description="This page may have moved, or the address may be incorrect."
      />
      <Button asChild>
        <Link to="/organizations">Back to Organizations</Link>
      </Button>
    </PageContainer>
  )
}
