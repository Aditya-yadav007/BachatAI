import { Outlet } from 'react-router-dom'
import appConfig from '@/config/appConfig'

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-semibold text-brand-600">{appConfig.appName}</h1>
        <p className="text-sm text-slate-600 mb-4">{appConfig.tagline}</p>
        <Outlet />
      </div>
    </div>
  )
}
