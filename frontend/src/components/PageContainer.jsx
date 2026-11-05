export function PageContainer({ className = '', ...props }) {
  return (
    <div
      {...props}
      className={`mx-auto w-full max-w-(--page-max-width) px-(--page-gutter) ${className}`}
    />
  )
}
