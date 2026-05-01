export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#F5EDFA] to-[#FFDAD6] p-4">
      {children}
    </div>
  )
}
