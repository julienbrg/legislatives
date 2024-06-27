import React, { ErrorInfo, ReactNode } from 'react'
import { deviceDetect, deviceType, mobileModel, mobileVendor, isMobile } from 'react-device-detect'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  deviceInfo: string
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, deviceInfo: '' }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, deviceInfo: '' }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo)
  }

  componentDidMount() {
    const deviceInfo = `${mobileVendor} ${mobileModel}`
    this.setState({ deviceInfo })
  }

  render() {
    if (this.state.hasError) {
      return (
        <>
          <h1>Mille excuses, l&apos;appli n&apos;est pas encore disponible sur ce type d&apos;appareil.</h1>
          <br />
          <p>{this.state.deviceInfo}</p>
          <br />
          <p>Merci d&apos;essayer depuis un autre appareil. </p>
        </>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
