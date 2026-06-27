import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6 py-12 text-center">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-gray-200">
            <span className="material-symbols-outlined text-red-500 text-6xl mb-6 select-none">
              engineering
            </span>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              Cổng Quản Trị Gặp Trở Ngại
            </h1>
            <div className="bg-red-50 text-red-800 p-4 rounded-2xl text-left text-sm mb-6 font-mono overflow-auto max-h-40 border border-red-100">
              {this.state.error?.toString() || 'Đã xảy ra lỗi kết xuất.'}
            </div>
            <p className="text-gray-600 text-base mb-6 leading-relaxed">
              Hệ thống admin gặp một sự cố nhỏ khi kết xuất giao diện. Hãy thử tải lại trang hoặc liên hệ quản trị hệ thống nếu lỗi tiếp diễn.
            </p>
            <button
              onClick={this.handleReload}
              className="w-full flex items-center justify-center gap-2 bg-[#570013] text-white font-bold py-3 px-6 rounded-2xl hover:bg-[#720019] transition-colors shadow-md"
            >
              <span className="material-symbols-outlined text-lg">refresh</span>
              Tải lại cổng quản trị
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
