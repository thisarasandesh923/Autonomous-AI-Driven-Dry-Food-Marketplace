import islandIngredients from '../assets/island-ingredients.png'
import { BrandLogo } from '../components/BrandLogo'
import { PageContainer } from '../components/PageContainer'

export function AuthLayout({
  children,
  titleId,
  skipLinkLabel = 'Skip to main content',
}) {
  return (
    <>
      <a
        className="fixed top-3 left-3 z-10 -translate-y-[200%] rounded-control bg-text-primary px-4 py-3 text-surface focus:translate-y-0"
        href="#main-content"
      >
        {skipLinkLabel}
      </a>
      <header className="bg-surface">
        <PageContainer className="flex min-h-(--header-height) items-center justify-between gap-4">
          <BrandLogo />
          <span className="mr-8.75 text-caption font-semibold text-text-secondary uppercase [display:var(--header-label-display)]">
            Buyer account
          </span>
        </PageContainer>
      </header>
      <main id="main-content" tabIndex={-1}>
        <PageContainer className="grid grid-cols-(--auth-columns) items-start gap-(--auth-gap) pt-(--auth-top-space) pb-(--auth-bottom-space)">
          <section
            className="order-(--auth-form-order) mt-(--auth-form-offset) w-full min-w-0 max-w-(--auth-form-width) [justify-self:var(--auth-form-alignment)]"
            aria-labelledby={titleId}
          >
            {children}
          </section>
          <aside
            className="order-(--auth-editorial-order) min-w-0 bg-primary"
            aria-label="From the island of Sri Lanka"
          >
            <img
              className="aspect-(--auth-editorial-image-ratio) h-auto w-full object-cover"
              src={islandIngredients}
              alt="Dried mango, cinnamon, spices and coconut arranged on a linen-covered table."
              width={613}
              height={499}
              fetchPriority="high"
            />
            <div className="min-h-(--auth-editorial-copy-height) px-(--auth-editorial-inset) pt-9 pb-10">
              <p className="flex flex-wrap gap-4 text-caption font-semibold leading-control text-secondary-on-primary uppercase">
                <span>From the island</span>
                <span aria-hidden="true">/</span>
                <span>Sri Lanka</span>
              </p>
              <h2 className="mt-7 font-display text-editorial font-normal leading-heading text-background">
                A little island.
                <br />A generous pantry.
              </h2>
            </div>
          </aside>
        </PageContainer>
      </main>
    </>
  )
}
