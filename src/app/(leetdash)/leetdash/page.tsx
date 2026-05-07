import { Suspense } from 'react';
import { LeetDash } from '@/components/leetdash/LeetDash';

export default function LeetDashPage() {
  // useSearchParams (inside LeetDash) requires a Suspense boundary at the
  // page level so the dynamic ?view= reads don't bail out the static shell.
  return (
    <Suspense fallback={null}>
      <LeetDash />
    </Suspense>
  );
}
