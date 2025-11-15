interface LoadingOverlayProps {
  isLoading: boolean;
  children?: React.ReactNode;
}

export const LoadingOverlay = ({ isLoading, children }: LoadingOverlayProps) => {
  return (
    <div className="relative">
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
          <div className="flex flex-col items-center gap-2">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="text-sm text-gray-600">Đang tải...</p>
          </div>
        </div>
      )}
    </div>
  );
};

