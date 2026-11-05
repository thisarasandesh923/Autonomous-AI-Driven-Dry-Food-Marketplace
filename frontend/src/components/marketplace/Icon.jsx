export function Icon({ name, size = 20 }) {
  const paths = {
    leaf: 'M12 21V11M12 14C3 15 2 7 3 6c7-1 10 3 9 8ZM12 11C11 3 17 1 21 2c1 7-3 10-9 9ZM5 22h14',
    search: 'M21 21l-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z',
    user: 'M4 22c0-10 16-10 16 0M17 6a5 5 0 1 1-10 0 5 5 0 0 1 10 0Z',
    bag: 'M4 6h16l-1 16H5L4 6ZM8 6V4a4 4 0 0 1 8 0v2M8 10c0 5 8 5 8 0',
    pin: 'M12 22S4 14 4 9a8 8 0 0 1 16 0c0 5-8 13-8 13ZM15 9a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
    heart: 'M12 21 3 12C-3 3 8-2 12 5c4-7 15-2 9 7l-9 9Z',
    spark: 'm12 1 3 8 8 3-8 3-3 8-3-8-8-3 8-3 3-8Z',
    shop: 'M3 10v12h18V10M1 10l4-8h14l4 8c-2 4-5 4-7 0-2 4-6 4-8 0-2 4-5 4-7 0ZM9 22v-8h6v8',
  }
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name] || paths.shop} />
    </svg>
  )
}
