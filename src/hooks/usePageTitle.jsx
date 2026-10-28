import { useEffect, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'

const getTitle = (pathname) => {
  if (pathname === '/') {
    return 'Dashboard'
  }
  if (pathname === '/projects') {
    return 'Projects'
  }
  if (pathname.startsWith('/projects')) {
    const segments = pathname.split('/').filter(Boolean)
    const name = segments[segments.length - 1]
    if (name) {
      try {
        const decoded = decodeURIComponent(name)
        return decoded || 'Project'
      } catch (err) {
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
