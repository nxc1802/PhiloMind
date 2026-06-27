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
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-[#002b37] px-6 py-12 text-center transition-colors duration-300">
          <div className="max-w-md w-full bg-white dark:bg-[#003543] rounded-3xl p-8 shadow-xl border border-gray-200 dark:border-gray-800 transition-colors duration-300">
            <span className="material-symbols-outlined text-red-500 text-6xl mb-6 select-none">
              psychology
            </span>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              "Trở ngại chính là con đường"
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm italic mb-6">
              — Marcus Aurelius
            </p>
            <div className="bg-primary-50 dark:bg-primary-950/30 text-primary-800 dark:text-primary-250 p-4 rounded-2xl text-left text-sm mb-6 font-mono overflow-auto max-h-40 border border-primary-100 dark:border-primary-900">
              {this.state.error?.toString() || 'Đã xảy ra lỗi không xác định.'}
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-base mb-6 leading-relaxed">
              Hệ thống gặp một sự cố nhỏ khi kết xuất giao diện. Triết học Stoic dạy chúng ta chấp nhận những điều bất ổn và bình tĩnh tải lại trang.
            </p>
            <button
              onClick={this.handleReload}
              className="w-full flex items-center justify-center gap-2 bg-primary-600 text-white font-bold py-3 px-6 rounded-2xl hover:bg-primary-700 transition-colors shadow-md"
            >
              <span className="material-symbols-outlined text-lg">refresh</span>
              Tải lại trang
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
