import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🔴 ErrorBoundary yakaladı:', error);
    console.error('🔴 Component stack:', errorInfo.componentStack);
    console.error('🔴 Error stack:', error.stack);
    
    this.setState({
      error,
      errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 p-8 flex items-center justify-center">
          <Card className="max-w-2xl w-full p-8">
            <div className="flex items-center gap-4 mb-6">
              <AlertTriangle className="h-12 w-12 text-red-600" />
              <div>
                <h1 className="text-2xl font-bold text-red-600">Bir Hata Oluştu</h1>
                <p className="text-gray-600">Uygulama beklenmeyen bir hatayla karşılaştı</p>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="font-mono text-sm text-red-800 font-bold mb-2">
                {this.state.error?.name}: {this.state.error?.message}
              </p>
              {this.state.error?.stack && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-red-700 font-semibold">
                    Stack Trace
                  </summary>
                  <pre className="mt-2 text-xs overflow-auto max-h-64 bg-white p-2 rounded border">
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
            </div>

            {this.state.errorInfo && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                <details>
                  <summary className="cursor-pointer text-orange-700 font-semibold">
                    Component Stack
                  </summary>
                  <pre className="mt-2 text-xs overflow-auto max-h-64 bg-white p-2 rounded border">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              </div>
            )}

            <div className="flex gap-4">
              <Button
                onClick={() => {
                  this.setState({ hasError: false, error: null, errorInfo: null });
                  window.location.href = '/';
                }}
                className="flex-1"
              >
                Ana Sayfaya Dön
              </Button>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="flex-1"
              >
                Sayfayı Yenile
              </Button>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
