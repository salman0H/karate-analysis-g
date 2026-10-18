"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { FallbackCard } from "./fallback-card";

export interface WidgetErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
  customFallback?: (error: Error, reset: () => void) => ReactNode;
  onCatch?: (error: Error, errorInfo: ErrorInfo) => void;
  widgetName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class WidgetErrorBoundary extends Component<WidgetErrorBoundaryProps, State> {
  constructor(props: WidgetErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Enterprise telemetry / Sentry dispatch hook
    if (this.props.onCatch) {
      this.props.onCatch(error, errorInfo);
    } else {
      console.error(
        `[Telemetry Hook: ErrorBoundary] Widget="${this.props.widgetName ?? "AnonymousWidget"}" crashed:`,
        error,
        errorInfo
      );
    }
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      if (this.props.customFallback) {
        return this.props.customFallback(this.state.error, this.handleReset);
      }
      return (
        <FallbackCard
          title={this.props.fallbackTitle ?? `خطا در بارگذاری ${this.props.widgetName ?? "ویجت"}`}
          message={this.props.fallbackMessage}
          error={this.state.error}
          onReset={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}
