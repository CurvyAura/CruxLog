// Minimal _not-found page for Next.js app dir to satisfy build.
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Page not found</h1>
        <p className="text-sm text-muted-foreground mt-2">The page you are looking for does not exist.</p>
      </div>
    </div>
  );
}
