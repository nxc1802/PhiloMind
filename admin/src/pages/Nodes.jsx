import React, { useState, useEffect, useMemo, useCallback } from "react";
import AdminPageShell from "../components/AdminPageShell";
import { api } from "../services/api";
import { useToast } from "../components/Toast";
import NodeWarmupTab from "../components/nodes/NodeWarmupTab";
import NodeFlashcardTab from "../components/nodes/NodeFlashcardTab";
import NodeQuizTab from "../components/nodes/NodeQuizTab";
import NodePodcastTab from "../components/nodes/NodePodcastTab";
import NodeDocumentTab from "../components/nodes/NodeDocumentTab";

export default function Nodes() {
  const { showToast } = useToast();
  const [nodes, setNodes] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [modal, setModal] = useState({
    isOpen: false,
    type: "create",
    node: null,
  });
  const [chapterModal, setChapterModal] = useState({
    isOpen: false,
    type: "create",
    chapter: null,
  });
  const [activeRightTab, setActiveRightTab] = useState("warmups");

  // Context sub-states (tab-loaded data)
  const [warmups, setWarmups] = useState([]);
  const [flashcards, setFlashcards] = useState([]);
  const [nodeQuizzes, setNodeQuizzes] = useState([]);
  const [nodePodcast, setNodePodcast] = useState(null);
  const [nodeDocuments, setNodeDocuments] = useState([]);

  // Synthesize/Upload states
  const [podcastScript, setPodcastScript] = useState("");
  const [podcastAudioUrl, setPodcastAudioUrl] = useState("");
  const [podcastTranscript, setPodcastTranscript] = useState("[]");
  const [synthesizingPodcast, setSynthesizingPodcast] = useState(false);

  const [pdfFile, setPdfFile] = useState(null);
  const [uploadingPdf, setUploadingPdf] = useState(false);

  // Bulk import state
  const [jsonText, setJsonText] = useState("");
  const [importingFlashcards, setImportingFlashcards] = useState(false);

  // Forms state
  const [form, setForm] = useState({
    title: "",
    summary: "",
    originalText: "",
    quickTake: "",
    difficulty: "Medium",
    timeToRead: "10 min read",
    videoUrl: "",
    lessonType: "flow",
    contentReady: false,
    lessonStatus: "draft",
    orderIndex: 1,
    chapterId: "",
    lessonFlow: "",
  });

  const [chapterForm, setChapterForm] = useState({
    title: "",
    orderIndex: 1,
    courseId: "",
    parentChapterId: "",
  });

  const [warmupForm, setWarmupForm] = useState({
    type: "image-guess",
    title: "",
    image: "",
    blanks: "",
    answer: "",
    story: "",
    question: "",
    optionsString: "",
    correctIndex: 0,
    reveal: "",
  });

  // Flashcards CRUD sub-state
  const [fcModal, setFcModal] = useState({
    isOpen: false,
    type: "create",
    flashcard: null,
  });
  const [fcForm, setFcForm] = useState({
    tag: "Chung",
    style: "normal", // 'normal' | 'mcq'
    questionText: "",
    optA: "",
    optB: "",
    optC: "",
    optD: "",
    correctOpt: "A",
    question: "",
    answer: "",
  });

  // Quizzes CRUD sub-state
  const [quizModal, setQuizModal] = useState({
    isOpen: false,
    type: "create",
    quiz: null,
  });
  const [quizForm, setQuizForm] = useState({
    type: "matching",
    title: "",
    description: "",
  });
  const [quizMcqQuestions, setQuizMcqQuestions] = useState([
    { question: "", options: ["", "", "", ""], correctIndex: 0 },
  ]);
  const [quizMatchingPairs, setQuizMatchingPairs] = useState([
    { left: "", right: "" },
  ]);
  const [quizEssayPrompts, setQuizEssayPrompts] = useState([
    { question: "", sampleAnswer: "" },
  ]);

  // Load curriculum structure
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [nList, chList, cList] = await Promise.all([
        api.nodes.list(),
        api.chapters.list(),
        api.courses.list(),
      ]);
      setNodes(nList || []);
      setChapters(chList || []);
      setCourses(cList || []);
    } catch (err) {
      showToast("Lỗi tải dữ liệu: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Load tab contextual data
  const loadTabContext = useCallback(
    async (tabName, nodeId, courseId) => {
      if (!nodeId) return;
      try {
        if (tabName === "warmups") {
          const wList = await api.warmups.list(nodeId);
          setWarmups(wList || []);
        } else if (tabName === "flashcards") {
          const fList = await api.flashcards.list(nodeId);
          setFlashcards(fList || []);
        } else if (tabName === "quizzes") {
          const qList = await api.quizzes.list(nodeId);
          setNodeQuizzes(qList || []);
        } else if (tabName === "podcast") {
          const pList = await api.podcasts.list();
          const pod = pList.find((p) => p.nodeId === nodeId);
          setNodePodcast(pod || null);
          if (pod) {
            setPodcastAudioUrl(pod.audioUrl || "");
            setPodcastTranscript(
              JSON.stringify(pod.transcript, null, 2) || "[]",
            );
          } else {
            setPodcastAudioUrl("");
            setPodcastTranscript("[]");
          }
        } else if (tabName === "pdf") {
          if (courseId) {
            const dList = await api.documents.list(courseId);
            setNodeDocuments(dList || []);
          }
        }
      } catch (err) {
        showToast("Lỗi tải dữ liệu phân hệ: " + err.message, "error");
      }
    },
    [showToast],
  );

  // Sync tab loading
  useEffect(() => {
    if (modal.type === "edit" && modal.node) {
      const chap = chapters.find((c) => c.id === modal.node.chapterId);
      const courseId = chap ? chap.courseId : "";
      loadTabContext(activeRightTab, modal.node.id, courseId);
    }
  }, [activeRightTab, modal.node, modal.type, chapters, loadTabContext]);

  // --- CHAPTER CRUD ---
  const openCreateChapter = (courseId, parentChapterId = "") => {
    setChapterModal({ isOpen: true, type: "create", chapter: null });
    setChapterForm({
      title: "",
      orderIndex: chapters.length + 1,
      courseId: courseId || (courses.length > 0 ? courses[0].id : ""),
      parentChapterId: parentChapterId || "",
    });
  };

  const openEditChapter = (chapter) => {
    setChapterModal({ isOpen: true, type: "edit", chapter });
    setChapterForm({
      title: chapter.title,
      orderIndex: chapter.orderIndex,
      courseId: chapter.courseId,
      parentChapterId: chapter.parentChapterId || "",
    });
  };

  const handleChapterSubmit = async (e) => {
    e.preventDefault();
    try {
      if (chapterModal.type === "create") {
        await api.chapters.create({
          title: chapterForm.title,
          orderIndex: Number(chapterForm.orderIndex),
          courseId: chapterForm.courseId,
          parentChapterId: chapterForm.parentChapterId || null,
        });
        showToast("Tạo chương học thành công!", "success");
      } else {
        await api.chapters.update(chapterModal.chapter.id, {
          title: chapterForm.title,
          orderIndex: Number(chapterForm.orderIndex),
          parentChapterId: chapterForm.parentChapterId || null,
        });
        showToast("Cập nhật chương học thành công!", "success");
      }
      setChapterModal({ isOpen: false, type: "create", chapter: null });
      loadData();
    } catch (err) {
      showToast("Thao tác thất bại: " + err.message, "error");
    }
  };

  const handleChapterDelete = async (id) => {
    if (
      !window.confirm(
        "Bạn có chắc chắn muốn xóa chương này? Việc này sẽ xóa toàn bộ concept nodes, flashcards và podcasts trực thuộc.",
      )
    )
      return;
    try {
      await api.chapters.delete(id);
      showToast("Xóa chương học thành công!", "success");
      loadData();
    } catch (err) {
      showToast("Xóa thất bại: " + err.message, "error");
    }
  };

  // --- NODE CRUD ---
  const openCreateNode = (chapterId) => {
    setModal({ isOpen: true, type: "create", node: null });
    setForm({
      title: "",
      summary: "",
      originalText: "",
      quickTake: "",
      difficulty: "Medium",
      timeToRead: "10 min read",
      videoUrl: "",
      lessonType: "flow",
      contentReady: false,
      lessonStatus: "draft",
      orderIndex: nodes.filter((n) => n.chapterId === chapterId).length + 1,
      chapterId: chapterId || (chapters.length > 0 ? chapters[0].id : ""),
      lessonFlow: "",
    });
  };

  const openEdit = async (node) => {
    setModal({ isOpen: true, type: "edit", node });
    setForm({
      title: node.title,
      summary: node.summary || "",
      originalText: node.originalText || "",
      quickTake: node.quickTake || "",
      difficulty: node.difficulty || "Medium",
      timeToRead: node.timeToRead || "10 min read",
      videoUrl: node.videoUrl || "",
      lessonType: "flow",
      contentReady: Boolean(node.contentReady),
      lessonStatus:
        node.lessonStatus || (node.contentReady ? "published" : "draft"),
      orderIndex: node.orderIndex,
      chapterId: node.chapterId,
      lessonFlow: node.lessonFlow
        ? JSON.stringify(node.lessonFlow, null, 2)
        : "",
    });
    setActiveRightTab("warmups");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const parseJsonField = (fieldVal, fieldName) => {
        if (!fieldVal || !fieldVal.trim()) return null;
        try {
          return JSON.parse(fieldVal);
        } catch (err) {
          throw new Error(
            `Trường ${fieldName} có định dạng JSON không hợp lệ: ${err.message}`,
          );
        }
      };

      const lessonFlowJson = parseJsonField(form.lessonFlow, "Lesson Flow");

      const payload = {
        ...form,
        lessonType: "flow",
        orderIndex: Number(form.orderIndex),
        lessonFlow: lessonFlowJson,
      };

      if (modal.type === "create") {
        await api.nodes.create(payload);
        showToast("Tạo bài học thành công!", "success");
      } else {
        await api.nodes.update(modal.node.id, payload);
        showToast("Cập nhật bài học thành công!", "success");
      }
      setModal({ isOpen: false, type: "create", node: null });
      loadData();
    } catch (err) {
      showToast("Thao tác thất bại: " + err.message, "error");
    }
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Bạn có chắc chắn muốn xóa bài học này? Việc này sẽ xóa toàn bộ flashcards, podcasts, các phần khởi động (Warmups), tiến trình học tập và lịch sử tranh luận liên kết.",
      )
    )
      return;
    try {
      await api.nodes.delete(id);
      showToast("Xóa bài học thành công!", "success");
      loadData();
    } catch (err) {
      showToast("Xóa bài học thất bại: " + err.message, "error");
    }
  };

  // --- WARMUP HANDLERS ---
  const handleAddWarmup = async (e) => {
    e.preventDefault();
    if (!modal.node) return;
    try {
      const options = warmupForm.optionsString
        ? warmupForm.optionsString
            .split(",")
            .map((o) => o.trim())
            .filter(Boolean)
        : [];

      const payload = {
        type: warmupForm.type,
        title:
          warmupForm.title ||
          (warmupForm.type === "image-guess"
            ? "Nhìn hình đoán thuật ngữ"
            : warmupForm.type === "video"
              ? "Video khởi động triết học"
              : "Chiêm nghiệm câu chuyện triết học"),
        image:
          warmupForm.type === "image-guess" || warmupForm.type === "video"
            ? warmupForm.image
            : undefined,
        blanks:
          warmupForm.type === "image-guess" ? warmupForm.blanks : undefined,
        answer:
          warmupForm.type === "image-guess" ? warmupForm.answer : undefined,
        story: warmupForm.type === "story" ? warmupForm.story : undefined,
        question:
          warmupForm.type === "story" || warmupForm.type === "video"
            ? warmupForm.question
            : undefined,
        options:
          warmupForm.type === "story" || warmupForm.type === "video"
            ? options
            : undefined,
        correctIndex:
          warmupForm.type === "story" || warmupForm.type === "video"
            ? Number(warmupForm.correctIndex)
            : undefined,
        reveal: warmupForm.reveal,
      };

      await api.warmups.create(modal.node.id, payload);
      showToast("Thêm câu hỏi khởi động thành công!", "success");

      setWarmupForm({
        type: "image-guess",
        title: "",
        image: "",
        blanks: "",
        answer: "",
        story: "",
        question: "",
        optionsString: "",
        correctIndex: 0,
        reveal: "",
      });

      loadTabContext("warmups", modal.node.id, null);
    } catch (err) {
      showToast("Thêm khởi động thất bại: " + err.message, "error");
    }
  };

  const handleDeleteWarmup = async (warmupId) => {
    if (!window.confirm("Bạn có chắc muốn xóa câu hỏi khởi động này?")) return;
    try {
      await api.warmups.delete(warmupId);
      showToast("Xóa khởi động thành công!", "success");
      loadTabContext("warmups", modal.node.id, null);
    } catch (err) {
      showToast("Xóa khởi động thất bại: " + err.message, "error");
    }
  };

  // --- FLASHCARD CRUD HANDLERS ---
  const parseFlashcardQuestion = (questionText) => {
    if (!questionText)
      return { question: "", options: ["", "", "", ""], isMcq: false };
    const lines = questionText.split("\n");
    if (lines.length > 1) {
      const qText = lines[0];
      const opts = lines
        .slice(1)
        .map((l) => l.trim())
        .filter(Boolean);
      if (opts.length > 0) {
        const options = ["", "", "", ""];
        opts.forEach((o, i) => {
          if (i < 4) options[i] = o;
        });
        return { question: qText, options, isMcq: true };
      }
    }
    return { question: questionText, options: ["", "", "", ""], isMcq: false };
  };

  const openCreateFc = () => {
    setFcModal({ isOpen: true, type: "create", flashcard: null });
    setFcForm({
      tag: "Chung",
      style: "normal",
      questionText: "",
      optA: "",
      optB: "",
      optC: "",
      optD: "",
      correctOpt: "A",
      question: "",
      answer: "",
    });
  };

  const openEditFc = (fc) => {
    const parsed = parseFlashcardQuestion(fc.question);
    setFcModal({ isOpen: true, type: "edit", flashcard: fc });

    if (parsed.isMcq) {
      const stripPrefix = (str) => {
        const match = str.match(/^[A-D]\.\s*(.*)/);
        return match ? match[1] : str;
      };
      const optA = parsed.options[0] ? stripPrefix(parsed.options[0]) : "";
      const optB = parsed.options[1] ? stripPrefix(parsed.options[1]) : "";
      const optC = parsed.options[2] ? stripPrefix(parsed.options[2]) : "";
      const optD = parsed.options[3] ? stripPrefix(parsed.options[3]) : "";

      let correctOpt = "A";
      if (fc.answer.startsWith("B.")) correctOpt = "B";
      else if (fc.answer.startsWith("C.")) correctOpt = "C";
      else if (fc.answer.startsWith("D.")) correctOpt = "D";

      setFcForm({
        tag: fc.tag,
        style: "mcq",
        questionText: parsed.question,
        optA,
        optB,
        optC,
        optD,
        correctOpt,
        question: "",
        answer: "",
      });
    } else {
      setFcForm({
        tag: fc.tag,
        style: "normal",
        questionText: "",
        optA: "",
        optB: "",
        optC: "",
        optD: "",
        correctOpt: "A",
        question: fc.question,
        answer: fc.answer,
      });
    }
  };

  const handleFcSubmit = async (e) => {
    e.preventDefault();
    let finalQuestion = fcForm.question;
    let finalAnswer = fcForm.answer;

    if (fcForm.style === "mcq") {
      finalQuestion = `${fcForm.questionText}\nA. ${fcForm.optA}\nB. ${fcForm.optB}\nC. ${fcForm.optC}\nD. ${fcForm.optD}`;
      finalAnswer = `${fcForm.correctOpt}. ${fcForm[`opt${fcForm.correctOpt}`]}`;
    }

    const payload = {
      nodeId: modal.node.id,
      tag: fcForm.tag,
      question: finalQuestion,
      answer: finalAnswer,
    };

    try {
      if (fcModal.type === "create") {
        await api.flashcards.create(payload);
        showToast("Tạo thẻ nhớ thành công!", "success");
      } else {
        await api.flashcards.update(fcModal.flashcard.id, payload);
        showToast("Cập nhật thẻ nhớ thành công!", "success");
      }
      setFcModal({ isOpen: false, type: "create", flashcard: null });
      loadTabContext("flashcards", modal.node.id, null);
    } catch (err) {
      showToast("Lưu thẻ nhớ thất bại: " + err.message, "error");
    }
  };

  const handleFcDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa thẻ nhớ này?")) return;
    try {
      await api.flashcards.delete(id);
      showToast("Xóa thẻ nhớ thành công!", "success");
      loadTabContext("flashcards", modal.node.id, null);
    } catch (err) {
      showToast("Xóa thẻ nhớ thất bại: " + err.message, "error");
    }
  };

  const handleJsonUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setJsonText(event.target.result);
    };
    reader.readAsText(file);
  };

  const handleBulkImport = async () => {
    if (!jsonText.trim() || !modal.node) return;
    setImportingFlashcards(true);
    try {
      const parsed = JSON.parse(jsonText.trim());
      const cards = Array.isArray(parsed) ? parsed : parsed.flashcards || [];
      if (cards.length === 0) {
        throw new Error("Mảng thẻ nhớ trống hoặc sai cấu trúc.");
      }

      await api.flashcards.bulkImport(modal.node.id, cards);
      showToast(
        `Nhập hàng loạt thành công ${cards.length} thẻ nhớ!`,
        "success",
      );
      setJsonText("");
      loadTabContext("flashcards", modal.node.id, null);
    } catch (err) {
      showToast("Lỗi nhập thẻ nhớ: " + err.message, "error");
    } finally {
      setImportingFlashcards(false);
    }
  };

  // --- QUIZ CRUD HANDLERS ---
  const openCreateQuiz = () => {
    setQuizModal({ isOpen: true, type: "create", quiz: null });
    setQuizForm({
      type: "matching",
      title: "",
      description: "",
    });
    setQuizMcqQuestions([
      { question: "", options: ["", "", "", ""], correctIndex: 0 },
    ]);
    setQuizMatchingPairs([{ left: "", right: "" }]);
    setQuizEssayPrompts([{ question: "", sampleAnswer: "" }]);
  };

  const openEditQuiz = (quiz) => {
    setQuizModal({ isOpen: true, type: "edit", quiz });
    setQuizForm({
      type: quiz.type,
      title: quiz.title,
      description: quiz.description || "",
    });

    if (
      quiz.type === "mcq" ||
      quiz.type === "image" ||
      quiz.type === "analysis"
    ) {
      setQuizMcqQuestions(Array.isArray(quiz.questions) ? quiz.questions : []);
    } else if (quiz.type === "matching") {
      setQuizMatchingPairs(Array.isArray(quiz.questions) ? quiz.questions : []);
    } else if (quiz.type === "essay") {
      setQuizEssayPrompts(Array.isArray(quiz.questions) ? quiz.questions : []);
    }
  };

  const handleQuizSubmit = async (e) => {
    e.preventDefault();
    let questionsPayload = [];
    if (
      quizForm.type === "mcq" ||
      quizForm.type === "image" ||
      quizForm.type === "analysis"
    ) {
      questionsPayload = quizMcqQuestions;
    } else if (quizForm.type === "matching") {
      questionsPayload = quizMatchingPairs;
    } else if (quizForm.type === "essay") {
      questionsPayload = quizEssayPrompts;
    }

    const payload = {
      nodeId: modal.node.id,
      type: quizForm.type,
      title: quizForm.title,
      description: quizForm.description,
      questions: questionsPayload,
    };

    try {
      if (quizModal.type === "create") {
        await api.quizzes.create(payload);
        showToast("Tạo bộ Quiz mới thành công!", "success");
      } else {
        await api.quizzes.update(quizModal.quiz.id, payload);
        showToast("Cập nhật bộ Quiz thành công!", "success");
      }
      setQuizModal({ isOpen: false, type: "create", quiz: null });
      loadTabContext("quizzes", modal.node.id, null);
    } catch (err) {
      showToast("Lưu Quiz thất bại: " + err.message, "error");
    }
  };

  const handleQuizDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bộ quiz này?")) return;
    try {
      await api.quizzes.delete(id);
      showToast("Xóa quiz thành công!", "success");
      loadTabContext("quizzes", modal.node.id, null);
    } catch (err) {
      showToast("Xóa quiz thất bại: " + err.message, "error");
    }
  };

  // --- PODCAST HANDLERS ---
  const handlePodcastSynthesize = async () => {
    if (!modal.node) return;
    if (!podcastScript.trim()) {
      showToast("Vui lòng nhập kịch bản lời thoại cần chuyển đổi.", "warning");
      return;
    }

    setSynthesizingPodcast(true);
    try {
      showToast(
        "Đang tiến hành chuyển đổi TTS & sinh podcast preview...",
        "info",
      );
      const result = await api.podcasts.synthesize(
        modal.node.id,
        podcastScript,
      );
      setPodcastAudioUrl(result.audioUrl);
      setPodcastTranscript(JSON.stringify(result.transcript, null, 2));
      showToast(
        "Tổng hợp TTS thành công! Hãy nghe thử bản Preview.",
        "success",
      );
    } catch (err) {
      showToast("Chuyển đổi TTS thất bại: " + err.message, "error");
    } finally {
      setSynthesizingPodcast(false);
    }
  };

  const handlePodcastSubmit = async (e) => {
    e.preventDefault();
    if (!podcastAudioUrl) {
      showToast("Vui lòng chạy TTS để sinh Audio URL trước.", "warning");
      return;
    }

    let parsedTranscript;
    try {
      parsedTranscript = JSON.parse(podcastTranscript);
    } catch (_) {
      showToast(
        "Lỗi: Kịch bản (transcript) phải là định dạng JSON mảng hợp lệ.",
        "error",
      );
      return;
    }

    try {
      if (!nodePodcast) {
        await api.podcasts.create({
          nodeId: modal.node.id,
          audioUrl: podcastAudioUrl,
          transcript: parsedTranscript,
        });
        showToast("Tạo Podcast thành công!", "success");
      } else {
        await api.podcasts.update(nodePodcast.id, {
          audioUrl: podcastAudioUrl,
          transcript: parsedTranscript,
        });
        showToast("Cập nhật Podcast thành công!", "success");
      }
      loadTabContext("podcast", modal.node.id, null);
    } catch (err) {
      showToast("Thao tác thất bại: " + err.message, "error");
    }
  };

  const handlePodcastDelete = async () => {
    if (!nodePodcast) return;
    if (!window.confirm("Bạn có chắc chắn muốn xóa Podcast này?")) return;
    try {
      await api.podcasts.delete(nodePodcast.id);
      showToast("Xóa Podcast thành công!", "success");
      setNodePodcast(null);
      setPodcastAudioUrl("");
      setPodcastTranscript("[]");
    } catch (err) {
      showToast("Xóa Podcast thất bại: " + err.message, "error");
    }
  };

  // --- PDF HANDLERS ---
  const handlePdfUploadSubmit = async (e) => {
    e.preventDefault();
    if (!pdfFile || !modal.node) return;

    const chap = chapters.find((c) => c.id === modal.node.chapterId);
    const courseId = chap ? chap.courseId : "";
    if (!courseId) {
      showToast(
        "Lỗi: Không tìm thấy khóa học tương ứng cho chương này.",
        "error",
      );
      return;
    }

    setUploadingPdf(true);
    try {
      // 1. Upload file to Supabase bucket
      const res = await api.files.upload(pdfFile);

      // 2. Save reference document record to the DB
      await api.documents.create({
        courseId,
        fileName: pdfFile.name,
        fileUrl: res.url,
        status: "completed",
      });

      showToast(`Upload tài liệu PDF thành công: ${pdfFile.name}`, "success");
      setPdfFile(null);
      loadTabContext("pdf", modal.node.id, courseId);
    } catch (err) {
      showToast("Upload PDF thất bại: " + err.message, "error");
    } finally {
      setUploadingPdf(false);
    }
  };

  const handleDocumentDelete = async (docId) => {
    if (!window.confirm("Bạn có chắc muốn xóa tài liệu này?")) return;
    try {
      await api.documents.delete(docId);
      showToast("Xóa tài liệu thành công!", "success");
      const chap = chapters.find((c) => c.id === modal.node.chapterId);
      loadTabContext("pdf", modal.node.id, chap ? chap.courseId : "");
    } catch (err) {
      showToast("Xóa tài liệu thất bại: " + err.message, "error");
    }
  };

  return (
    <AdminPageShell activeKey="nodes">
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-2">
              <span className="material-symbols-outlined text-red-500 text-3xl">
                auto_stories
              </span>
              Quản lý Giáo trình & Bài học
            </h1>
            <p className="text-slate-400 mt-1">
              Thiết kế cấu trúc chương học, bài giảng lý thuyết, và tích hợp các
              công cụ flashcard, trắc nghiệm, podcast.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => openCreateChapter(null)}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-750 text-white px-4 py-2.5 rounded-xl font-semibold shadow-lg transition-colors border border-slate-700"
            >
              <span className="material-symbols-outlined text-sm">add_box</span>{" "}
              Thêm Chương
            </button>
            <button
              onClick={() => openCreateNode(null)}
              className="flex items-center gap-2 bg-red-800 hover:bg-red-900 text-white px-4 py-2.5 rounded-xl font-semibold shadow-lg transition-colors"
            >
              <span className="material-symbols-outlined text-sm">add</span>{" "}
              Thêm Bài học
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-red-500 text-5xl animate-spin">
              sync
            </span>
            <p className="text-slate-400 mt-4">
              Đang tải danh sách giáo trình...
            </p>
          </div>
        ) : (
          <HierarchyTreeView
            chapters={chapters}
            nodes={nodes}
            courses={courses}
            openEdit={openEdit}
            handleDelete={handleDelete}
            openCreateChapter={openCreateChapter}
            openEditChapter={openEditChapter}
            handleChapterDelete={handleChapterDelete}
            openCreateNode={openCreateNode}
          />
        )}

        {/* 1. Chapter Create/Edit Modal */}
        {chapterModal.isOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-950 rounded-2xl border border-slate-800 w-full max-w-md shadow-2xl overflow-hidden p-6 space-y-6 text-left">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-100">
                  {chapterModal.type === "create"
                    ? "Thêm Chương mới"
                    : "Chỉnh sửa Chương"}
                </h3>
                <button
                  onClick={() =>
                    setChapterModal({
                      isOpen: false,
                      type: "create",
                      chapter: null,
                    })
                  }
                  className="text-slate-550 hover:text-slate-350"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <form onSubmit={handleChapterSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Tên chương học
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Chương 1: Khái lược về triết học"
                    value={chapterForm.title}
                    onChange={(e) =>
                      setChapterForm({ ...chapterForm, title: e.target.value })
                    }
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 placeholder:text-slate-650 focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>
                {chapterModal.type === "create" && (
                  <div className="space-y-1">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Thuộc Khóa học
                    </label>
                    <select
                      value={chapterForm.courseId}
                      onChange={(e) =>
                        setChapterForm({
                          ...chapterForm,
                          courseId: e.target.value,
                        })
                      }
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-red-500"
                    >
                      {courses.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Thuộc Chương Cha (Optional / Tạo Sub-chapter)
                  </label>
                  <select
                    value={chapterForm.parentChapterId}
                    onChange={(e) =>
                      setChapterForm({
                        ...chapterForm,
                        parentChapterId: e.target.value,
                      })
                    }
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-red-500 transition-colors"
                  >
                    <option value="">-- Chọn Chương Cha (Không có) --</option>
                    {chapters
                      .filter(
                        (ch) =>
                          ch.courseId === chapterForm.courseId &&
                          (!chapterModal.chapter ||
                            ch.id !== chapterModal.chapter.id) &&
                          !ch.parentChapterId,
                      )
                      .map((ch) => (
                        <option key={ch.id} value={ch.id}>
                          {ch.title}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Thứ tự hiển thị (Order Index)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={chapterForm.orderIndex}
                    onChange={(e) =>
                      setChapterForm({
                        ...chapterForm,
                        orderIndex: e.target.value,
                      })
                    }
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-red-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-red-800 hover:bg-red-900 text-white font-bold py-3 rounded-xl transition-colors shadow-lg"
                >
                  {chapterModal.type === "create"
                    ? "Tạo Chương học"
                    : "Lưu thay đổi"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* 2. Node Create/Edit Modal */}
        {modal.isOpen && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div
              className={`bg-slate-950 rounded-2xl border border-slate-800 w-full ${modal.type === "edit" ? "max-w-6xl" : "max-w-lg"} shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-all`}
            >
              <div className="flex justify-between items-center p-6 border-b border-slate-800 shrink-0">
                <h3 className="text-xl font-bold text-slate-100">
                  {modal.type === "create"
                    ? "Tạo Bài học mới"
                    : `Chỉnh sửa Bài học: ${modal.node?.title}`}
                </h3>
                <button
                  onClick={() =>
                    setModal({ isOpen: false, type: "create", node: null })
                  }
                  className="text-slate-500 hover:text-slate-350"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 text-left">
                <div
                  className={`grid ${modal.type === "edit" ? "lg:grid-cols-2 gap-8" : "grid-cols-1"}`}
                >
                  {/* Left Column - Node General Form */}
                  <form onSubmit={handleSubmit} className="space-y-4 pr-2">
                    <h4 className="text-lg font-semibold text-red-400 flex items-center gap-2 mb-2">
                      <span className="material-symbols-outlined">
                        menu_book
                      </span>{" "}
                      Thông tin lý thuyết bài học
                    </h4>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Tiêu đề bài học
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ví dụ: Phạm trù vật chất"
                        value={form.title}
                        onChange={(e) =>
                          setForm({ ...form, title: e.target.value })
                        }
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 placeholder:text-slate-605 focus:outline-none focus:border-red-500 transition-colors"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Thuộc Chương học
                      </label>
                      <select
                        value={form.chapterId}
                        onChange={(e) =>
                          setForm({ ...form, chapterId: e.target.value })
                        }
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-red-500 transition-colors"
                      >
                        {chapters.map((ch) => (
                          <option key={ch.id} value={ch.id}>
                            {ch.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        YouTube Video URL
                      </label>
                      <input
                        type="url"
                        placeholder="Ví dụ: https://www.youtube.com/watch?v=Mzg-AdRrjGY"
                        value={form.videoUrl}
                        onChange={(e) =>
                          setForm({ ...form, videoUrl: e.target.value })
                        }
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 placeholder:text-slate-650 focus:outline-none focus:border-red-500 transition-colors"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Kiến trúc bài học
                      </label>
                      <div className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100">
                        Component Flow
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <label className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-slate-200">
                        <input
                          type="checkbox"
                          checked={Boolean(form.contentReady)}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              contentReady: e.target.checked,
                              lessonStatus:
                                e.target.checked &&
                                form.lessonStatus === "draft"
                                  ? "published"
                                  : form.lessonStatus,
                            })
                          }
                          className="mt-1 h-4 w-4 accent-red-700"
                        />
                        <span>
                          <span className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                            Nội dung chính thức
                          </span>
                          <span className="block text-xs text-slate-500">
                            Bỏ chọn để bài mờ/khóa ngoài frontend.
                          </span>
                        </span>
                      </label>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                          Trạng thái xuất bản
                        </label>
                        <select
                          value={form.lessonStatus}
                          onChange={(e) =>
                            setForm({ ...form, lessonStatus: e.target.value })
                          }
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-red-500"
                        >
                          <option value="draft">Draft</option>
                          <option value="published">Published</option>
                          <option value="archived">Archived</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Tóm tắt bài học (Summary)
                      </label>
                      <textarea
                        rows="3"
                        required
                        placeholder="Tóm tắt lý thuyết bài học..."
                        value={form.summary}
                        onChange={(e) =>
                          setForm({ ...form, summary: e.target.value })
                        }
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 placeholder:text-slate-650 focus:outline-none focus:border-red-500 transition-colors resize-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Ý chính nhanh (Quick Take)
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ý chính rút gọn cô đọng..."
                        value={form.quickTake}
                        onChange={(e) =>
                          setForm({ ...form, quickTake: e.target.value })
                        }
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 placeholder:text-slate-650 focus:outline-none focus:border-red-500 transition-colors"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Trích dẫn giáo trình gốc (Original Text)
                      </label>
                      <textarea
                        rows="4"
                        required
                        placeholder="Trích dẫn chính văn giáo trình học thuật..."
                        value={form.originalText}
                        onChange={(e) =>
                          setForm({ ...form, originalText: e.target.value })
                        }
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 placeholder:text-slate-650 focus:outline-none focus:border-red-500 transition-colors resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                          Độ khó
                        </label>
                        <select
                          value={form.difficulty}
                          onChange={(e) =>
                            setForm({ ...form, difficulty: e.target.value })
                          }
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-red-500"
                        >
                          <option value="Easy">Easy</option>
                          <option value="Medium">Medium</option>
                          <option value="Hard">Hard</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                          Thời lượng đọc
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Ví dụ: 10 min read"
                          value={form.timeToRead}
                          onChange={(e) =>
                            setForm({ ...form, timeToRead: e.target.value })
                          }
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-red-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Thứ tự hiển thị (Order Index)
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={form.orderIndex}
                        onChange={(e) =>
                          setForm({ ...form, orderIndex: e.target.value })
                        }
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-red-500"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-red-800 hover:bg-red-900 text-white font-bold py-3 rounded-xl transition-colors shadow-lg mt-4 flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-sm">
                        save
                      </span>
                      {modal.type === "create"
                        ? "Tạo Bài học"
                        : "Lưu lý thuyết bài học"}
                    </button>
                  </form>

                  {/* Right Column - Sub-tabs Section */}
                  {modal.type === "edit" && (
                    <div className="border-l border-slate-800 pl-0 lg:pl-8 space-y-6 flex flex-col min-h-0">
                      {/* Tabs Navigation */}
                      <div className="flex gap-2 border-b border-slate-800 pb-3 mb-2 overflow-x-auto shrink-0">
                        <button
                          type="button"
                          onClick={() => setActiveRightTab("warmups")}
                          className={`px-3 py-1.5 rounded-lg text-2xs font-bold transition-all shrink-0 ${
                            activeRightTab === "warmups"
                              ? "bg-amber-600 text-white shadow-md"
                              : "bg-slate-905 text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          🔥 Làm nóng (Warmups)
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveRightTab("framework")}
                          className={`px-3 py-1.5 rounded-lg text-2xs font-bold transition-all shrink-0 ${
                            activeRightTab === "framework"
                              ? "bg-indigo-600 text-white shadow-md"
                              : "bg-slate-905 text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          ⚡ Lesson Flow
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveRightTab("flashcards")}
                          className={`px-3 py-1.5 rounded-lg text-2xs font-bold transition-all shrink-0 ${
                            activeRightTab === "flashcards"
                              ? "bg-red-800 text-white shadow-md"
                              : "bg-slate-905 text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          🎴 Thẻ nhớ
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveRightTab("quizzes")}
                          className={`px-3 py-1.5 rounded-lg text-2xs font-bold transition-all shrink-0 ${
                            activeRightTab === "quizzes"
                              ? "bg-emerald-600 text-white shadow-md"
                              : "bg-slate-905 text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          📝 Quiz bài tập
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveRightTab("podcast")}
                          className={`px-3 py-1.5 rounded-lg text-2xs font-bold transition-all shrink-0 ${
                            activeRightTab === "podcast"
                              ? "bg-purple-605 text-purple-200 bg-purple-950/40 border border-purple-800/50"
                              : "bg-slate-905 text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          🎙️ Podcast
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveRightTab("pdf")}
                          className={`px-3 py-1.5 rounded-lg text-2xs font-bold transition-all shrink-0 ${
                            activeRightTab === "pdf"
                              ? "bg-blue-600 text-white shadow-md"
                              : "bg-slate-905 text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          📦 Tài liệu PDF
                        </button>
                      </div>

                      {/* Tab Panels */}
                      <div className="flex-1 overflow-y-auto pr-1 min-h-0">
                        {activeRightTab === "warmups" && (
                          <NodeWarmupTab
                            warmups={warmups}
                            handleDeleteWarmup={handleDeleteWarmup}
                            handleAddWarmup={handleAddWarmup}
                            warmupForm={warmupForm}
                            setWarmupForm={setWarmupForm}
                          />
                        )}

                        {activeRightTab === "framework" && (
                          <FrameworkAdminPanel form={form} setForm={setForm} />
                        )}

                        {activeRightTab === "flashcards" && (
                          <NodeFlashcardTab
                            flashcards={flashcards}
                            openCreateFc={openCreateFc}
                            openEditFc={openEditFc}
                            handleFcDelete={handleFcDelete}
                            parseFlashcardQuestion={parseFlashcardQuestion}
                            handleJsonUpload={handleJsonUpload}
                            jsonText={jsonText}
                            setJsonText={setJsonText}
                            handleBulkImport={handleBulkImport}
                            importingFlashcards={importingFlashcards}
                          />
                        )}

                        {activeRightTab === "quizzes" && (
                          <NodeQuizTab
                            nodeQuizzes={nodeQuizzes}
                            openCreateQuiz={openCreateQuiz}
                            openEditQuiz={openEditQuiz}
                            handleQuizDelete={handleQuizDelete}
                          />
                        )}

                        {activeRightTab === "podcast" && (
                          <NodePodcastTab
                            nodePodcast={nodePodcast}
                            podcastScript={podcastScript}
                            setPodcastScript={setPodcastScript}
                            podcastAudioUrl={podcastAudioUrl}
                            setPodcastAudioUrl={setPodcastAudioUrl}
                            podcastTranscript={podcastTranscript}
                            setPodcastTranscript={setPodcastTranscript}
                            synthesizingPodcast={synthesizingPodcast}
                            handlePodcastDelete={handlePodcastDelete}
                            handlePodcastSynthesize={handlePodcastSynthesize}
                            handlePodcastSubmit={handlePodcastSubmit}
                          />
                        )}

                        {activeRightTab === "pdf" && (
                          <NodeDocumentTab
                            nodeDocuments={nodeDocuments}
                            handleDocumentDelete={handleDocumentDelete}
                            handlePdfUploadSubmit={handlePdfUploadSubmit}
                            pdfFile={pdfFile}
                            setPdfFile={setPdfFile}
                            uploadingPdf={uploadingPdf}
                          />
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. Flashcard Edit/Create Sub-modal */}
        {fcModal.isOpen && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-slate-950 rounded-2xl border border-slate-800 w-full max-w-md shadow-2xl overflow-hidden p-6 space-y-6 text-left">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-100">
                  {fcModal.type === "create"
                    ? "Tạo Thẻ nhớ mới"
                    : "Chỉnh sửa Thẻ nhớ"}
                </h3>
                <button
                  onClick={() =>
                    setFcModal({
                      isOpen: false,
                      type: "create",
                      flashcard: null,
                    })
                  }
                  className="text-slate-500 hover:text-slate-300"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <form onSubmit={handleFcSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Nhãn chủ đề (Tag)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: Vật chất, Lịch sử"
                      value={fcForm.tag}
                      onChange={(e) =>
                        setFcForm({ ...fcForm, tag: e.target.value })
                      }
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-105 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Phong cách thẻ (Style)
                    </label>
                    <select
                      value={fcForm.style}
                      onChange={(e) =>
                        setFcForm({ ...fcForm, style: e.target.value })
                      }
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-105 focus:outline-none"
                    >
                      <option value="normal">
                        Normal (Thẻ ghi nhớ ôn tập)
                      </option>
                      <option value="mcq">
                        MCQ Quiz (Sử dụng cho trắc nghiệm bài học)
                      </option>
                    </select>
                  </div>
                </div>

                {fcForm.style === "normal" ? (
                  <>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Câu hỏi (Q)
                      </label>
                      <textarea
                        rows="3"
                        required
                        placeholder="Nội dung câu hỏi ôn tập..."
                        value={fcForm.question}
                        onChange={(e) =>
                          setFcForm({ ...fcForm, question: e.target.value })
                        }
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-105 resize-none focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Đáp án (A)
                      </label>
                      <textarea
                        rows="3"
                        required
                        placeholder="Nội dung đáp án học thuật..."
                        value={fcForm.answer}
                        onChange={(e) =>
                          setFcForm({ ...fcForm, answer: e.target.value })
                        }
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-105 resize-none focus:outline-none"
                      />
                    </div>
                  </>
                ) : (
                  <div className="space-y-3 p-3 bg-indigo-950/20 border border-indigo-900/30 rounded-xl">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-indigo-400 block">
                        Câu hỏi trắc nghiệm
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Nêu luận điểm, sự kiện chính văn..."
                        value={fcForm.questionText}
                        onChange={(e) =>
                          setFcForm({ ...fcForm, questionText: e.target.value })
                        }
                        className="w-full bg-slate-950 border border-slate-850 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 font-bold block">
                          Phương án A
                        </label>
                        <input
                          type="text"
                          required
                          value={fcForm.optA}
                          onChange={(e) =>
                            setFcForm({ ...fcForm, optA: e.target.value })
                          }
                          className="w-full bg-slate-955 border border-slate-850 rounded px-2 py-1 text-slate-100 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 font-bold block">
                          Phương án B
                        </label>
                        <input
                          type="text"
                          required
                          value={fcForm.optB}
                          onChange={(e) =>
                            setFcForm({ ...fcForm, optB: e.target.value })
                          }
                          className="w-full bg-slate-955 border border-slate-850 rounded px-2 py-1 text-slate-100 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 font-bold block">
                          Phương án C
                        </label>
                        <input
                          type="text"
                          required
                          value={fcForm.optC}
                          onChange={(e) =>
                            setFcForm({ ...fcForm, optC: e.target.value })
                          }
                          className="w-full bg-slate-955 border border-slate-850 rounded px-2 py-1 text-slate-100 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 font-bold block">
                          Phương án D
                        </label>
                        <input
                          type="text"
                          required
                          value={fcForm.optD}
                          onChange={(e) =>
                            setFcForm({ ...fcForm, optD: e.target.value })
                          }
                          className="w-full bg-slate-955 border border-slate-850 rounded px-2 py-1 text-slate-100 focus:outline-none"
                        />
                      </div>
                    </div>
                    <div className="space-y-1 w-1/2 mt-1">
                      <label className="text-[10px] text-indigo-400 font-bold block">
                        Lựa chọn đúng (Đáp án)
                      </label>
                      <select
                        value={fcForm.correctOpt}
                        onChange={(e) =>
                          setFcForm({ ...fcForm, correctOpt: e.target.value })
                        }
                        className="w-full bg-slate-955 border border-slate-850 rounded px-2.5 py-1 text-slate-100 text-xs focus:outline-none"
                      >
                        <option value="A">Phương án A</option>
                        <option value="B">Phương án B</option>
                        <option value="C">Phương án C</option>
                        <option value="D">Phương án D</option>
                      </select>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-red-800 hover:bg-red-900 text-white font-bold py-2.5 rounded-xl transition-all shadow"
                >
                  {fcModal.type === "create" ? "Tạo thẻ nhớ" : "Lưu thay đổi"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* 4. Quiz Edit/Create Sub-modal */}
        {quizModal.isOpen && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-slate-950 rounded-2xl border border-slate-800 w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-2xl p-6 space-y-6 text-left">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-100">
                  {quizModal.type === "create"
                    ? "Tạo bộ Quiz mới"
                    : "Chỉnh sửa bộ đề"}
                </h3>
                <button
                  onClick={() =>
                    setQuizModal({ isOpen: false, type: "create", quiz: null })
                  }
                  className="text-slate-500 hover:text-slate-305"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <form onSubmit={handleQuizSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Dạng học tập / Quiz
                    </label>
                    <select
                      value={quizForm.type}
                      onChange={(e) =>
                        setQuizForm({ ...quizForm, type: e.target.value })
                      }
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none"
                    >
                      <option value="matching">
                        Trò chơi Ghép Cặp (Matching Game)
                      </option>
                      <option value="mcq">Trắc nghiệm tổng hợp (MCQ)</option>
                      <option value="essay">Tự luận biện chứng (Essay)</option>
                      <option value="image">
                        Đoán ảnh triết học (Image Guess)
                      </option>
                      <option value="analysis">
                        Phân tích học thuyết (Analysis)
                      </option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Tiêu đề Bộ đề
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: Ghép cặp phạm trù lượng - chất"
                      value={quizForm.title}
                      onChange={(e) =>
                        setQuizForm({ ...quizForm, title: e.target.value })
                      }
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-650 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Mô tả hướng dẫn bài làm
                  </label>
                  <textarea
                    rows="2"
                    placeholder="Ghi chú hướng dẫn cho học viên..."
                    value={quizForm.description}
                    onChange={(e) =>
                      setQuizForm({ ...quizForm, description: e.target.value })
                    }
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-650 resize-none focus:outline-none"
                  />
                </div>

                <div className="border-t border-slate-800 pt-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider">
                      Cấu trúc bộ câu hỏi
                    </h4>
                    {quizForm.type === "matching" && (
                      <button
                        type="button"
                        onClick={() =>
                          setQuizMatchingPairs([
                            ...quizMatchingPairs,
                            { left: "", right: "" },
                          ])
                        }
                        className="bg-slate-900 hover:bg-slate-850 border border-slate-800 px-3 py-1 rounded text-2xs text-slate-300 flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          add
                        </span>{" "}
                        Thêm cặp thẻ
                      </button>
                    )}
                    {(quizForm.type === "mcq" ||
                      quizForm.type === "image" ||
                      quizForm.type === "analysis") && (
                      <button
                        type="button"
                        onClick={() =>
                          setQuizMcqQuestions([
                            ...quizMcqQuestions,
                            {
                              question: "",
                              options: ["", "", "", ""],
                              correctIndex: 0,
                            },
                          ])
                        }
                        className="bg-slate-900 hover:bg-slate-850 border border-slate-800 px-3 py-1 rounded text-2xs text-slate-300 flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          add
                        </span>{" "}
                        Thêm câu hỏi
                      </button>
                    )}
                    {quizForm.type === "essay" && (
                      <button
                        type="button"
                        onClick={() =>
                          setQuizEssayPrompts([
                            ...quizEssayPrompts,
                            { question: "", sampleAnswer: "" },
                          ])
                        }
                        className="bg-slate-900 hover:bg-slate-850 border border-slate-800 px-3 py-1 rounded text-2xs text-slate-300 flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          add
                        </span>{" "}
                        Thêm tự luận
                      </button>
                    )}
                  </div>

                  {/* MCQ Structure */}
                  {(quizForm.type === "mcq" ||
                    quizForm.type === "image" ||
                    quizForm.type === "analysis") && (
                    <div className="space-y-4">
                      {quizMcqQuestions.map((mcq, qIdx) => (
                        <div
                          key={qIdx}
                          className="bg-slate-900/40 p-4 rounded-xl border border-slate-800 space-y-3 text-xs"
                        >
                          <div className="flex justify-between items-start gap-3">
                            <div className="flex-grow">
                              <label className="text-[10px] text-slate-400 font-bold block mb-1">
                                Câu hỏi {qIdx + 1}
                              </label>
                              <input
                                type="text"
                                required
                                placeholder="Nội dung câu hỏi..."
                                value={mcq.question}
                                onChange={(e) => {
                                  const updated = [...quizMcqQuestions];
                                  updated[qIdx].question = e.target.value;
                                  setQuizMcqQuestions(updated);
                                }}
                                className="w-full bg-slate-955 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-100"
                              />
                            </div>
                            {quizMcqQuestions.length > 1 && (
                              <button
                                type="button"
                                onClick={() =>
                                  setQuizMcqQuestions(
                                    quizMcqQuestions.filter(
                                      (_, i) => i !== qIdx,
                                    ),
                                  )
                                }
                                className="text-red-500 hover:text-red-400 mt-5"
                              >
                                <span className="material-symbols-outlined text-sm">
                                  delete
                                </span>
                              </button>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            {mcq.options.map((opt, oIdx) => (
                              <div
                                key={oIdx}
                                className="flex gap-2 items-center"
                              >
                                <span className="text-xs text-slate-500 font-bold">
                                  {String.fromCharCode(65 + oIdx)}.
                                </span>
                                <input
                                  type="text"
                                  required
                                  value={opt}
                                  onChange={(e) => {
                                    const updated = [...quizMcqQuestions];
                                    updated[qIdx].options[oIdx] =
                                      e.target.value;
                                    setQuizMcqQuestions(updated);
                                  }}
                                  className="w-full bg-slate-955 border border-slate-850 rounded px-2.5 py-1 text-slate-100"
                                />
                              </div>
                            ))}
                          </div>
                          <div className="w-1/2">
                            <label className="text-[10px] text-slate-400 font-bold block mb-1">
                              Đáp án đúng
                            </label>
                            <select
                              value={mcq.correctIndex}
                              onChange={(e) => {
                                const updated = [...quizMcqQuestions];
                                updated[qIdx].correctIndex = Number(
                                  e.target.value,
                                );
                                setQuizMcqQuestions(updated);
                              }}
                              className="w-full bg-slate-955 border border-slate-850 rounded px-2.5 py-1 text-slate-100 focus:outline-none"
                            >
                              <option value="0">Đáp án A</option>
                              <option value="1">Đáp án B</option>
                              <option value="2">Đáp án C</option>
                              <option value="3">Đáp án D</option>
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Matching Structure */}
                  {quizForm.type === "matching" && (
                    <div className="space-y-3">
                      {quizMatchingPairs.map((pair, index) => (
                        <div
                          key={index}
                          className="flex gap-3 items-start bg-slate-900/40 p-3 rounded-xl border border-slate-800 text-xs"
                        >
                          <div className="flex-1 space-y-2">
                            <input
                              type="text"
                              required
                              placeholder="Vế trái"
                              value={pair.left}
                              onChange={(e) => {
                                const updated = [...quizMatchingPairs];
                                updated[index].left = e.target.value;
                                setQuizMatchingPairs(updated);
                              }}
                              className="w-full bg-slate-955 border border-slate-800 rounded px-2 py-1 text-slate-100 focus:outline-none"
                            />
                            <textarea
                              rows="2"
                              required
                              placeholder="Vế phải tương ứng..."
                              value={pair.right}
                              onChange={(e) => {
                                const updated = [...quizMatchingPairs];
                                updated[index].right = e.target.value;
                                setQuizMatchingPairs(updated);
                              }}
                              className="w-full bg-slate-955 border border-slate-800 rounded px-2 py-1 text-slate-100 resize-none focus:outline-none"
                            />
                          </div>
                          {quizMatchingPairs.length > 1 && (
                            <button
                              type="button"
                              onClick={() =>
                                setQuizMatchingPairs(
                                  quizMatchingPairs.filter(
                                    (_, i) => i !== index,
                                  ),
                                )
                              }
                              className="text-red-500 hover:text-red-400 p-1"
                            >
                              <span className="material-symbols-outlined text-sm">
                                delete
                              </span>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Essay Structure */}
                  {quizForm.type === "essay" && (
                    <div className="space-y-3">
                      {quizEssayPrompts.map((essay, index) => (
                        <div
                          key={index}
                          className="flex gap-3 items-start bg-slate-900/40 p-3 rounded-xl border border-slate-800 text-xs"
                        >
                          <div className="flex-1 space-y-2">
                            <input
                              type="text"
                              required
                              placeholder="Đề bài câu hỏi tự luận..."
                              value={essay.question}
                              onChange={(e) => {
                                const updated = [...quizEssayPrompts];
                                updated[index].question = e.target.value;
                                setQuizEssayPrompts(updated);
                              }}
                              className="w-full bg-slate-955 border border-slate-800 rounded px-2 py-1 text-slate-100 focus:outline-none"
                            />
                            <textarea
                              rows="2"
                              required
                              placeholder="Gợi ý đáp án tham khảo..."
                              value={essay.sampleAnswer}
                              onChange={(e) => {
                                const updated = [...quizEssayPrompts];
                                updated[index].sampleAnswer = e.target.value;
                                setQuizEssayPrompts(updated);
                              }}
                              className="w-full bg-slate-955 border border-slate-800 rounded px-2 py-1 text-slate-100 resize-none focus:outline-none"
                            />
                          </div>
                          {quizEssayPrompts.length > 1 && (
                            <button
                              type="button"
                              onClick={() =>
                                setQuizEssayPrompts(
                                  quizEssayPrompts.filter(
                                    (_, i) => i !== index,
                                  ),
                                )
                              }
                              className="text-red-500 hover:text-red-400 p-1"
                            >
                              <span className="material-symbols-outlined text-sm">
                                delete
                              </span>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl transition-all shadow"
                >
                  {quizModal.type === "create" ? "Tạo Quiz" : "Lưu thay đổi"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminPageShell>
  );
}

// ==================== LESSON FLOW ADMIN PANEL ====================
function FrameworkAdminPanel({ form, setForm }) {
  const [assetUploading, setAssetUploading] = useState(false);
  const [videoUploading, setVideoUploading] = useState(false);
  const [assetError, setAssetError] = useState("");
  const [lastAsset, setLastAsset] = useState(null);
  const [videoUrlInput, setVideoUrlInput] = useState("");

  const loadTemplate = () => {
    const tpl = [
      {
        id: "intro-dialogue",
        type: "dialogue",
        title: "Dẫn nhập",
        config: {
          lines: [
            {
              who: "guide",
              text: "Xin chào, hôm nay chúng ta sẽ khám phá một khái niệm triết học trọng tâm.",
            },
          ],
        },
        completionRule: { type: "viewed" },
      },
      {
        id: "main-reading",
        type: "markdown",
        title: "Nội dung chính",
        config: {
          content: form.originalText || "Nội dung bài học đang được cập nhật.",
        },
        completionRule: { type: "viewed" },
      },
      {
        id: "checkpoint-mcq",
        type: "mcq",
        title: "Kiểm tra nhanh",
        config: {
          question: "Chọn nhận định đúng nhất về nội dung vừa học.",
          options: [
            { id: "a", text: "Nhận định chưa chính xác.", isCorrect: false },
            { id: "b", text: "Nhận định đúng.", isCorrect: true },
          ],
        },
        completionRule: { type: "correct" },
      },
      {
        id: "knowledge-piece",
        type: "knowledge_piece",
        title: "Mảnh ghép kiến thức",
        config: {
          pieceId: "main-piece",
          label: "Mảnh ghép trọng tâm",
          shortLabel: "Trọng tâm",
          summary: form.quickTake || "Đúc kết kiến thức quan trọng của bài.",
          takeaways: [
            form.summary || "Nắm được luận điểm trung tâm của bài học.",
          ],
          icon: "extension",
        },
        completionRule: { type: "viewed" },
      },
      {
        id: "final-summary",
        type: "final_summary",
        title: "Đúc kết",
        config: {
          message: form.quickTake || "Bạn đã hoàn thành bài học.",
          keyTakeaways: [
            form.summary || "Nắm được nội dung trọng tâm của bài học.",
          ],
          rewards: { xp: 80, badge: "Hoàn thành bài học" },
        },
        completionRule: { type: "viewed" },
      },
    ];

    setForm((prev) => ({ ...prev, lessonFlow: JSON.stringify(tpl, null, 2) }));
  };

  const formatJson = () => {
    const parsed = JSON.parse(form.lessonFlow || "[]");
    setForm((prev) => ({
      ...prev,
      lessonFlow: JSON.stringify(parsed, null, 2),
    }));
  };

  const appendImageAssetComponent = (asset) => {
    const parsed = JSON.parse(form.lessonFlow || "[]");
    const nextFlow = Array.isArray(parsed) ? parsed : [];
    nextFlow.push({
      id: `image-${Date.now()}`,
      type: "media",
      title: asset.fileName || "Ảnh minh họa",
      config: {
        mediaType: "image",
        url: asset.url,
        title: asset.fileName || "Ảnh minh họa",
      },
      completionRule: { type: "viewed" },
    });
    setForm((prev) => ({
      ...prev,
      lessonFlow: JSON.stringify(nextFlow, null, 2),
    }));
  };

  const appendVideoAssetComponent = (asset) => {
    const parsed = JSON.parse(form.lessonFlow || "[]");
    const nextFlow = Array.isArray(parsed) ? parsed : [];
    nextFlow.push({
      id: `video-${Date.now()}`,
      type: "media",
      title: asset.title || asset.fileName || "Video bài học",
      config: {
        mediaType: "video",
        url: asset.url,
        title: asset.title || asset.fileName || "Video bài học",
        subtitle: asset.provider === "youtube" ? "YouTube" : "Video",
      },
      completionRule: { type: "viewed" },
    });
    setForm((prev) => ({
      ...prev,
      lessonFlow: JSON.stringify(nextFlow, null, 2),
    }));
  };

  const uploadLessonImage = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setAssetUploading(true);
    setAssetError("");
    try {
      const asset = await api.files.uploadLessonAsset(file);
      setLastAsset(asset);
      appendImageAssetComponent(asset);
    } catch (err) {
      setAssetError(err.message);
    } finally {
      setAssetUploading(false);
      event.target.value = "";
    }
  };

  const uploadLessonVideo = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setVideoUploading(true);
    setAssetError("");
    try {
      const asset = await api.files.uploadLessonVideo(file, form.title);
      setLastAsset(asset);
      appendVideoAssetComponent(asset);
    } catch (err) {
      setAssetError(err.message);
    } finally {
      setVideoUploading(false);
      event.target.value = "";
    }
  };

  const storeVideoUrl = async () => {
    if (!videoUrlInput.trim()) return;
    setVideoUploading(true);
    setAssetError("");
    try {
      const asset = await api.files.storeLessonVideoUrl(
        videoUrlInput.trim(),
        form.title,
      );
      setLastAsset(asset);
      appendVideoAssetComponent(asset);
      setVideoUrlInput("");
    } catch (err) {
      setAssetError(err.message);
    } finally {
      setVideoUploading(false);
    }
  };

  return (
    <div className="space-y-4 text-left text-xs">
      <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 space-y-2">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <span className="font-bold text-indigo-400 uppercase block">
            Lesson Flow JSON
          </span>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={loadTemplate}
              className="text-[10px] bg-slate-950 border border-slate-800 hover:bg-slate-900 text-indigo-400 px-2 py-0.5 rounded"
            >
              Nạp mẫu
            </button>
            <button
              type="button"
              onClick={formatJson}
              className="text-[10px] bg-slate-950 border border-slate-800 hover:bg-slate-900 text-emerald-400 px-2 py-0.5 rounded"
            >
              Format
            </button>
          </div>
        </div>
        <p className="text-slate-500 leading-relaxed">
          Mỗi phần tử cần có `id`, `type`, `config`. Các type hiện hỗ trợ:
          component_group, dialogue, media, markdown, target_matching,
          map_target_matching, category_sorting, mindmap_reveal, mcq,
          quiz_sequence, multi_select, matching_columns, true_false,
          sequence_sorting, chain_sorting, knowledge_piece,
          progression_spiral, timeline_explorer, hotspot_gallery,
          final_summary.
        </p>
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 space-y-2">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Upload ảnh component
              </p>
              <p className="text-[11px] text-slate-500">
                Ảnh sẽ được upload vào bucket lesson-assets và tự thêm vào flow
                dưới dạng media image.
              </p>
            </div>
            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-[11px] font-bold text-slate-200 hover:border-indigo-500 hover:text-indigo-300">
              <span className="material-symbols-outlined text-sm">image</span>
              {assetUploading ? "Đang upload..." : "Chọn ảnh"}
              <input
                type="file"
                accept="image/*"
                disabled={assetUploading}
                onChange={uploadLessonImage}
                className="hidden"
              />
            </label>
          </div>
          {lastAsset?.url && (
            <p className="break-all text-[11px] text-emerald-400">
              Đã thêm ảnh: {lastAsset.url}
            </p>
          )}
          {assetError && (
            <p className="break-all text-[11px] text-red-400">
              Upload thất bại: {assetError}
            </p>
          )}
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 space-y-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Video component
              </p>
              <p className="text-[11px] text-slate-500">
                Chọn video từ máy để backend upload lên YouTube, hoặc nhập URL
                YouTube/external để lưu metadata vào Supabase.
              </p>
            </div>
            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-[11px] font-bold text-slate-200 hover:border-red-500 hover:text-red-300">
              <span className="material-symbols-outlined text-sm">
                video_library
              </span>
              {videoUploading ? "Đang xử lý..." : "Upload video"}
              <input
                type="file"
                accept="video/*"
                disabled={videoUploading}
                onChange={uploadLessonVideo}
                className="hidden"
              />
            </label>
          </div>
          <div className="flex gap-2">
            <input
              type="url"
              value={videoUrlInput}
              onChange={(event) => setVideoUrlInput(event.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="min-w-0 flex-1 rounded-lg border border-slate-800 bg-slate-955 px-2.5 py-1.5 text-[11px] text-slate-100 outline-none focus:border-indigo-500"
            />
            <button
              type="button"
              onClick={storeVideoUrl}
              disabled={videoUploading || !videoUrlInput.trim()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-[11px] font-bold text-slate-200 hover:border-indigo-500 hover:text-indigo-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-sm">
                add_link
              </span>
              Thêm URL
            </button>
          </div>
        </div>
        <textarea
          rows="22"
          value={form.lessonFlow}
          onChange={(e) => setForm({ ...form, lessonFlow: e.target.value })}
          className="w-full bg-slate-955 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 font-mono resize-y focus:outline-none"
        />
      </div>
    </div>
  );
}

// ==================== COLLAPSIBLE HIERARCHICAL TREE VIEW ====================
function HierarchyTreeView({
  chapters,
  nodes,
  courses,
  openEdit,
  handleDelete,
  openCreateChapter,
  openEditChapter,
  handleChapterDelete,
  openCreateNode,
}) {
  const [expandedChaps, setExpandedChaps] = useState({});

  const toggleExpand = (id) => {
    setExpandedChaps((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const topChapters = useMemo(() => {
    return chapters
      .filter((c) => !c.parentChapterId)
      .sort((a, b) => a.orderIndex - b.orderIndex);
  }, [chapters]);

  const getSubChapters = (parentChapterId) => {
    return chapters
      .filter((c) => c.parentChapterId === parentChapterId)
      .sort((a, b) => a.orderIndex - b.orderIndex);
  };

  const getChapterNodes = (chapterId) => {
    return nodes
      .filter((n) => n.chapterId === chapterId)
      .sort((a, b) => a.orderIndex - b.orderIndex);
  };

  return (
    <div className="bg-slate-955 rounded-2xl border border-slate-800 shadow-xl overflow-hidden p-6 space-y-6 text-left">
      <h3 className="font-bold text-lg text-slate-100 border-b border-slate-800 pb-3 flex items-center gap-2">
        <span className="material-symbols-outlined text-red-500">
          account_tree
        </span>
        Cấu trúc giáo trình phân cấp
      </h3>

      {courses.map((course) => {
        const courseChapters = topChapters.filter(
          (c) => c.courseId === course.id,
        );
        return (
          <div
            key={course.id}
            className="space-y-3 border-b border-slate-800/40 pb-5 last:border-b-0 last:pb-0"
          >
            <div className="flex justify-between items-center bg-slate-900/30 px-4 py-2.5 rounded-xl border border-slate-850">
              <div className="flex items-center gap-2 font-bold text-slate-200 text-sm">
                <span className="material-symbols-outlined text-red-500 text-sm">
                  auto_awesome
                </span>
                <span>{course.title}</span>
              </div>
              <button
                type="button"
                onClick={() => openCreateChapter(course.id)}
                className="bg-slate-950 border border-slate-800 hover:bg-slate-900 text-slate-300 font-bold px-2 py-1 rounded text-2xs flex items-center gap-0.5"
              >
                <span className="material-symbols-outlined text-xs">add</span>{" "}
                Thêm Chương lớn
              </button>
            </div>

            {courseChapters.length === 0 ? (
              <div className="text-center py-4 text-xs text-slate-500 italic">
                Chưa có chương học nào trong khóa học này.
              </div>
            ) : (
              <div className="space-y-3 pl-4">
                {courseChapters.map((tc) => {
                  const subs = getSubChapters(tc.id);
                  const tcNodes = getChapterNodes(tc.id);
                  const isExpanded = !!expandedChaps[tc.id];
                  const hasChildren = subs.length > 0 || tcNodes.length > 0;

                  return (
                    <div
                      key={tc.id}
                      className="border border-slate-850 rounded-xl overflow-hidden transition-all bg-slate-900/10"
                    >
                      {/* Top Chapter Header */}
                      <div className="flex justify-between items-center p-3 bg-slate-900/40">
                        <div
                          onClick={() => hasChildren && toggleExpand(tc.id)}
                          className={`flex items-center gap-2 cursor-pointer hover:text-slate-100 transition-colors ${
                            hasChildren ? "" : "cursor-default"
                          }`}
                        >
                          <span
                            className={`material-symbols-outlined text-sm transition-transform text-red-500 ${
                              isExpanded ? "rotate-90" : ""
                            } ${hasChildren ? "opacity-100" : "opacity-30"}`}
                          >
                            chevron_right
                          </span>
                          <span className="material-symbols-outlined text-red-500 text-sm">
                            folder_open
                          </span>
                          <span className="font-bold text-slate-200 text-xs">
                            {tc.title}
                          </span>
                          <span className="bg-slate-900 text-slate-500 text-[9px] px-1.5 py-0.2 rounded font-normal">
                            Index: {tc.orderIndex}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => openCreateNode(tc.id)}
                            className="bg-red-950/65 text-red-400 hover:bg-red-900 hover:text-white px-2 py-1 rounded text-2xs font-bold transition-all flex items-center gap-0.5"
                          >
                            <span className="material-symbols-outlined text-2xs">
                              add
                            </span>{" "}
                            Thêm bài
                          </button>
                          <button
                            onClick={() => openCreateChapter(course.id, tc.id)}
                            className="bg-slate-900 hover:bg-slate-800 text-slate-300 px-2 py-1 rounded text-2xs font-bold transition-all flex items-center gap-0.5"
                          >
                            <span className="material-symbols-outlined text-2xs">
                              add
                            </span>{" "}
                            Thêm phụ
                          </button>
                          <button
                            onClick={() => openEditChapter(tc)}
                            className="p-1 hover:bg-slate-800 text-blue-400 rounded transition-colors"
                            title="Sửa chương"
                          >
                            <span className="material-symbols-outlined text-sm">
                              edit
                            </span>
                          </button>
                          <button
                            onClick={() => handleChapterDelete(tc.id)}
                            className="p-1 hover:bg-slate-800 text-red-400 rounded transition-colors"
                            title="Xóa chương"
                          >
                            <span className="material-symbols-outlined text-sm">
                              delete
                            </span>
                          </button>
                        </div>
                      </div>

                      {/* Drawer */}
                      {isExpanded && hasChildren && (
                        <div className="p-3 bg-slate-950/40 border-t border-slate-900 pl-6 space-y-3 text-xs">
                          {/* Lessons list */}
                          {tcNodes.length > 0 && (
                            <div className="space-y-1.5">
                              {tcNodes.map((node) => (
                                <LessonNodeItem
                                  key={node.id}
                                  node={node}
                                  openEdit={openEdit}
                                  handleDelete={handleDelete}
                                />
                              ))}
                            </div>
                          )}

                          {/* Sub chapters */}
                          {subs.length > 0 && (
                            <div className="space-y-3">
                              {subs.map((sc) => {
                                const scNodes = getChapterNodes(sc.id);
                                const isSubExpanded = !!expandedChaps[sc.id];
                                const hasSubChildren = scNodes.length > 0;

                                return (
                                  <div
                                    key={sc.id}
                                    className="border border-slate-850/65 rounded-xl overflow-hidden bg-slate-950/20"
                                  >
                                    <div className="flex justify-between items-center p-2.5 bg-slate-900/20">
                                      <div
                                        onClick={() =>
                                          hasSubChildren && toggleExpand(sc.id)
                                        }
                                        className={`flex items-center gap-1.5 cursor-pointer hover:text-slate-100 transition-colors ${
                                          hasSubChildren ? "" : "cursor-default"
                                        }`}
                                      >
                                        <span
                                          className={`material-symbols-outlined text-sm transition-transform text-amber-500 ${
                                            isSubExpanded ? "rotate-90" : ""
                                          } ${hasSubChildren ? "opacity-100" : "opacity-30"}`}
                                        >
                                          chevron_right
                                        </span>
                                        <span className="material-symbols-outlined text-amber-500 text-sm">
                                          folder
                                        </span>
                                        <span className="font-semibold text-slate-350 text-xs">
                                          {sc.title}
                                        </span>
                                        <span className="bg-slate-900 text-slate-500 text-[9px] px-1 py-0.2 rounded font-normal">
                                          Index: {sc.orderIndex}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-1.5">
                                        <button
                                          onClick={() => openCreateNode(sc.id)}
                                          className="bg-red-950/50 hover:bg-red-900 text-red-400 hover:text-white px-2 py-0.5 rounded text-2xs font-bold transition-all flex items-center gap-0.5"
                                        >
                                          <span className="material-symbols-outlined text-2xs">
                                            add
                                          </span>{" "}
                                          Thêm bài
                                        </button>
                                        <button
                                          onClick={() => openEditChapter(sc)}
                                          className="p-1 hover:bg-slate-800 text-blue-400 rounded"
                                        >
                                          <span className="material-symbols-outlined text-sm">
                                            edit
                                          </span>
                                        </button>
                                        <button
                                          onClick={() =>
                                            handleChapterDelete(sc.id)
                                          }
                                          className="p-1 hover:bg-slate-800 text-red-400 rounded"
                                        >
                                          <span className="material-symbols-outlined text-sm">
                                            delete
                                          </span>
                                        </button>
                                      </div>
                                    </div>

                                    {isSubExpanded && hasSubChildren && (
                                      <div className="p-2.5 bg-slate-955/50 border-t border-slate-900/60 pl-6 space-y-1.5">
                                        {scNodes.map((node) => (
                                          <LessonNodeItem
                                            key={node.id}
                                            node={node}
                                            openEdit={openEdit}
                                            handleDelete={handleDelete}
                                          />
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function LessonNodeItem({ node, openEdit, handleDelete }) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-2.5 bg-slate-900/10 rounded-lg border border-slate-900/60 hover:border-slate-800 transition-all gap-2 text-xs">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-slate-500 text-base">
          article
        </span>
        <div>
          <span className="font-bold text-slate-205 text-xs">{node.title}</span>
          <div className="flex items-center gap-2 mt-0.5 text-[10px]">
            <span
              className={`px-1 rounded font-bold uppercase ${
                node.difficulty === "Easy"
                  ? "bg-green-950/30 text-green-400 border border-green-900/30"
                  : node.difficulty === "Hard"
                    ? "bg-red-950/30 text-red-400 border border-red-900/30"
                    : "bg-amber-950/30 text-amber-400 border border-amber-900/30"
              }`}
            >
              {node.difficulty}
            </span>
            <span className="text-slate-500">{node.timeToRead}</span>
            <span className="text-slate-400">
              ({(node._count && node._count.flashcards) || 0} thẻ)
            </span>
            <span
              className={`px-1 rounded border font-bold uppercase ${
                node.contentReady && node.lessonStatus === "published"
                  ? "bg-emerald-950/30 text-emerald-400 border-emerald-900/30"
                  : "bg-slate-950 text-slate-500 border-slate-900"
              }`}
            >
              {node.contentReady && node.lessonStatus === "published"
                ? "published"
                : "draft"}
            </span>
            {node.videoUrl && (
              <span className="text-blue-400 flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[10px]">
                  smart_display
                </span>{" "}
                YouTube
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
        <span className="bg-slate-950 text-slate-500 text-[9px] px-1.5 py-0.5 rounded border border-slate-900 font-bold font-mono">
          Idx: {node.orderIndex}
        </span>
        <button
          onClick={() => openEdit(node)}
          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-blue-400 rounded transition-colors flex items-center gap-0.5 font-semibold text-[10px]"
          title="Sửa & Quản lý các module"
        >
          <span className="material-symbols-outlined text-xs">edit</span>
          Sửa chi tiết
        </button>
        <button
          onClick={() => handleDelete(node.id)}
          className="p-1 hover:bg-slate-800 text-red-500 hover:text-red-400 rounded transition-colors"
          title="Xóa bài"
        >
          <span className="material-symbols-outlined text-sm">delete</span>
        </button>
      </div>
    </div>
  );
}
