import toast from "react-hot-toast"

export const useToast = () => {
  const showSuccess = (message: string, options?: { duration?: number }) => {
    return toast.success(message, {
      duration: options?.duration || 3000,
    })
  }

  const showError = (message: string, options?: { duration?: number }) => {
    return toast.error(message, {
      duration: options?.duration || 5000,
    })
  }

  const showLoading = (message: string) => {
    return toast.loading(message, {
      duration: Infinity,
    })
  }

  const showInfo = (message: string, options?: { duration?: number }) => {
    return toast(message, {
      duration: options?.duration || 4000,
      icon: 'ℹ️',
    })
  }

  const dismiss = (toastId?: string) => {
    if (toastId) {
      toast.dismiss(toastId)
    } else {
      toast.dismiss()
    }
  }

  const promise = <T>(
    promise: Promise<T>,
    messages: {
      loading: string
      success: string | ((data: T) => string)
      error: string | ((error: any) => string)
    }
  ) => {
    return toast.promise(promise, messages)
  }

  return {
    success: showSuccess,
    error: showError,
    loading: showLoading,
    info: showInfo,
    dismiss,
    promise,
  }
}
