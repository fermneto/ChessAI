/**
 * SkeletonLoaders.tsx
 * Centralized skeleton loader components for all app routes.
 * Uses the .skeleton / .skeleton-dark classes defined in globals.css.
 */

/* ============================================================
   Shared Header Skeleton (used in most protected pages)
   ============================================================ */
export function PageHeaderSkeleton({ back = true }: { back?: boolean }) {
  return (
    <header className="bg-white border-b border-neutral-100 h-14 sticky top-0 z-20">
      <div className="container-app h-full flex items-center justify-between">
        {back ? (
          <div className="skeleton h-4 w-20" />
        ) : (
          <div className="flex items-center gap-2">
            <div className="skeleton w-7 h-7 rounded-lg" />
            <div className="skeleton h-4 w-20" />
          </div>
        )}
        <div className="skeleton h-8 w-16 rounded-lg" />
      </div>
    </header>
  );
}

/* ============================================================
   Dashboard Skeleton
   ============================================================ */
export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <PageHeaderSkeleton back={false} />

      <div className="container-app py-10">
        {/* Welcome */}
        <div className="mb-8 space-y-2">
          <div className="skeleton h-9 w-56 rounded-lg" />
          <div className="skeleton h-4 w-72 rounded" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card-surface p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="skeleton h-3 w-20" />
                <div className="skeleton w-4 h-4 rounded-full" />
              </div>
              <div className="skeleton h-8 w-14 rounded-lg" />
            </div>
          ))}
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Repertoires List */}
          <div className="lg:col-span-2 card-surface p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="skeleton h-5 w-36 rounded-lg" />
              <div className="skeleton h-8 w-32 rounded-lg" />
            </div>
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-4 border border-neutral-100 rounded-xl"
                >
                  <div className="skeleton w-10 h-10 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-4 w-1/3 rounded" />
                    <div className="skeleton h-3 w-1/4 rounded" />
                  </div>
                  <div className="skeleton w-10 h-4 rounded" />
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Quick Actions */}
            <div className="card-surface p-5 space-y-3">
              <div className="skeleton h-4 w-24 rounded mb-2" />
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3">
                  <div className="skeleton w-8 h-8 rounded-lg" />
                  <div className="skeleton h-4 w-28 rounded" />
                </div>
              ))}
            </div>
            {/* Daily Tip */}
            <div className="card-surface p-5 space-y-3">
              <div className="skeleton h-4 w-20 rounded" />
              <div className="skeleton h-4 w-full rounded" />
              <div className="skeleton h-4 w-11/12 rounded" />
              <div className="skeleton h-4 w-4/5 rounded" />
              <div className="pt-2 flex items-center justify-between border-t border-neutral-100">
                <div className="skeleton w-14 h-3 rounded" />
                <div className="skeleton w-4 h-4 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Explore Page Skeleton
   ============================================================ */
export function ExploreSkeleton() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <PageHeaderSkeleton back={false} />

      <div className="container-app py-10 max-w-5xl">
        {/* Hero */}
        <div className="mb-8 space-y-2">
          <div className="skeleton h-8 w-64 rounded-lg" />
          <div className="skeleton h-4 w-80 rounded" />
        </div>

        {/* Search bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="skeleton h-11 flex-1 rounded-xl" />
          <div className="skeleton h-11 w-36 rounded-xl" />
          <div className="skeleton h-11 w-24 rounded-xl" />
        </div>

        <div className="skeleton h-4 w-28 rounded mb-4" />

        {/* Cards Grid */}
        <div className="grid sm:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card-surface p-6">
              <div className="flex items-start gap-4">
                <div className="skeleton w-11 h-11 rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-5 w-2/3 rounded" />
                  <div className="skeleton h-3 w-1/2 rounded" />
                  <div className="skeleton h-3 w-1/4 rounded mt-2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Train Selection Page Skeleton
   ============================================================ */
export function TrainSelectionSkeleton() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <PageHeaderSkeleton />

      <div className="container-app py-10 max-w-4xl">
        <div className="mb-8 space-y-2">
          <div className="skeleton h-8 w-56 rounded-lg" />
          <div className="skeleton h-4 w-72 rounded" />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card-surface p-6">
              <div className="flex items-start gap-4">
                <div className="skeleton w-12 h-12 rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-5 w-2/3 rounded" />
                  <div className="skeleton h-3 w-1/2 rounded" />
                  <div className="flex gap-4 mt-4">
                    <div className="skeleton h-8 w-14 rounded" />
                    <div className="skeleton h-8 w-14 rounded" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Repertoire Study Page Skeleton
   ============================================================ */
export function RepertoireStudySkeleton() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <PageHeaderSkeleton />

      <div className="container-app py-6 max-w-6xl">
        {/* Page title area */}
        <div className="mb-6 space-y-2">
          <div className="skeleton h-7 w-64 rounded-lg" />
          <div className="skeleton h-4 w-40 rounded" />
        </div>

        {/* Main layout: study board + sidebar */}
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Board area */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {/* Engine toolbar */}
            <div className="skeleton h-14 w-full max-w-[600px] rounded-2xl" />
            {/* Board */}
            <div className="skeleton aspect-square w-full max-w-[600px] rounded-2xl" />
            {/* Controls */}
            <div className="flex items-center justify-between max-w-[600px]">
              <div className="skeleton h-10 w-32 rounded-xl" />
              <div className="skeleton h-8 w-24 rounded-full" />
              <div className="skeleton h-10 w-36 rounded-xl" />
            </div>
          </div>

          {/* Right panel */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            {/* Notation */}
            <div className="card-surface p-4 min-h-[300px]">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-100">
                <div className="skeleton h-4 w-20 rounded" />
                <div className="skeleton h-3 w-16 rounded" />
              </div>
              <div className="skeleton h-6 w-1/2 rounded mb-4" />
              <div className="space-y-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="grid grid-cols-2 gap-4">
                    <div className="skeleton h-6 rounded" />
                    <div className="skeleton h-6 rounded" />
                  </div>
                ))}
              </div>
            </div>

            {/* Engine panel (dark) */}
            <div className="rounded-2xl bg-neutral-900 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="skeleton-dark h-4 w-28 rounded" />
                <div className="skeleton-dark h-5 w-20 rounded" />
              </div>
              <div className="flex items-center gap-3">
                <div className="skeleton-dark h-4 w-10 rounded" />
                <div className="skeleton-dark h-2 flex-1 rounded-full" />
              </div>
              <div className="rounded-lg bg-white/5 p-3 space-y-2">
                <div className="skeleton-dark h-3 w-20 rounded" />
                <div className="flex gap-2 flex-wrap">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="skeleton-dark h-4 w-10 rounded" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Breadcrumbs and variations */}
        <div className="mt-6 max-w-[600px] mx-auto space-y-4">
          <div className="skeleton h-11 w-full rounded-lg" />
          <div className="card-surface p-5 min-h-[160px]">
            <div className="flex items-center justify-between mb-4">
              <div className="skeleton h-4 w-32 rounded" />
              <div className="skeleton h-3 w-24 rounded" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="skeleton h-16 rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   AI Commentary Skeleton (dark panel)
   ============================================================ */
export function AICommentarySkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-700 via-blue-800 to-indigo-900 text-white shadow-xl shadow-indigo-500/10">
      {/* Header */}
      <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
        <div className="flex items-center gap-3">
          <div className="skeleton-dark h-4 w-16 rounded" />
          <div className="skeleton-dark h-4 w-12 rounded-full" />
        </div>
        <div className="skeleton-dark w-6 h-6 rounded-lg" />
      </div>

      {/* Content */}
      <div className="p-5 h-[290px] flex flex-col justify-between">
        <div className="space-y-3 pt-2">
          <div className="skeleton-dark h-4 w-11/12 rounded" />
          <div className="skeleton-dark h-4 w-full rounded" />
          <div className="skeleton-dark h-4 w-4/5 rounded" />
          <div className="skeleton-dark h-4 w-9/12 rounded" />
          <div className="skeleton-dark h-4 w-3/4 rounded" />
        </div>
        <div className="pt-2 flex justify-between items-center mt-auto border-t border-white/5">
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 rounded-full skeleton-dark" />
            <div className="w-1.5 h-1.5 rounded-full skeleton-dark" />
            <div className="w-1.5 h-1.5 rounded-full skeleton-dark" />
          </div>
          <div className="skeleton-dark h-3 w-24 rounded" />
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Training Session Skeleton (dark themed)
   ============================================================ */
export function TrainingSessionSkeleton() {
  return (
    <div className="min-h-screen bg-neutral-900 text-white flex flex-col">
      {/* Dark Header */}
      <header className="bg-neutral-900 border-b border-white/5 h-14 flex items-center shrink-0">
        <div className="container-app flex items-center justify-between">
          <div className="skeleton-dark h-4 w-24 rounded" />
          <div className="flex items-center gap-2">
            <div className="skeleton-dark h-3 w-3 rounded-full" />
            <div className="skeleton-dark h-4 w-40 rounded" />
          </div>
          <div className="skeleton-dark h-8 w-20 rounded" />
        </div>
      </header>

      {/* Main training area */}
      <main className="flex-1 container-app py-6 max-w-6xl">
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Board */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {/* Status bar */}
            <div className="flex items-center justify-between">
              <div className="skeleton-dark h-6 w-40 rounded-full" />
              <div className="skeleton-dark h-6 w-24 rounded-full" />
            </div>
            {/* Board */}
            <div className="skeleton-dark aspect-square w-full max-w-[560px] rounded-2xl" />
            {/* Controls */}
            <div className="flex gap-2 justify-center">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="skeleton-dark h-10 w-24 rounded-xl" />
              ))}
            </div>
          </div>

          {/* Right panel */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* Score/progress */}
            <div className="rounded-2xl bg-white/5 border border-white/5 p-4 space-y-3">
              <div className="skeleton-dark h-4 w-28 rounded" />
              <div className="skeleton-dark h-3 w-full rounded-full" />
              <div className="flex gap-4">
                <div className="skeleton-dark h-10 w-20 rounded-xl" />
                <div className="skeleton-dark h-10 w-20 rounded-xl" />
              </div>
            </div>
            {/* Hint / AI panel */}
            <div className="rounded-2xl bg-white/5 border border-white/5 p-5 space-y-3 flex-1">
              <div className="skeleton-dark h-4 w-20 rounded" />
              <div className="skeleton-dark h-4 w-full rounded" />
              <div className="skeleton-dark h-4 w-3/4 rounded" />
              <div className="skeleton-dark h-4 w-5/6 rounded" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ============================================================
   Explore Detail (Read-only Viewer) Skeleton
   ============================================================ */
export function ExploreDetailSkeleton() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <PageHeaderSkeleton />

      <div className="container-app py-6 max-w-5xl">
        {/* Title row */}
        <div className="mb-6 flex items-start justify-between">
          <div className="space-y-2">
            <div className="skeleton h-7 w-56 rounded-lg" />
            <div className="skeleton h-4 w-40 rounded" />
          </div>
          <div className="skeleton h-8 w-24 rounded-lg" />
        </div>

        {/* Two-column layout */}
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Board column */}
          <div className="lg:col-span-3 space-y-4">
            <div className="skeleton h-10 w-full rounded-2xl" />
            <div className="skeleton aspect-square w-full rounded-2xl" />
            <div className="flex gap-2 justify-center">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="skeleton h-10 w-10 rounded-lg" />
              ))}
            </div>
          </div>

          {/* Right column */}
          <div className="lg:col-span-2 space-y-4">
            {/* Breadcrumbs */}
            <div className="skeleton h-16 w-full rounded-xl" />
            {/* Continuations */}
            <div className="card-surface p-4 min-h-[90px]">
              <div className="skeleton h-3 w-24 rounded mb-3" />
              <div className="flex gap-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="skeleton h-7 w-14 rounded-lg" />
                ))}
              </div>
            </div>
            {/* AI Commentary skeleton (dark) */}
            <AICommentarySkeleton />
          </div>
        </div>
      </div>
    </div>
  );
}
