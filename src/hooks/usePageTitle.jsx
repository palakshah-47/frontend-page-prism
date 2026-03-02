import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

const getTitle = (pathname) => {
  if (pathname === '/') {
    return 'Dashboard'
  }
  if (pathname === '/projects') {
    return 'Projects'
  }
  if (pathname.startsWith('/projects/')) {
    const segments = pathname.split('/').filter(Boolean)
    const nameSegment = segments[segments.length - 1]
    if (nameSegment) {
      try {
        const decoded = decodeURIComponent(nameSegment)
        return decoded || 'Project'
      } catch {
        return 'Project'
      }
    }
    return 'Project'
  }
  return 'Page Prism'
}

const usePageTitle = (title) => {
  const [pageTitle, setPageTitle] = useState(title)
  const location = useLocation()
  useEffect(() => {
    setPageTitle(getTitle(location.pathname))
  }, [location])

  return pageTitle
}

export default usePageTitle
