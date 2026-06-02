import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding PhiloMind philosophy sanctuary database with Vietnamese Marxist-Leninist Philosophy...');

  const userId = 'default-user-id';

  // 1. Upsert Default User
  const user = await prisma.user.upsert({
    where: { id: userId },
    update: { name: 'Nguyễn Văn A', streak: 5 },
    create: {
      id: userId,
      email: 'student@philomind.local',
      name: 'Nguyễn Văn A',
      streak: 5,
    },
  });
  console.log(`User created or verified: ${user.email} (${user.name})`);

  // Clean up any existing records
  await prisma.warmup.deleteMany({});
  await prisma.debate.deleteMany({});
  await prisma.debateTopic.deleteMany({});

  const existingCourses = await prisma.course.findMany({
    where: { title: 'Triết học Mác – Lênin' }
  });
  if (existingCourses.length > 0) {
    console.log('Found existing course, cleaning up old hierarchy...');
    for (const c of existingCourses) {
      await prisma.flashcardReview.deleteMany({ where: { flashcard: { node: { chapter: { courseId: c.id } } } } });
      await prisma.flashcard.deleteMany({ where: { node: { chapter: { courseId: c.id } } } });
      await prisma.progress.deleteMany({ where: { node: { chapter: { courseId: c.id } } } });
      await prisma.podcast.deleteMany({ where: { node: { chapter: { courseId: c.id } } } });
      await prisma.conceptNode.deleteMany({ where: { chapter: { courseId: c.id } } });
      await prisma.chapter.deleteMany({ where: { courseId: c.id } });
      await prisma.document.deleteMany({ where: { courseId: c.id } });
      await prisma.course.delete({ where: { id: c.id } });
    }
  }

  // 2. Create Course Workspace
  const course = await prisma.course.create({
    data: {
      title: 'Triết học Mác – Lênin',
      description: 'Nghiên cứu các quy luật vận động chung nhất của tự nhiên, xã hội và tư duy thông qua phương pháp luận biện chứng duy vật.',
      userId: user.id,
    },
  });
  console.log(`Course created: "${course.title}" (${course.id})`);

  // Default YouTube Video URL
  const defaultYoutubeUrl = 'https://www.youtube.com/watch?v=Mzg-AdRrjGY';

  // 3. Create Chapters and Concept Nodes
  // Chapter 1
  const chapter1 = await prisma.chapter.create({
    data: {
      title: 'Chương 1: Triết học và vai trò của triết học trong đời sống xã hội',
      orderIndex: 1,
      courseId: course.id,
    },
  });

  const ch1Nodes = [
    {
      title: 'Nguồn gốc của triết học',
      summary: 'Triết học ra đời ở cả phương Đông và phương Tây vào khoảng thế kỷ VIII-VI TCN tại các trung tâm văn minh lớn, bắt nguồn từ hai nguồn gốc chính: Nguồn gốc nhận thức (nhu cầu thấu hiểu thế giới thông qua năng lực tư duy trừu tượng, thay thế tư duy huyền thoại và tôn giáo nguyên thủy bằng hệ thống lý luận lý tính) và Nguồn gốc xã hội (sự phân công lao động xã hội dẫn đến giai cấp xuất hiện, lao động trí óc tách biệt khỏi lao động chân tay và trí thức trở thành tầng lớp có điều kiện hệ thống hóa lý luận triết học).',
      originalText: '1. Khái lược về triết học\n\na) Nguồn gốc của triết học\nTriết học ra đời ở cả phương Đông và phương Tây khoảng thế kỷ VIII-VI trước Công nguyên tại các trung tâm văn minh lớn. Ý thức triết học xuất hiện không ngẫu nhiên mà có nguồn gốc thực tế từ tồn tại xã hội với trình độ nhất định của sự phát triển văn minh, văn hóa và khoa học.\nTriết học có hai nguồn gốc: Nguồn gốc nhận thức (nhu cầu tự nhiên hiểu biết thế giới, vượt qua tư duy huyền thoại) và Nguồn gốc xã hội (xã hội có giai cấp, lao động trí óc tách khỏi lao động chân tay, trí thức trở thành tầng lớp xã hội).\n\n* Nguồn gốc nhận thức\nNhận thức thế giới là nhu cầu tự nhiên của con người. Tư duy huyền thoại và tín ngưỡng nguyên thủy là loại hình triết lý đầu tiên mà con người dùng để giải thích thế giới. Triết học chính là hình thức tư duy lý luận đầu tiên thay thế tư duy huyền thoại và tôn giáo.\nSự phát triển của tư duy trừu tượng và năng lực khái quát trong nhận thức làm cho các quan điểm chung nhất về thế giới hình thành. Triết học ra đời đáp ứng nhu cầu đó của nhận thức - tổng hợp, trừu tượng hóa, khái quát hóa những tri thức riêng lẻ thành những khái niệm, phạm trù, quan điểm, quy luật có tính phổ quát.\n\n* Nguồn gốc xã hội\nTriết học không ra đời trong xã hội mông muội dã man. Nó ra đời khi nền sản xuất xã hội có sự phân công lao động và giai cấp xuất hiện - khi chế độ cộng sản nguyên thủy tan rã, chế độ chiếm hữu nô lệ hình thành, phương thức sản xuất dựa trên tư hữu tư liệu sản xuất được xác định.\nLao động trí óc tách khỏi lao động chân tay, trí thức xuất hiện thành tầng lớp xã hội. Tầng lớp này có điều kiện và nhu cầu nghiên cứu, có năng lực hệ thống hóa các quan niệm thành học thuyết và lý luận. Các nhà thông thái được xã hội công nhận làm các nhà tư tưởng.',
      quickTake: 'Triết học xuất hiện khoảng thế kỷ VIII-VI TCN từ 2 nguồn gốc: Nhận thức (tư duy lý tính trừu tượng thay thế huyền thoại) và Xã hội (phân công lao động trí óc và sự phân chia giai cấp).',
      difficulty: 'Medium',
      timeToRead: '8 min read',
      orderIndex: 1,
      videoUrl: defaultYoutubeUrl
    },
    { title: 'Khái niệm triết học', summary: 'Triết học là hệ thống tri thức lý luận chung nhất của con người về thế giới.', originalText: 'Triết học là hệ thống quan điểm lí luận chung nhất về thế giới, về con người và vị trí của con người trong thế giới đó.', quickTake: 'Hệ thống tri thức lý luận chung nhất về thế giới.', difficulty: 'Easy', timeToRead: '6 min read', orderIndex: 2, videoUrl: defaultYoutubeUrl },
    { title: 'Vấn đề cơ bản của triết học', summary: 'Vấn đề quan hệ giữa vật chất và ý thức là vấn đề cơ bản của mọi hệ thống triết học.', originalText: 'Vấn đề cơ bản lớn của mọi triết học, đặc biệt là triết học hiện đại, là vấn đề quan hệ giữa tư duy và tồn tại, giữa ý thức và vật chất.', quickTake: 'Mối quan hệ biện chứng giữa vật chất và ý thức.', difficulty: 'Hard', timeToRead: '12 min read', orderIndex: 3, videoUrl: defaultYoutubeUrl },
    { title: 'Sự ra đời và phát triển', summary: 'Sự ra đời của triết học Mác - Lênin là một bước ngoặt cách mạng trong lịch sử triết học.', originalText: 'Triết học Mác ra đời vào những năm 40 của thế kỷ XIX, là kết quả tất yếu của sự phát triển kinh tế - xã hội, khoa học tự nhiên và tư tưởng nhân loại.', quickTake: 'Bước ngoặt vĩ đại giải phóng tư tưởng vô sản.', difficulty: 'Medium', timeToRead: '10 min read', orderIndex: 4, videoUrl: defaultYoutubeUrl },
    { title: 'Đối tượng và chức năng', summary: 'Đối tượng nghiên cứu là các quy luật chung nhất và thực hiện chức năng thế giới quan, phương pháp luận.', originalText: 'Triết học Mác - Lênin nghiên cứu những quy luật chung nhất của tự nhiên, xã hội và tư duy, cung cấp thế giới quan duy vật và phương pháp luận biện chứng.', quickTake: 'Cung cấp thế giới quan và phương pháp luận khoa học.', difficulty: 'Easy', timeToRead: '7 min read', orderIndex: 5, videoUrl: defaultYoutubeUrl },
    { title: 'Vai trò trong đời sống xã hội', summary: 'Triết học Mác - Lênin là vũ khí lý luận sắc bén của giai cấp công nhân.', originalText: 'Triết học Mác - Lênin là thế giới quan và phương pháp luận khoa học, cách mạng cho hoạt động thực tiễn cải tạo thế giới của con người.', quickTake: 'Công cụ cải tạo thế giới khách quan.', difficulty: 'Medium', timeToRead: '8 min read', orderIndex: 6, videoUrl: defaultYoutubeUrl }
  ];

  const createdCh1Nodes = [];
  for (const n of ch1Nodes) {
    const node = await prisma.conceptNode.create({
      data: {
        title: n.title,
        summary: n.summary,
        originalText: n.originalText,
        quickTake: n.quickTake,
        difficulty: n.difficulty,
        timeToRead: n.timeToRead,
        videoUrl: n.videoUrl,
        orderIndex: n.orderIndex,
        chapterId: chapter1.id,
      }
    });
    createdCh1Nodes.push(node);
    await prisma.progress.create({
      data: { userId: user.id, nodeId: node.id, status: n.orderIndex === 1 ? 'available' : 'locked' }
    });
  }

  // Chapter 2
  const chapter2 = await prisma.chapter.create({
    data: {
      title: 'Chương 2: Chủ nghĩa duy vật biện chứng',
      orderIndex: 2,
      courseId: course.id,
    },
  });

  const ch2Nodes = [
    { title: 'Phạm trù vật chất', summary: 'Vật chất là thực tại khách quan tồn tại độc lập với ý thức và được đem lại cho con người trong cảm giác.', originalText: 'Vật chất là một phạm trù triết học dùng để chỉ thực tại khách quan được đem lại cho con người trong cảm giác, được cảm giác của chúng ta chép lại, chụp lại, phản ánh, và tồn tại không lệ thuộc vào cảm giác. - V.I. Lênin', quickTake: 'Vật chất là thực tại khách quan tồn tại độc lập với ý thức.', difficulty: 'Hard', timeToRead: '15 min read', orderIndex: 1, videoUrl: defaultYoutubeUrl },
    { title: 'Phương thức tồn tại của vật chất', summary: 'Vận động là phương thức tồn tại của vật chất, không gian và thời gian là những hình thức tồn tại của nó.', originalText: 'Vận động là thuộc tính cố hữu của vật chất, là phương thức tồn tại của vật chất. Không có vật chất không vận động cũng như không có vận động ngoài vật chất.', quickTake: 'Vận động là phương thức tồn tại tuyệt đối của vật chất.', difficulty: 'Medium', timeToRead: '10 min read', orderIndex: 2, videoUrl: defaultYoutubeUrl },
    { title: 'Nguồn gốc và bản chất của ý thức', summary: 'Ý thức là sự phản ánh sáng tạo thực tại khách quan vào bộ não người.', originalText: 'Ý thức có nguồn gốc tự nhiên (bộ não người và sự tác động của thế giới bên ngoài) và nguồn gốc xã hội (lao động và ngôn ngữ). Bản chất của ý thức là hình ảnh chủ quan của thế giới khách quan.', quickTake: 'Ý thức là sự phản ánh năng động, sáng tạo bộ não người.', difficulty: 'Hard', timeToRead: '12 min read', orderIndex: 3, videoUrl: defaultYoutubeUrl },
    { title: 'Mối quan hệ vật chất – ý thức', summary: 'Vật chất quyết định ý thức, nhưng ý thức có tính độc lập tương đối và tác động trở lại mạnh mẽ.', originalText: 'Vật chất quyết định ý thức về nguồn gốc, nội dung và sự biến đổi. Ngược lại, ý thức tác động trở lại vật chất thông qua hoạt động thực tiễn của con người.', quickTake: 'Vật chất quyết định ý thức; ý thức tác động trở lại qua thực tiễn.', difficulty: 'Hard', timeToRead: '11 min read', orderIndex: 4, videoUrl: defaultYoutubeUrl },
    { title: 'Hai nguyên lý cơ bản', summary: 'Nguyên lý về mối liên hệ phổ biến và nguyên lý về sự phát triển của phép biện chứng.', originalText: 'Mọi sự vật, hiện tượng đều tồn tại trong mối liên hệ phổ biến, ràng buộc lẫn nhau và luôn luôn trong quá trình vận động, phát triển không ngừng từ thấp đến cao.', quickTake: 'Mọi sự vật liên hệ phổ biến và luôn phát triển đi lên.', difficulty: 'Medium', timeToRead: '9 min read', orderIndex: 5, videoUrl: defaultYoutubeUrl },
    { title: 'Các cặp phạm trù', summary: 'Sáu cặp phạm trù cơ bản phản ánh các mối liên hệ biện chứng phổ biến nhất.', originalText: 'Các cặp phạm trù: Cái riêng và cái chung; Nguyên nhân và kết quả; Tất nhiên và ngẫu nhiên; Nội dung và hình thức; Bản chất và hiện tượng; Khả năng và hiện thực.', quickTake: 'Các cặp quan hệ đối lập thống nhất phản ánh hiện thực.', difficulty: 'Hard', timeToRead: '14 min read', orderIndex: 6, videoUrl: defaultYoutubeUrl },
    { title: 'Ba quy luật cơ bản', summary: 'Quy luật Lượng - Chất, quy luật Mâu thuẫn và quy luật Phủ định của phủ định.', originalText: 'Quy luật lượng chất chỉ ra cách thức phát triển. Quy luật mâu thuẫn chỉ ra nguồn gốc, động lực phát triển. Quy luật phủ định của phủ định chỉ ra khuynh hướng của phát triển.', quickTake: 'Mâu thuẫn là động lực; Lượng đổi dẫn đến Chất đổi; Phát triển đường xoáy ốc.', difficulty: 'Hard', timeToRead: '16 min read', orderIndex: 7, videoUrl: defaultYoutubeUrl },
    { title: 'Bản chất của nhận thức', summary: 'Nhận thức là quá trình phản ánh hiện thực khách quan một cách tích cực, sáng tạo.', originalText: 'Nhận thức đi từ trực quan sinh động đến tư duy trừu tượng, và từ tư duy trừu tượng đến thực tiễn - đó là con đường biện chứng của sự nhận thức chân lý.', quickTake: 'Đi từ nhận thức cảm tính lên nhận thức lý tính rồi đến thực tiễn.', difficulty: 'Medium', timeToRead: '8 min read', orderIndex: 8, videoUrl: defaultYoutubeUrl },
    { title: 'Thực tiễn và vai trò của thực tiễn', summary: 'Thực tiễn là cơ sở, động lực, mục đích của nhận thức và là tiêu chuẩn của chân lý.', originalText: 'Thực tiễn là toàn bộ hoạt động vật chất có mục đích, mang tính lịch sử - xã hội của con người nhằm cải tạo tự nhiên và xã hội.', quickTake: 'Thực tiễn là tiêu chuẩn tối cao để kiểm nghiệm chân lý.', difficulty: 'Medium', timeToRead: '10 min read', orderIndex: 9, videoUrl: defaultYoutubeUrl },
    { title: 'Chân lý', summary: 'Chân lý là những tri thức phù hợp với thực tế khách quan và được thực tiễn kiểm nghiệm.', originalText: 'Chân lý là tri thức có nội dung khách quan, phản ánh đúng đắn hiện thực khách quan và đã được thực tiễn kiểm nghiệm là đúng.', quickTake: 'Tri thức khách quan đã được thực tiễn khẳng định.', difficulty: 'Easy', timeToRead: '7 min read', orderIndex: 10, videoUrl: defaultYoutubeUrl }
  ];

  const createdCh2Nodes = [];
  for (const n of ch2Nodes) {
    const node = await prisma.conceptNode.create({
      data: {
        title: n.title,
        summary: n.summary,
        originalText: n.originalText,
        quickTake: n.quickTake,
        difficulty: n.difficulty,
        timeToRead: n.timeToRead,
        videoUrl: n.videoUrl,
        orderIndex: n.orderIndex,
        chapterId: chapter2.id,
      }
    });
    createdCh2Nodes.push(node);
    await prisma.progress.create({
      data: { userId: user.id, nodeId: node.id, status: 'locked' }
    });
  }

  // Chapter 3
  const chapter3 = await prisma.chapter.create({
    data: {
      title: 'Chương 3: Chủ nghĩa duy vật lịch sử',
      orderIndex: 3,
      courseId: course.id,
    },
  });

  const ch3Nodes = [
    { title: 'Sản xuất vật chất', summary: 'Sản xuất vật chất là cơ sở tồn tại và phát triển của xã hội loài người.', originalText: 'Sản xuất vật chất là hoạt động thực tiễn đặc trưng của con người, quyết định sự sinh tồn và biến đổi của mọi thiết chế xã hội lịch sử.', quickTake: 'Sản xuất vật chất quyết định sự tồn tại xã hội.', difficulty: 'Medium', timeToRead: '8 min read', orderIndex: 1, videoUrl: defaultYoutubeUrl },
    { title: 'Biện chứng LLSX – QHSX', summary: 'Quy luật quan hệ sản xuất phù hợp với trình độ phát triển của lực lượng sản xuất.', originalText: 'Lực lượng sản xuất quyết định sự hình thành và biến đổi của quan hệ sản xuất. Ngược lại, quan hệ sản xuất tác động thúc đẩy hoặc kìm hãm lực lượng sản xuất.', quickTake: 'Lực lượng sản xuất quyết định quan hệ sản xuất.', difficulty: 'Hard', timeToRead: '13 min read', orderIndex: 2, videoUrl: defaultYoutubeUrl },
    { title: 'Cơ sở hạ tầng & kiến trúc thượng tầng', summary: 'Cơ sở hạ tầng quyết định kiến trúc thượng tầng chính trị, pháp lý tương ứng.', originalText: 'Cơ sở hạ tầng là toàn bộ những quan hệ sản xuất hợp thành cơ cấu kinh tế của xã hội. Kiến trúc thượng tầng là hệ thống quan điểm chính trị, pháp quyền... và thiết chế tương ứng.', quickTake: 'Kinh tế quyết định chính trị và hệ tư tưởng xã hội.', difficulty: 'Hard', timeToRead: '12 min read', orderIndex: 3, videoUrl: defaultYoutubeUrl },
    { title: 'Nguồn gốc giai cấp', summary: 'Giai cấp ra đời từ nguồn gốc kinh tế do sự chiếm đoạt tư hữu tư liệu sản xuất.', originalText: 'Sự xuất hiện chế độ tư hữu về tư liệu sản xuất là nguồn gốc trực tiếp phân chia xã hội thành các giai cấp đối kháng.', quickTake: 'Tư hữu tư liệu sản xuất hình thành giai cấp đối kháng.', difficulty: 'Medium', timeToRead: '8 min read', orderIndex: 4, videoUrl: defaultYoutubeUrl },
    { title: 'Đấu tranh giai cấp', summary: 'Đấu tranh giai cấp là động lực phát triển xã hội trong các xã hội có đối kháng giai cấp.', originalText: 'Đấu tranh giai cấp là cuộc đấu tranh giữa các giai cấp có lợi ích căn bản đối lập nhau, đỉnh cao là cách mạng xã hội dẫn đến thay đổi hình thái xã hội.', quickTake: 'Đấu tranh giai cấp là động lực lịch sử của xã hội có bóc lột.', difficulty: 'Medium', timeToRead: '9 min read', orderIndex: 5, videoUrl: defaultYoutubeUrl },
    { title: 'Nhà nước và cách mạng xã hội', summary: 'Nhà nước là công cụ chuyên chính giai cấp, cách mạng xã hội là bước chuyển đổi hình thái.', originalText: 'Nhà nước ra đời do mâu thuẫn giai cấp không thể điều hòa. Cách mạng xã hội là phương thức chuyển từ hình thái kinh tế - xã hội thấp lên cao hơn.', quickTake: 'Nhà nước là công cụ thống trị; Cách mạng lật đổ giai cấp cũ.', difficulty: 'Hard', timeToRead: '14 min read', orderIndex: 6, videoUrl: defaultYoutubeUrl },
    { title: 'Bản chất con người', summary: 'Con người là thực thể sinh học - xã hội, bản chất là tổng hòa các quan hệ xã hội.', originalText: 'Trong tính hiện thực của nó, bản chất con người là tổng hòa những quan hệ xã hội. Con người vừa là sản phẩm vừa là chủ thể của lịch sử. - Karl Marx', quickTake: 'Bản chất con người là tổng hòa các mối quan hệ xã hội.', difficulty: 'Easy', timeToRead: '7 min read', orderIndex: 7, videoUrl: defaultYoutubeUrl },
    { title: 'Quần chúng và lãnh tụ', summary: 'Quần chúng nhân dân là người sáng tạo chân chính ra lịch sử, lãnh tụ định hướng hành động.', originalText: 'Quần chúng nhân dân là lực lượng quyết định sự phát triển của lịch sử. Lãnh tụ là người định hướng, tổ chức và cổ vũ quần chúng thực hiện nhiệm vụ lịch sử.', quickTake: 'Quần chúng quyết định lịch sử; Lãnh tụ hướng dẫn cách mạng.', difficulty: 'Medium', timeToRead: '10 min read', orderIndex: 8, videoUrl: defaultYoutubeUrl }
  ];

  const createdCh3Nodes = [];
  for (const n of ch3Nodes) {
    const node = await prisma.conceptNode.create({
      data: {
        title: n.title,
        summary: n.summary,
        originalText: n.originalText,
        quickTake: n.quickTake,
        difficulty: n.difficulty,
        timeToRead: n.timeToRead,
        videoUrl: n.videoUrl,
        orderIndex: n.orderIndex,
        chapterId: chapter3.id,
      }
    });
    createdCh3Nodes.push(node);
    await prisma.progress.create({
      data: { userId: user.id, nodeId: node.id, status: 'locked' }
    });
  }

  // 4. Seed Specific Podcast for 'Phạm trù vật chất'
  const materialNode = createdCh2Nodes.find(n => n.title === 'Phạm trù vật chất');
  if (materialNode) {
    await prisma.podcast.create({
      data: {
        nodeId: materialNode.id,
        audioUrl: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_5e3edee2cd.mp3',
        transcript: [
          { time: 0, speaker: 'Host', text: 'Xin chào các bạn, chào mừng đến với podcast Triết học Mác – Lênin.' },
          { time: 4, speaker: 'Host', text: 'Trong tập hôm nay, chúng ta cùng đi sâu vào phạm trù vật chất.' },
          { time: 9, speaker: 'Host', text: 'Đây là một trong những phạm trù trung tâm của triết học duy vật biện chứng.' },
          { time: 14, speaker: 'Host', text: 'V.I. Lênin định nghĩa: "Vật chất là một phạm trù triết học",' },
          { time: 19, speaker: 'Host', text: '"dùng để chỉ thực tại khách quan được đem lại cho con người trong cảm giác".' },
          { time: 26, speaker: 'Host', text: 'Định nghĩa này có ba nội dung cơ bản mà chúng ta cần lưu ý.' },
          { time: 31, speaker: 'Host', text: 'Thứ nhất, vật chất là cái tồn tại khách quan, độc lập với ý thức.' },
          { time: 37, speaker: 'Host', text: 'Thứ hai, vật chất là cái mà con người có thể nhận thức được.' },
          { time: 43, speaker: 'Host', text: 'Thứ ba, vật chất không đồng nhất với bất kỳ dạng cụ thể nào của nó.' },
          { time: 50, speaker: 'Host', text: 'Định nghĩa của Lênin đã giải quyết triệt để vấn đề cơ bản của triết học.' },
          { time: 57, speaker: 'Host', text: 'Đồng thời mở đường cho khoa học tiếp tục khám phá các dạng vật chất mới.' },
          { time: 64, speaker: 'Host', text: 'Cảm ơn các bạn đã lắng nghe. Hẹn gặp lại ở tập sau!' }
        ] as any,
      }
    });
    console.log('Seeded Marxist-Leninist Philosophy main podcast episode.');
  }

  // 5. Seed Flashcards
  const ch1QuizCards = [
    {
      question: "Khái niệm nào dùng để chỉ toàn bộ những quan niệm, quan điểm của con người về thế giới, về bản thân con người và vị trí của con người trong thế giới đó?\nA. Nhân sinh quan\nB. Phương pháp luận\nC. Thế giới quan\nD. Ý thức xã hội",
      answer: "C. Thế giới quan"
    },
    {
      question: "Lịch sử phát triển của thế giới quan trải qua những hình thức cơ bản nào theo thứ tự?\nA. Triết học -> Tôn giáo -> Huyền thoại\nB. Huyền thoại -> Tôn giáo -> Triết học\nC. Tôn giáo -> Huyền thoại -> Triết học\nD. Khoa học -> Thần thoại -> Tôn giáo",
      answer: "B. Huyền thoại -> Tôn giáo -> Triết học"
    },
    {
      question: "Hình thái thế giới quan nào coi các lực lượng siêu nhiên, thần linh là đấng tối cao quyết định và chi phối hoàn toàn cuộc sống con người?\nA. Thế giới quan huyền thoại\nB. Thế giới quan tôn giáo\nC. Thế giới quan triết học\nD. Thế giới quan khoa học",
      answer: "B. Thế giới quan tôn giáo"
    },
    {
      question: "Điểm khác biệt cốt lõi giúp thế giới quan triết học vươn lên trình độ cao hơn thế giới quan huyền thoại và tôn giáo là gì?\nA. Triết học chứa nhiều câu chuyện ly kỳ hơn\nB. Triết học bắt buộc người học phải đi tu bái thần\nC. Triết học diễn tả quan niệm dưới dạng hệ thống lý luận, khái niệm và tư duy lý tính\nD. Triết học không quan tâm đến vị trí của con người",
      answer: "C. Triết học diễn tả quan niệm dưới dạng hệ thống lý luận, khái niệm và tư duy lý tính"
    },
    {
      question: "Một sinh viên cho rằng: \"Học giỏi hay không là do số phận sắp đặt, có học bằng mắt cũng không qua môn\". Sinh viên này đang chịu ảnh hưởng của loại thế giới quan nào?\nA. Thế giới quan triết học biện chứng\nB. Thế giới quan khoa học thực nghiệm\nC. Thế giới quan tôn giáo/định mệnh cảm tính\nD. Không thuộc thế giới quan nào cả",
      answer: "C. Thế giới quan tôn giáo/định mệnh cảm tính"
    },
    {
      question: "Vai trò quan trọng nhất của thế giới quan đối với cuộc sống của con người là gì?\nA. Giúp con người dự đoán chính xác kết quả xổ số\nB. Định hướng cho toàn bộ nhận thức, thái độ và hành vi thực tiễn của con người\nC. Thay thế cho các nhu cầu ăn uống, giải trí hằng ngày\nD. Giúp con người không cần phải suy nghĩ khi làm việc",
      answer: "B. Định hướng cho toàn bộ nhận thức, thái độ và hành vi thực tiễn của con người"
    },
    {
      question: "Vì sao nói triết học là hạt nhân lý luận của thế giới quan?\nA. Vì triết học là môn học khó nhất trong các loại thế giới quan\nB. Vì triết học cấu thành từ những tri thức lý luận chung nhất, có tính hệ thống và logic để định hướng các thành phần khác của thế giới quan\nC. Vì chỉ có những người có thế giới quan triết học mới tồn tại được\nD. Vì triết học ra đời trước tất cả các loại thế giới quan khác",
      answer: "B. Vì triết học cấu thành từ những tri thức lý luận chung nhất, có tính hệ thống và logic để định hướng các thành phần khác của thế giới quan"
    },
    {
      question: "Một \"KOL tài chính\" trên mạng phán: \"Muốn giàu sang thì phải cúng sao giải hạn, tiền tài tự khắc bay vào tài khoản\". Đứng dưới góc độ thế giới quan triết học khoa học, lời khuyên này thực chất là gì?\nA. Phương pháp làm giàu tối ưu và ít rủi ro nhất.\nB. Sự đánh tráo bản chất, hướng con người vào thế giới quan tôn giáo/mê tín để trục lợi thay vì thúc đẩy lao động thực tiễn.\nC. Một lý thuyết kinh tế vĩ mô đã được nhà nước công nhận.\nD. Tư duy lý tính độc lập.",
      answer: "B. Sự đánh tráo bản chất, hướng con người vào thế giới quan tôn giáo/mê tín để trục lợi thay vì thúc đẩy lao động thực tiễn."
    },
    {
      question: "Hiện tượng \"thấy bói nói bừa\" nhưng nhiều người vẫn tin sái cổ phản ánh điều gì về mặt thế giới quan?\nA. Trình độ tư duy trừu tượng của xã hội đã đạt tới đỉnh cao.\nB. Con người khi gặp khủng hoảng thực tiễn mà thiếu thế giới quan lý luận khoa học thì dễ bấu víu vào thế giới quan tôn giáo cảm tính.\nC. Các thầy bói đều nắm giữ bản chất lý luận chung nhất của vũ trụ.\nD. Khoa học hiện đại đã hoàn toàn đầu hàng trước tâm linh.",
      answer: "B. Con người khi gặp khủng hoảng thực tiễn mà thiếu thế giới quan lý luận khoa học thì dễ bấu víu vào thế giới quan tôn giáo cảm tính."
    },
    {
      question: "Khi bạn thay đổi thế giới quan của mình từ \"mọi việc do may rủi\" sang \"mọi việc có nguyên nhân - kết quả và cần nỗ lực thực tiễn\", điều gì sẽ thay đổi theo?\nA. Vận may của bạn sẽ tự động tăng lên 100%.\nB. Toàn bộ nguyên tắc sống, thái độ ứng xử và cách bạn hành động đối diện với khó khăn sẽ thay đổi.\nC. Bạn không bao giờ gặp phải thất bại trong đời nữa.\nD. Bạn sẽ trở thành một nhà triết học cổ đại.",
      answer: "B. Toàn bộ nguyên tắc sống, thái độ ứng xử và cách bạn hành động đối diện với khó khăn sẽ thay đổi."
    }
  ];

  const ch2Pairs = [
    { term: 'Vật chất', desc: 'Phạm trù chỉ thực tại khách quan' },
    { term: 'Ý thức', desc: 'Sự phản ánh thế giới khách quan vào bộ não' },
    { term: 'Vận động', desc: 'Phương thức tồn tại của vật chất' },
    { term: 'Không gian – thời gian', desc: 'Hình thức tồn tại của vật chất' },
    { term: 'Phản ánh', desc: 'Thuộc tính chung của mọi dạng vật chất' },
    { term: 'Đứng im', desc: 'Trạng thái vận động trong thăng bằng tương đối' }
  ];

  const ch1FirstNode = createdCh1Nodes[0];
  for (const q of ch1QuizCards) {
    await prisma.flashcard.create({
      data: {
        nodeId: ch1FirstNode.id,
        tag: 'Nguồn gốc của triết học',
        question: q.question,
        answer: q.answer,
      }
    });
  }

  if (materialNode) {
    for (const p of ch2Pairs) {
      await prisma.flashcard.create({
        data: {
          nodeId: materialNode.id,
          tag: 'Duy vật biện chứng',
          question: `Giải nghĩa thuật ngữ triết học: "${p.term}"?`,
          answer: p.desc,
        }
      });
    }
  }

  // ==================== NEW SEED: DEBATE TOPICS / SCENARIOS ====================
  await prisma.debateTopic.createMany({
    data: [
      {
        title: 'Chủ nghĩa Duy vật vs Chủ nghĩa Duy tâm',
        description: 'Cuộc đối đầu kinh điển về bản chất thế giới. Liệu vật chất quyết định ý thức biện chứng hay thế giới chỉ là ảo ảnh cảm giác của ta?',
        initialPrompt: 'Chào đồng chí! Chào mừng đến với đấu trường luận biện duy vật. Giới duy tâm chủ quan khẳng định: "Sự vật chỉ là sự phức hợp của các cảm giác". Đồng chí dùng lập luận duy vật biện chứng nào để bẻ gãy giả định phản khoa học này?',
      },
      {
        title: 'Giá trị thặng dư trong kỷ nguyên số & AI',
        description: 'Robot, thuật toán AI và hệ thống Cloud Automation có trực tiếp tạo ra giá trị thặng dư dôi ra không? Hay sức lao động của lập trình viên vẫn là nguồn sống duy nhất bị bóc lột?',
        initialPrompt: 'Chào đồng chí! Thời đại tự động hóa làm dấy lên luồng ý kiến rằng "AI tạo ra mọi giá trị, học thuyết Marx đã lỗi thời". Theo thế giới quan kinh tế Mác-Lênin, máy móc chỉ chuyển dịch giá trị vào sản phẩm chứ không tạo thêm giá trị thặng dư. Lập trường của đồng chí thế nào?',
      },
      {
        title: 'Ý thức và Trí tuệ nhân tạo (AI)',
        description: 'Trí tuệ nhân tạo (AI) chạy trên linh kiện silicon có thể đạt tới trạng thái có ý thức thật sự hay không? Hay nó chỉ là một dạng phản ánh vật chất cấp cao?',
        initialPrompt: 'Chào đồng chí! Triết học khẳng định ý thức là thuộc tính đặc hữu của bộ não người - một dạng vật chất sống tổ chức siêu việt. Vậy AI bán dẫn có thể có tâm lý, cảm xúc hay ý thức thực sự không? Phân tích biện chứng của đồng chí là gì?',
      }
    ]
  });
  console.log('Seeded standard Debate Topics.');

  // ==================== NEW SEED: MULTIPLE WARMUPS FOR FIRST LESSON ====================
  if (ch1FirstNode) {
    await prisma.warmup.create({
      data: {
        nodeId: ch1FirstNode.id,
        type: 'game',
        title: 'KÍNH LỌC CUỘC ĐỜI (The Worldview Filter)',
        reveal: 'Đồng chí đã hoàn thành xuất sắc trò chơi Kính Lọc Cuộc Đời và sẵn sàng tiếp cận tri thức triết học chính thức!',
      }
    });
  }

  // ==================== WARMUPS FOR 'Phạm trù vật chất' ====================
  if (materialNode) {
    await prisma.warmup.create({
      data: {
        nodeId: materialNode.id,
        type: 'image-guess',
        title: 'Nhìn hình đoán khái niệm',
        image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=900&auto=format&fit=crop',
        blanks: 'V _ T   C H _ T',
        answer: 'vật chất',
        reveal: 'Chính xác! Vật chất chính là phạm trù trung tâm cốt lõi của Chủ nghĩa duy vật biện chứng, tồn tại khách quan và độc lập hoàn toàn với ý thức.',
      }
    });

    await prisma.warmup.create({
      data: {
        nodeId: materialNode.id,
        type: 'story',
        title: 'Mẩu chuyện triết học kinh điển',
        story: 'Heraclitus nói: "Không ai tắm hai lần trên cùng một dòng sông." Vì khi bạn bước xuống dòng nước lần thứ hai, cả dòng nước lẫn chính cơ thể bạn đã thay đổi.',
        question: 'Ý nghĩa biện chứng sâu sắc của mẩu chuyện trên chỉ ra thuộc tính nào của vật chất?',
        options: [
          'Vật chất hoàn toàn đứng im tuyệt đối',
          'Vận động là phương thức tồn tại tuyệt đối, bất biến của vật chất',
          'Dòng sông chỉ là ảo ảnh ý thức'
        ] as any,
        correctIndex: 1,
        reveal: 'Chính xác! Phép biện chứng khẳng định vận động là phương thức tồn tại cố hữu và tuyệt đối của mọi dạng vật chất trong vũ trụ khách quan.',
      }
    });
  }

  console.log('Database seeded successfully with Vietnamese Marxist-Leninist Philosophy courses, topics, warmups, podcasts, and flashcards!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
