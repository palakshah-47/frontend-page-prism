import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import AppLayout from './layouts/AppLayout'
import './App.css'

function App() {
  return (
    <AppLayout>
      <Suspense fallback={<div className="p-4">Loading page...</div>}>
        <Outlet />
      </Suspense>
    </AppLayout>
  )
}

export default App
