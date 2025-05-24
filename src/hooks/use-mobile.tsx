
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(false)

  React.useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT
      setIsMobile(mobile)
    }
    
    // Check immediately
    checkMobile()
    
    // Set up listener
    const handleResize = () => {
      checkMobile()
    }
    
    window.addEventListener("resize", handleResize)
    
    // Clean up
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return isMobile
}
