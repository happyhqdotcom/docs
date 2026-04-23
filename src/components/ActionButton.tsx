import { Button } from '@/components/catalyst/button'

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ??
  'https://happyhq.com'

export function ActionButton({ className }: { className?: string } = {}) {
  return (
    <Button color="violet" href={`${SITE_URL}/waitlist`} className={className}>
      Join Waitlist
    </Button>
  )
}
