import React, { useState, useEffect, useCallback } from "react";
import { api } from "../../../services/api";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../components/Toast";

export function LessonDiscussion({ nodeId }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const fetchComments = useCallback(async () => {
    try {
      const res = await api.courses.comments.list(nodeId);
      setComments(res);
    } catch (err) {
      console.error("Failed to fetch comments:", err);
    }
  }, [nodeId]);

  useEffect(() => {
    if (nodeId) {
      fetchComments();
    }
  }, [nodeId, fetchComments]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setLoading(true);
    try {
      await api.courses.comments.create(nodeId, user.id, newComment.trim(), user.role || 'student');
      setNewComment("");
      showToast("Đã gửi bình luận thảo luận thành công!", "success");
      await fetchComments();
    } catch (err) {
      showToast("Gửi bình luận thất bại: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-7 mt-8 text-left">
      <div className="flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-red-800">
          forum
        </span>
        <h3 className="text-xl font-bold text-red-900">Diễn đàn Thảo luận</h3>
      </div>
      
      <p className="text-sm text-gray-500 mb-6">
        Chia sẻ suy nghĩ, đặt câu hỏi học thuật và thảo luận cùng các học viên khác hoặc Admin về bài học này.
      </p>

      {/* Danh sách bình luận */}
      <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 mb-6">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <span className="material-symbols-outlined text-4xl block mb-2 opacity-50">chat_bubble_outline</span>
            Chưa có thảo luận nào. Hãy là người đầu tiên đưa ra quan điểm!
          </div>
        ) : (
          comments.map((comment) => {
            const isAdmin = comment.role === 'admin';
            return (
              <div 
                key={comment.id} 
                className={`p-4 rounded-xl border transition-all ${
                  isAdmin 
                    ? "bg-red-50/70 border-red-200" 
                    : "bg-gray-50 border-gray-100"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg text-gray-600">
                      {isAdmin ? "shield_person" : "account_circle"}
                    </span>
                    <span className={`text-sm font-bold ${isAdmin ? "text-red-900" : "text-gray-800"}`}>
                      {comment.userName || "Học viên"}
                    </span>
                    {isAdmin && (
                      <span className="bg-red-800 text-white text-[10px] uppercase font-bold px-1.5 py-0.5 rounded">
                        Triết gia / Admin
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(comment.createdAt).toLocaleDateString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <p className="text-gray-750 text-sm whitespace-pre-line pl-7 leading-relaxed">
                  {comment.content}
                </p>
              </div>
            );
          })
        )}
      </div>

      {/* Form nhập bình luận */}
      <form onSubmit={handleSubmit} className="border-t border-gray-100 pt-4">
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Chia sẻ quan điểm biện chứng của đồng chí..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={loading}
            className="flex-grow px-4 py-3 border border-gray-300 rounded-xl focus:border-red-800 outline-none text-sm text-gray-850 bg-gray-50/50"
          />
          <button
            type="submit"
            disabled={loading || !newComment.trim()}
            className="bg-red-800 text-white px-5 py-3 rounded-xl font-bold hover:bg-red-900 transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
          >
            {loading ? (
              <span className="material-symbols-outlined animate-spin text-lg">sync</span>
            ) : (
              <>
                <span className="material-symbols-outlined text-base font-bold">send</span>
                <span>Gửi</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
