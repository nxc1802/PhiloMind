begin;

alter table "Chapter"
  add column if not exists "parentChapterId" text;

alter table "ConceptNode"
  add column if not exists "lessonFlow" jsonb,
  add column if not exists "lessonType" text not null default 'flow',
  add column if not exists "contentReady" boolean not null default false,
  add column if not exists "lessonStatus" text not null default 'draft';

create index if not exists "Chapter_parentChapterId_idx" on "Chapter"("parentChapterId");
create index if not exists "Chapter_courseId_orderIndex_idx" on "Chapter"("courseId", "orderIndex");
create index if not exists "ConceptNode_chapterId_orderIndex_idx" on "ConceptNode"("chapterId", "orderIndex");

insert into storage.buckets (id, name, public)
values
  ('lesson-assets', 'lesson-assets', true),
  ('lesson-videos', 'lesson-videos', true)
on conflict (id) do update set public = excluded.public;

do $$
declare
  student_id text := 'default-user-id';
  course_id text := gen_random_uuid()::text;
  ch1 text := gen_random_uuid()::text;
  ch2 text := gen_random_uuid()::text;
  ch3 text := gen_random_uuid()::text;
  ch1_s1 text := gen_random_uuid()::text;
  ch1_s2 text := gen_random_uuid()::text;
  ch2_s1 text := gen_random_uuid()::text;
  ch2_s2 text := gen_random_uuid()::text;
  ch2_s3 text := gen_random_uuid()::text;
  ch3_s1 text := gen_random_uuid()::text;
  ch3_s2 text := gen_random_uuid()::text;
  ch3_s3 text := gen_random_uuid()::text;
  draft_flow jsonb := $json$[
    {"id":"draft-note","type":"markdown","title":"Bài học đang biên soạn","config":{"content":"Nội dung tương tác của bài này chưa được seed. Bài sẽ hiển thị khóa nội dung cho đến khi được publish."},"completionRule":{"type":"viewed"}}
  ]$json$::jsonb;
  origin_flow jsonb := $json$[
    {"id":"origin-video","type":"media","title":"Video giới thiệu","config":{"mediaType":"video","url":"https://www.youtube.com/watch?v=k_jbTWq-u50","title":"Triết học ra đời trong bước ngoặt tư duy của nhân loại"},"completionRule":{"type":"viewed"}},
    {"id":"origin-intro","type":"dialogue","title":"Nhiệm vụ khai sáng","config":{"lines":[{"who":"guide","text":"Chào mừng nhà du hành! Mình là Sophia, người sẽ đồng hành cùng bạn."},{"who":"guide","text":"Chúng ta vừa quay ngược kim đồng hồ về thế kỷ VIII - VI trước Công nguyên. Hy Lạp, Ấn Độ, Trung Hoa đang bừng nở."},{"who":"guide","text":"Nhiệm vụ của bạn là tìm vũ khí tư duy có tên TRIẾT HỌC qua hai mảnh ghép: nguồn gốc nhận thức và nguồn gốc xã hội."}]},"completionRule":{"type":"viewed"}},
    {"id":"cognitive-video","type":"media","title":"Giải mã sấm truyền","config":{"mediaType":"video","url":"https://www.youtube.com/watch?v=1VwbmgMTbkk","title":"Bối cảnh thảm họa thiên nhiên cổ đại","subtitle":"Động đất, mưa giông và cách con người cổ đại lý giải tự nhiên"},"completionRule":{"type":"viewed"}},
    {"id":"cognitive-scene","type":"dialogue","title":"Hội đồng bộ tộc","config":{"lines":[{"who":"elder","text":"Tai họa này từ đâu mà ra?! Hỡi người trẻ kia, hãy giải thích cho cả bộ tộc!"},{"who":"guide","text":"Hãy quên kiến thức hiện đại đi, đặt mình vào tâm trí người cổ đại. Bạn sẽ giải thích thế nào?"}]},"completionRule":{"type":"viewed"}},
    {"id":"lyra-doubt","type":"dialogue","title":"Bước ngoặt hoài nghi","config":{"lines":[{"who":"skeptic","text":"Khoan đã! Năm ngoái chúng ta đã tế rất nhiều lễ vật, vậy mà năm nay động đất vẫn xảy ra."},{"who":"skeptic","text":"Liệu có quy luật tự nhiên nào dưới lòng đất, không phụ thuộc vào tâm trạng của các vị thần?"}]},"completionRule":{"type":"viewed"}},
    {"id":"cognitive-origin-quiz","type":"quiz_sequence","title":"Nguồn gốc nhận thức: chuỗi câu hỏi","config":{"questions":[{"question":"Theo lối tư duy cổ đại, trận động đất thường được giải thích theo cách nào?","options":["Ý chí thần linh hoặc lực lượng siêu nhiên đang chi phối tự nhiên.","Một mô hình địa chất hiện đại đã được đo đạc đầy đủ.","Một hiện tượng không cần nguyên nhân."],"correctIndex":0,"explanation":"Tư duy huyền thoại quy hiện tượng tự nhiên về thần linh hoặc lực lượng siêu nhiên."},{"question":"Nếu nguyên nhân là ý chí thần linh, giải pháp hợp logic với tư duy đó là gì?","options":["Tổ chức tế lễ, cúng bái để xoa dịu thần linh.","Đo đạc địa chất và xây dựng giả thuyết khoa học.","Tìm quy luật tự nhiên bằng khái niệm và lý lẽ."],"correctIndex":0,"explanation":"Khi nguyên nhân được đặt vào lực lượng siêu nhiên, giải pháp thường là nghi lễ."},{"question":"Câu hỏi của Lyra hé lộ điều gì đang bắt đầu thay đổi?","options":["Con người bắt đầu tìm quy luật và lý lẽ để giải thích thế giới.","Con người quyết định tế lễ nhiều hơn nữa.","Con người từ bỏ việc tìm hiểu thế giới."],"correctIndex":0,"explanation":"Đây là lúc tư duy lý luận, tức triết học, bắt đầu nảy mầm."}]},"completionRule":{"type":"correct"}},
    {"id":"cognitive-summary","type":"mindmap_reveal","title":"Bốn bước tiến hóa nhận thức","config":{"center":"Nguồn gốc nhận thức","nodes":[{"id":"need","label":"Nhu cầu tự nhiên","detail":"Nhận thức thế giới là nhu cầu tự nhiên để sinh tồn."},{"id":"myth","label":"Tư duy huyền thoại","detail":"Thần thoại và tín ngưỡng là loại hình triết lý đầu tiên."},{"id":"abstraction","label":"Tư duy trừu tượng","detail":"Con người biết khái quát tri thức riêng lẻ thành cái chung."},{"id":"philosophy","label":"Triết học ra đời","detail":"Triết học thay thế huyền thoại bằng khái niệm, phạm trù, quy luật."}]},"completionRule":{"type":"viewed"}},
    {"id":"social-video","type":"media","title":"Đại hội bộ tộc","config":{"mediaType":"video","url":"https://www.youtube.com/watch?v=JNutDwj92is","title":"Bối cảnh biến đổi xã hội","subtitle":"Phân công lao động, của cải dư thừa và phân chia giai cấp"},"completionRule":{"type":"viewed"}},
    {"id":"social-setup","type":"dialogue","title":"Một ngày trong xã hội cổ đại","config":{"lines":[{"who":"guide","text":"Con người biết rèn đồng, rèn sắt. Của cải bắt đầu dư thừa, xã hội phân chia thành chủ nô và nô lệ."},{"who":"guide","text":"Để hiểu ai đủ điều kiện làm triết học, hãy thử sống một ngày trong hai vai khác nhau."}]},"completionRule":{"type":"viewed"}},
    {"id":"social-condition-quiz","type":"quiz_sequence","title":"Nguồn gốc xã hội: trải nghiệm vai","config":{"questions":[{"question":"Borin lao động kiệt sức cả ngày. Cuối ngày, Borin có điều kiện suy ngẫm nguồn gốc vũ trụ không?","options":["Không. Borin chỉ kịp ăn vội rồi ngủ để mai lại lao động.","Có. Borin thức trắng đêm để viết học thuyết triết học."],"correctIndex":0,"explanation":"Lao động chân tay và nỗi lo sinh tồn không để lại điều kiện nghiên cứu lý luận."},{"question":"Theon có của cải dư thừa, không phải lao động chân tay. Với điều kiện ấy, Theon có thể làm gì?","options":["Quan sát, suy ngẫm và hệ thống hóa tri thức thành học thuyết.","Cũng chẳng làm được gì vì quá bận đi cày."],"correctIndex":0,"explanation":"Tầng lớp trí óc có thời gian và điều kiện nghiên cứu lý luận."},{"question":"Nhóm nào đủ điều kiện hệ thống hóa tri thức thành học thuyết?","options":["Tầng lớp lao động trí óc: quý tộc, trí thức.","Tầng lớp lao động chân tay: nô lệ.","Cả hai nhóm đều như nhau."],"correctIndex":0,"explanation":"Khi lao động trí óc tách khỏi lao động chân tay, tầng lớp trí thức có điều kiện tạo lập triết học."}]},"completionRule":{"type":"correct"}},
    {"id":"social-warning","type":"markdown","title":"Ghi nhớ về nguồn gốc xã hội","config":{"content":"Triết học không thể ra đời trong một xã hội mông muội. Nó cần trình độ sản xuất tương đối cao, phân công lao động, giai cấp, nhà nước và tầng lớp trí thức có điều kiện hệ thống hóa tri thức."},"completionRule":{"type":"viewed"}},
    {"id":"origin-social","type":"sequence_sorting","title":"Chuỗi nhân quả xã hội","config":{"instruction":"Chọn theo đúng thứ tự hình thành điều kiện xã hội của triết học.","items":[{"id":"c1","order":0,"text":"Sản xuất phát triển, của cải dư thừa và tư hữu hình thành."},{"id":"c2","order":1,"text":"Xã hội phân chia giai cấp."},{"id":"c3","order":2,"text":"Lao động trí óc tách khỏi lao động chân tay."},{"id":"c4","order":3,"text":"Tầng lớp trí thức hệ thống hóa tri thức thành triết học."}],"successFeedback":"Chuỗi nhân quả đã sáng lên. Đây là nguồn gốc xã hội của triết học."},"completionRule":{"type":"correct"}},
    {"id":"origin-union","type":"mindmap_reveal","title":"Hợp nhất hai mảnh ghép","config":{"center":"Triết học ra đời","nodes":[{"id":"cognitive","label":"Nguồn gốc nhận thức","detail":"Nhu cầu hiểu biết thế giới và năng lực tư duy trừu tượng."},{"id":"social","label":"Nguồn gốc xã hội","detail":"Phân công lao động, giai cấp và tầng lớp trí thức."}]},"completionRule":{"type":"viewed"}},
    {"id":"origin-final-quiz","type":"quiz_sequence","title":"Kiểm tra cuối bài","config":{"questions":[{"question":"Triết học ra đời vào khoảng thời gian nào?","options":["Thế kỷ XV - XVI sau CN","Thế kỷ VIII - VI trước CN","Thế kỷ I sau CN","Thời kỳ đồ đá cũ"],"correctIndex":1,"explanation":"Triết học ra đời khoảng thế kỷ VIII - VI trước Công nguyên."},{"question":"Triết học có mấy nguồn gốc cơ bản?","options":["Một: nguồn gốc thần thánh","Hai: nhận thức và xã hội","Ba: kinh tế, chính trị, văn hóa","Không có nguồn gốc xác định"],"correctIndex":1,"explanation":"Triết học có hai nguồn gốc cơ bản: nhận thức và xã hội."},{"question":"Điều kiện xã hội nào là tiền đề cho triết học ra đời?","options":["Xã hội mông muội, chưa phân hóa","Phân công lao động, giai cấp xuất hiện, lao động trí óc tách khỏi lao động chân tay","Mọi người đều làm nông nghiệp như nhau","Xã hội không có của cải dư thừa"],"correctIndex":1,"explanation":"Triết học ra đời khi xã hội có phân công lao động, giai cấp và tầng lớp trí thức."}]},"completionRule":{"type":"correct"}},
    {"id":"origin-final","type":"final_summary","title":"Hoàn thành bài học","config":{"message":"Triết học xuất hiện khoảng thế kỷ VIII-VI TCN từ nguồn gốc nhận thức và nguồn gốc xã hội.","keyTakeaways":["Nguồn gốc nhận thức: nhu cầu hiểu biết và tư duy trừu tượng.","Nguồn gốc xã hội: phân công lao động, giai cấp và tầng lớp trí thức."],"rewards":{"xp":120,"badge":"Nhà Khai Sáng"}},"completionRule":{"type":"viewed"}}
  ]$json$::jsonb;
  concept_flow jsonb := $json$[
    {"id":"ancient-origin-map","type":"target_matching","title":"Nguồn gốc thuật ngữ triết học","config":{"targets":[{"id":"china","label":"Trung Quốc","icon":"temple_buddhist"},{"id":"india","label":"Ấn Độ","icon":"water"},{"id":"greece","label":"Hy Lạp","icon":"account_balance"}],"items":[{"id":"zhe","text":"哲","targetId":"china"},{"id":"darsana","text":"Dar'sana","targetId":"india"},{"id":"philosophia","text":"φιλοσοφία","targetId":"greece"}],"summary":"Triết học xuất hiện ở nhiều trung tâm văn minh lớn."},"completionRule":{"type":"correct"}},
    {"id":"worldview-sorting","type":"category_sorting","title":"Phân loại thế giới quan","config":{"categories":[{"id":"myth-religion","label":"Thần thoại - Tôn giáo"},{"id":"philosophy","label":"Triết học"}],"cards":[{"id":"faith","text":"Niềm tin","categoryId":"myth-religion"},{"id":"ritual","text":"Nghi lễ","categoryId":"myth-religion"},{"id":"reason","text":"Công cụ lý tính","categoryId":"philosophy"},{"id":"law","text":"Quy luật","categoryId":"philosophy"}],"summary":"Triết học lý giải thế giới bằng lý tính, logic và khái quát hóa."},"completionRule":{"type":"correct"}},
    {"id":"philosophy-features","type":"mindmap_reveal","title":"Bốn đặc trưng cốt lõi","config":{"center":"Triết học","nodes":[{"id":"social-consciousness","label":"Hình thái ý thức xã hội","detail":"Triết học là một hình thái ý thức xã hội bậc cao."},{"id":"whole","label":"Chỉnh thể toàn vẹn","detail":"Triết học xem xét thế giới trong tính chỉnh thể."},{"id":"universal-laws","label":"Quy luật phổ biến","detail":"Triết học hướng tới các quy luật chung nhất."},{"id":"worldview-core","label":"Hạt nhân thế giới quan","detail":"Triết học là hạt nhân lý luận của thế giới quan."}]},"completionRule":{"type":"viewed"}},
    {"id":"marxist-definition","type":"mcq","title":"Định nghĩa triết học Mác - Lênin","config":{"question":"Định nghĩa nào phù hợp nhất với triết học Mác - Lênin?","options":[{"id":"a","text":"Tập hợp các niềm tin tôn giáo.","isCorrect":false},{"id":"b","text":"Hệ thống tri thức lý luận chung nhất về thế giới, vị trí con người và phương pháp nhận thức, cải tạo thế giới.","isCorrect":true,"explanation":"Đây là cách hiểu khái quát chức năng thế giới quan và phương pháp luận."},{"id":"c","text":"Một khoa học thực nghiệm chỉ nghiên cứu một lĩnh vực riêng.","isCorrect":false}]},"completionRule":{"type":"correct"}},
    {"id":"philosophy-science-matching","type":"matching_columns","title":"Tri thức triết học và khoa học cụ thể","config":{"leftColumn":[{"id":"philosophy","text":"Tri thức triết học"},{"id":"specific-science","text":"Khoa học cụ thể"},{"id":"worldview","text":"Thế giới quan"}],"rightColumn":[{"id":"general","text":"Khái quát những vấn đề chung nhất"},{"id":"domain","text":"Nghiên cứu một lĩnh vực, đối tượng cụ thể"},{"id":"orientation","text":"Định hướng cách con người nhìn nhận thế giới"}],"correctPairs":[{"leftId":"philosophy","rightId":"general"},{"leftId":"specific-science","rightId":"domain"},{"leftId":"worldview","rightId":"orientation"}]},"completionRule":{"type":"correct"}},
    {"id":"all-philosophy-is-science","type":"true_false","title":"Mọi học thuyết triết học đều là khoa học?","config":{"statement":"Mọi học thuyết triết học đều là khoa học.","correctAnswer":false,"explanation":"Không phải mọi học thuyết triết học đều khoa học."},"completionRule":{"type":"correct"}},
    {"id":"lesson-1b-final","type":"final_summary","title":"Hoàn thành bài 1.b","config":{"message":"Bạn đã nắm được khái niệm triết học.","keyTakeaways":["Triết học là hệ thống tri thức lý luận chung nhất.","Triết học là hạt nhân lý luận của thế giới quan.","Cần phân biệt tri thức triết học với khoa học cụ thể."],"rewards":{"xp":120,"badge":"Người khai mở tư duy"}},"completionRule":{"type":"viewed"}}
  ]$json$::jsonb;
  material_flow jsonb := $json$[
    {"id":"material-opening","type":"dialogue","title":"Câu hỏi của lịch sử","config":{"lines":[{"who":"guide","text":"Bản chất của thế giới này là gì? Từ câu hỏi đó hình thành hai con đường: duy tâm và duy vật."}]},"completionRule":{"type":"viewed"}},
    {"id":"idealism-room","type":"mindmap_reveal","title":"Cánh cửa duy tâm","config":{"center":"Duy tâm","nodes":[{"id":"platon","label":"Platon","detail":"Thế giới vật chất là cái bóng của thế giới ý niệm."},{"id":"protagoras","label":"Protagoras","detail":"Thế giới khách quan bị quy về cảm giác và nhận thức cá nhân."}],"summary":"Các lập trường duy tâm làm mờ tính tồn tại khách quan của vật chất."},"completionRule":{"type":"viewed"}},
    {"id":"ancient-materialism","type":"matching_columns","title":"Chủ nghĩa duy vật thời cổ đại","config":{"leftColumn":[{"id":"thales","text":"Thales"},{"id":"heraclitus","text":"Heraclitus"},{"id":"anaximenes","text":"Anaximenes"},{"id":"india","text":"Ấn Độ cổ đại - Tứ đại"},{"id":"china","text":"Trung Quốc cổ đại - Ngũ hành"}],"rightColumn":[{"id":"water","text":"Nước"},{"id":"fire","text":"Lửa"},{"id":"air","text":"Không khí"},{"id":"four","text":"Đất, nước, lửa, gió"},{"id":"five","text":"Kim, mộc, thủy, hỏa, thổ"}],"correctPairs":[{"leftId":"thales","rightId":"water"},{"leftId":"heraclitus","rightId":"fire"},{"leftId":"anaximenes","rightId":"air"},{"leftId":"india","rightId":"four"},{"leftId":"china","rightId":"five"}]},"completionRule":{"type":"correct"}},
    {"id":"ancient-message","type":"multi_select","title":"Thông điệp rút ra","config":{"question":"Chọn tất cả nhận định đúng về chủ nghĩa duy vật thời cổ đại.","options":[{"id":"a","text":"Dùng yếu tố tự nhiên để giải thích thế giới thay vì lực lượng siêu nhiên.","isCorrect":true},{"id":"b","text":"Đồng nhất vật chất với một hoặc một vài dạng vật thể cụ thể.","isCorrect":true},{"id":"c","text":"Đã xây dựng được khái niệm vật chất hoàn chỉnh như hiện đại.","isCorrect":false}],"explanation":"Đáp án đúng: A và B."},"completionRule":{"type":"correct"}},
    {"id":"apeiron","type":"mcq","title":"Anaximander và Apeiron","config":{"question":"Anaximander muốn vượt qua hạn chế nào của các nhà duy vật trước đó?","options":[{"id":"a","text":"Đồng nhất vật chất với một vật thể cụ thể.","isCorrect":true,"explanation":"Apeiron là nỗ lực tìm bản chất chung đứng sau các dạng vật thể riêng lẻ."},{"id":"b","text":"Phủ nhận sự tồn tại của vật chất.","isCorrect":false},{"id":"c","text":"Giải thích bằng thần linh.","isCorrect":false}]},"completionRule":{"type":"correct"}},
    {"id":"modern-materialism","type":"matching_columns","title":"Duy vật thế kỷ XV-XVIII","config":{"leftColumn":[{"id":"telescope","text":"Kính thiên văn và mô hình hệ Mặt Trời"},{"id":"lab","text":"Phòng thí nghiệm và dụng cụ đo lường"},{"id":"machine","text":"Máy móc và hệ thống bánh răng"},{"id":"map","text":"La bàn, bản đồ và tàu hàng hải"}],"rightColumn":[{"id":"astronomy","text":"Tự nhiên vận động theo quy luật khách quan."},{"id":"experiment","text":"Quan sát và thí nghiệm trở thành phương pháp nhận thức quan trọng."},{"id":"mechanics","text":"Nhiều nhà tư tưởng hình dung thế giới như một cỗ máy."},{"id":"geography","text":"Phát kiến địa lý mở rộng hiểu biết và làm suy yếu quan niệm cũ."}],"correctPairs":[{"leftId":"telescope","rightId":"astronomy"},{"leftId":"lab","rightId":"experiment"},{"leftId":"machine","rightId":"mechanics"},{"leftId":"map","rightId":"geography"}]},"completionRule":{"type":"correct"}},
    {"id":"modern-progress","type":"multi_select","title":"Điểm tiến bộ nổi bật","config":{"question":"Chọn tất cả điểm tiến bộ của duy vật thế kỷ XV-XVIII.","options":[{"id":"a","text":"Dựa vào thành tựu khoa học tự nhiên.","isCorrect":true},{"id":"b","text":"Đề cao quan sát, thực nghiệm và lý trí.","isCorrect":true},{"id":"c","text":"Giải thích tự nhiên chủ yếu bằng thần linh.","isCorrect":false},{"id":"d","text":"Khẳng định tự nhiên tồn tại khách quan và vận động theo quy luật.","isCorrect":true}],"explanation":"Đáp án đúng: A, B và D."},"completionRule":{"type":"correct"}},
    {"id":"mechanical-limit","type":"mcq","title":"Hạn chế máy móc","config":{"question":"Việc hình dung thế giới giống như một cỗ máy cho thấy hạn chế nào?","options":[{"id":"a","text":"Xem sự vật tương đối biệt lập và giải thích vận động chủ yếu bằng dịch chuyển cơ học.","isCorrect":true,"explanation":"Đây là hạn chế siêu hình do ảnh hưởng cơ học cổ điển."},{"id":"b","text":"Cho rằng thế giới không tồn tại khách quan.","isCorrect":false},{"id":"c","text":"Hoàn toàn phủ nhận khoa học tự nhiên.","isCorrect":false}]},"completionRule":{"type":"correct"}},
    {"id":"lenin-definition","type":"markdown","title":"Định nghĩa vật chất của Lênin","config":{"content":"Vật chất là một phạm trù triết học dùng để chỉ thực tại khách quan được đem lại cho con người trong cảm giác, được cảm giác của chúng ta chép lại, chụp lại, phản ánh, và tồn tại không lệ thuộc vào cảm giác.\\n\\nĐịnh nghĩa này nhấn mạnh vật chất tồn tại khách quan, con người có thể nhận thức được, và vật chất không đồng nhất với một dạng vật thể cụ thể."},"completionRule":{"type":"viewed"}},
    {"id":"material-final","type":"final_summary","title":"Hoàn thành bài Phạm trù vật chất","config":{"message":"Bạn đã nắm được tiến trình lịch sử của quan niệm vật chất và ý nghĩa định nghĩa của Lênin.","keyTakeaways":["Duy tâm làm mờ tính tồn tại khách quan của vật chất.","Duy vật cổ đại chống thần thoại nhưng còn trực quan.","Duy vật cận đại dựa vào khoa học nhưng còn máy móc.","Định nghĩa của Lênin xác lập vật chất là thực tại khách quan."],"rewards":{"xp":140,"badge":"Người giữ cánh cửa vật chất"}},"completionRule":{"type":"viewed"}}
  ]$json$::jsonb;
begin
  insert into "User" ("id", "email", "role", "name", "streak")
  values (student_id, 'student@philomind.local', 'student', 'Nguyễn Văn A', 5)
  on conflict ("id") do update set "name" = excluded."name", "role" = excluded."role";

  delete from "Course" where "title" = 'Triết học Mác – Lênin';

  insert into "Course" ("id", "title", "description", "userId")
  values (course_id, 'Triết học Mác – Lênin', 'Nghiên cứu các quy luật vận động chung nhất của tự nhiên, xã hội và tư duy.', student_id);

  insert into "Chapter" ("id", "title", "orderIndex", "courseId", "parentChapterId") values
    (ch1, 'Chương 1: Triết học và vai trò của triết học trong đời sống xã hội', 1, course_id, null),
    (ch2, 'Chương 2: Chủ nghĩa duy vật biện chứng', 2, course_id, null),
    (ch3, 'Chương 3: Chủ nghĩa duy vật lịch sử', 3, course_id, null),
    (ch1_s1, 'Khái lược về Triết học', 1, course_id, ch1),
    (ch1_s2, 'Triết học Mác – Lênin', 2, course_id, ch1),
    (ch2_s1, 'Vật chất và ý thức', 1, course_id, ch2),
    (ch2_s2, 'Phép biện chứng duy vật', 2, course_id, ch2),
    (ch2_s3, 'Lý luận nhận thức', 3, course_id, ch2),
    (ch3_s1, 'Hình thái kinh tế – xã hội', 1, course_id, ch3),
    (ch3_s2, 'Giai cấp và đấu tranh giai cấp', 2, course_id, ch3),
    (ch3_s3, 'Con người và vai trò của quần chúng', 3, course_id, ch3);

  create temp table _lesson_seed (
    title text,
    summary text,
    original_text text,
    quick_take text,
    difficulty text,
    time_to_read text,
    order_index int,
    chapter_id text,
    video_url text,
    lesson_flow jsonb,
    content_ready boolean,
    lesson_status text,
    progress_status text
  ) on commit drop;

  insert into _lesson_seed values
    ('Nguồn gốc của triết học', 'Triết học ra đời từ nguồn gốc nhận thức và nguồn gốc xã hội.', 'Triết học ra đời khoảng thế kỷ VIII-VI TCN tại các trung tâm văn minh lớn, khi con người có nhu cầu lý giải thế giới bằng tư duy lý luận và khi xã hội đã xuất hiện phân công lao động, giai cấp, tầng lớp trí thức.', 'Triết học xuất hiện từ nhu cầu nhận thức và điều kiện xã hội chín muồi.', 'Medium', '8 min read', 1, ch1_s1, 'https://www.youtube.com/watch?v=k_jbTWq-u50', origin_flow, true, 'published', 'available'),
    ('Khái niệm triết học', 'Triết học là hệ thống tri thức lý luận chung nhất của con người về thế giới.', 'Triết học là hệ thống quan điểm lý luận chung nhất về thế giới, về con người và vị trí của con người trong thế giới đó.', 'Hệ thống tri thức lý luận chung nhất về thế giới.', 'Easy', '6 min read', 2, ch1_s1, null, concept_flow, true, 'published', 'locked'),
    ('Vấn đề cơ bản của triết học', 'Vấn đề quan hệ giữa vật chất và ý thức là vấn đề cơ bản của mọi hệ thống triết học.', 'Vấn đề cơ bản lớn của mọi triết học là quan hệ giữa tư duy và tồn tại, giữa ý thức và vật chất.', 'Mối quan hệ giữa vật chất và ý thức.', 'Hard', '12 min read', 3, ch1_s1, null, draft_flow, false, 'draft', 'locked'),
    ('Sự ra đời và phát triển', 'Sự ra đời của triết học Mác - Lênin là một bước ngoặt cách mạng trong lịch sử triết học.', 'Triết học Mác ra đời vào những năm 40 của thế kỷ XIX.', 'Bước ngoặt vĩ đại giải phóng tư tưởng vô sản.', 'Medium', '10 min read', 1, ch1_s2, null, draft_flow, false, 'draft', 'locked'),
    ('Đối tượng và chức năng', 'Đối tượng nghiên cứu là các quy luật chung nhất và chức năng thế giới quan, phương pháp luận.', 'Triết học Mác - Lênin nghiên cứu những quy luật chung nhất của tự nhiên, xã hội và tư duy.', 'Cung cấp thế giới quan và phương pháp luận khoa học.', 'Easy', '7 min read', 2, ch1_s2, null, draft_flow, false, 'draft', 'locked'),
    ('Vai trò trong đời sống xã hội', 'Triết học Mác - Lênin là vũ khí lý luận sắc bén của giai cấp công nhân.', 'Triết học Mác - Lênin là thế giới quan và phương pháp luận khoa học, cách mạng.', 'Công cụ cải tạo thế giới khách quan.', 'Medium', '8 min read', 3, ch1_s2, null, draft_flow, false, 'draft', 'locked'),
    ('Phạm trù vật chất', 'Vật chất là thực tại khách quan tồn tại độc lập với ý thức.', 'Vật chất là một phạm trù triết học dùng để chỉ thực tại khách quan được đem lại cho con người trong cảm giác.', 'Vật chất là thực tại khách quan tồn tại độc lập với ý thức.', 'Hard', '15 min read', 1, ch2_s1, null, material_flow, true, 'published', 'locked'),
    ('Phương thức tồn tại của vật chất', 'Vận động là phương thức tồn tại của vật chất.', 'Vận động là thuộc tính cố hữu của vật chất, là phương thức tồn tại của vật chất.', 'Vận động là phương thức tồn tại tuyệt đối của vật chất.', 'Medium', '10 min read', 2, ch2_s1, null, draft_flow, false, 'draft', 'locked'),
    ('Nguồn gốc và bản chất của ý thức', 'Ý thức là sự phản ánh sáng tạo thực tại khách quan vào bộ não người.', 'Ý thức có nguồn gốc tự nhiên và nguồn gốc xã hội.', 'Ý thức là sự phản ánh năng động, sáng tạo.', 'Hard', '12 min read', 3, ch2_s1, null, draft_flow, false, 'draft', 'locked'),
    ('Mối quan hệ vật chất – ý thức', 'Vật chất quyết định ý thức, ý thức tác động trở lại thông qua thực tiễn.', 'Vật chất quyết định ý thức về nguồn gốc, nội dung và sự biến đổi.', 'Vật chất quyết định ý thức; ý thức tác động trở lại.', 'Hard', '11 min read', 4, ch2_s1, null, draft_flow, false, 'draft', 'locked'),
    ('Hai nguyên lý cơ bản', 'Hai nguyên lý cơ bản của phép biện chứng duy vật.', 'Mọi sự vật tồn tại trong mối liên hệ phổ biến và quá trình phát triển.', 'Mọi sự vật liên hệ phổ biến và phát triển.', 'Medium', '9 min read', 1, ch2_s2, null, draft_flow, false, 'draft', 'locked'),
    ('Các cặp phạm trù', 'Sáu cặp phạm trù cơ bản phản ánh các mối liên hệ biện chứng.', 'Các cặp phạm trù phản ánh các quan hệ phổ biến nhất.', 'Các cặp quan hệ đối lập thống nhất phản ánh hiện thực.', 'Hard', '14 min read', 2, ch2_s2, null, draft_flow, false, 'draft', 'locked'),
    ('Ba quy luật cơ bản', 'Quy luật Lượng - Chất, Mâu thuẫn và Phủ định của phủ định.', 'Ba quy luật cơ bản chỉ ra cách thức, nguồn gốc và khuynh hướng phát triển.', 'Ba quy luật cơ bản của phép biện chứng.', 'Hard', '16 min read', 3, ch2_s2, null, draft_flow, false, 'draft', 'locked'),
    ('Bản chất của nhận thức', 'Nhận thức là quá trình phản ánh hiện thực khách quan một cách tích cực, sáng tạo.', 'Nhận thức đi từ trực quan sinh động đến tư duy trừu tượng và thực tiễn.', 'Từ cảm tính lên lý tính rồi trở về thực tiễn.', 'Medium', '8 min read', 1, ch2_s3, null, draft_flow, false, 'draft', 'locked'),
    ('Thực tiễn và vai trò của thực tiễn', 'Thực tiễn là cơ sở, động lực, mục đích của nhận thức và tiêu chuẩn chân lý.', 'Thực tiễn là hoạt động vật chất có mục đích, mang tính lịch sử - xã hội.', 'Thực tiễn kiểm nghiệm chân lý.', 'Medium', '10 min read', 2, ch2_s3, null, draft_flow, false, 'draft', 'locked'),
    ('Chân lý', 'Chân lý là tri thức phù hợp với thực tế khách quan và được thực tiễn kiểm nghiệm.', 'Chân lý phản ánh đúng hiện thực khách quan và được thực tiễn xác nhận.', 'Tri thức khách quan đã được thực tiễn khẳng định.', 'Easy', '7 min read', 3, ch2_s3, null, draft_flow, false, 'draft', 'locked'),
    ('Sản xuất vật chất', 'Sản xuất vật chất là cơ sở tồn tại và phát triển của xã hội loài người.', 'Sản xuất vật chất quyết định sự sinh tồn và biến đổi của xã hội.', 'Sản xuất vật chất quyết định tồn tại xã hội.', 'Medium', '8 min read', 1, ch3_s1, null, draft_flow, false, 'draft', 'locked'),
    ('Biện chứng LLSX – QHSX', 'Quy luật quan hệ sản xuất phù hợp với trình độ phát triển của lực lượng sản xuất.', 'Lực lượng sản xuất quyết định quan hệ sản xuất.', 'Lực lượng sản xuất quyết định quan hệ sản xuất.', 'Hard', '13 min read', 2, ch3_s1, null, draft_flow, false, 'draft', 'locked'),
    ('Cơ sở hạ tầng và kiến trúc thượng tầng', 'Cơ sở hạ tầng quyết định kiến trúc thượng tầng tương ứng.', 'Cơ sở hạ tầng là cơ cấu kinh tế; kiến trúc thượng tầng là hệ quan điểm và thiết chế tương ứng.', 'Kinh tế quyết định chính trị và hệ tư tưởng.', 'Hard', '12 min read', 3, ch3_s1, null, draft_flow, false, 'draft', 'locked'),
    ('Nguồn gốc giai cấp', 'Giai cấp ra đời từ nguồn gốc kinh tế do tư hữu tư liệu sản xuất.', 'Tư hữu tư liệu sản xuất là nguồn gốc trực tiếp phân chia xã hội thành giai cấp.', 'Tư hữu tư liệu sản xuất hình thành giai cấp.', 'Medium', '8 min read', 1, ch3_s2, null, draft_flow, false, 'draft', 'locked'),
    ('Đấu tranh giai cấp', 'Đấu tranh giai cấp là động lực phát triển xã hội có đối kháng giai cấp.', 'Đấu tranh giai cấp là cuộc đấu tranh giữa các giai cấp có lợi ích đối lập.', 'Đấu tranh giai cấp là động lực lịch sử.', 'Medium', '9 min read', 2, ch3_s2, null, draft_flow, false, 'draft', 'locked'),
    ('Nhà nước và cách mạng xã hội', 'Nhà nước là công cụ chuyên chính giai cấp, cách mạng xã hội chuyển đổi hình thái.', 'Nhà nước ra đời do mâu thuẫn giai cấp không thể điều hòa.', 'Nhà nước là công cụ thống trị; cách mạng chuyển hình thái.', 'Hard', '14 min read', 3, ch3_s2, null, draft_flow, false, 'draft', 'locked'),
    ('Bản chất con người', 'Con người là thực thể sinh học - xã hội, bản chất là tổng hòa các quan hệ xã hội.', 'Bản chất con người là tổng hòa những quan hệ xã hội.', 'Bản chất con người là tổng hòa quan hệ xã hội.', 'Easy', '7 min read', 1, ch3_s3, null, draft_flow, false, 'draft', 'locked'),
    ('Quần chúng và lãnh tụ', 'Quần chúng nhân dân là người sáng tạo chân chính ra lịch sử.', 'Quần chúng nhân dân là lực lượng quyết định sự phát triển của lịch sử.', 'Quần chúng quyết định lịch sử; lãnh tụ tổ chức và định hướng.', 'Medium', '10 min read', 2, ch3_s3, null, draft_flow, false, 'draft', 'locked');

  insert into "ConceptNode" (
    "id", "title", "summary", "originalText", "quickTake", "difficulty",
    "timeToRead", "videoUrl", "orderIndex", "chapterId", "lessonFlow",
    "lessonType", "contentReady", "lessonStatus"
  )
  select
    gen_random_uuid()::text, title, summary, original_text, quick_take,
    difficulty, time_to_read, video_url, order_index, chapter_id, lesson_flow,
    'flow', content_ready, lesson_status
  from _lesson_seed;

  insert into "Progress" (
    "id", "userId", "nodeId", "status", "lessonCompleted",
    "flashcardCompleted", "podcastCompleted", "quizCompleted",
    "currentComponentIndex", "updatedAt"
  )
  select
    gen_random_uuid()::text, student_id, n."id", s.progress_status,
    false, false, false, false, 0, now()
  from "ConceptNode" n
  join _lesson_seed s on s.title = n."title"
  where n."chapterId" = s.chapter_id;

  insert into "Podcast" ("id", "nodeId", "audioUrl", "transcript")
  select
    gen_random_uuid()::text,
    n."id",
    'https://cdn.pixabay.com/download/audio/2022/03/15/audio_5e3edee2cd.mp3',
    case n."title"
      when 'Nguồn gốc của triết học' then
        '[{"time":0,"speaker":"Host","text":"Xin chào các bạn, hôm nay chúng ta bắt đầu với câu hỏi: triết học ra đời từ đâu?"},{"time":6,"speaker":"Host","text":"Trước hết là nguồn gốc nhận thức: con người có nhu cầu hiểu biết thế giới và dần vượt qua cách giải thích bằng thần thoại."},{"time":14,"speaker":"Guest","text":"Khi con người đặt câu hỏi về quy luật tự nhiên thay vì chỉ quy mọi thứ cho thần linh, tư duy lý luận bắt đầu xuất hiện."},{"time":23,"speaker":"Host","text":"Nhưng triết học cũng cần nguồn gốc xã hội: sản xuất phát triển, của cải dư thừa, giai cấp hình thành và lao động trí óc tách khỏi lao động chân tay."}]'::jsonb
      else
        '[{"time":0,"speaker":"Host","text":"Xin chào các bạn, chào mừng đến với podcast Triết học Mác - Lênin."},{"time":4,"speaker":"Host","text":"Trong tập hôm nay, chúng ta cùng đi sâu vào phạm trù vật chất."},{"time":14,"speaker":"Host","text":"Vật chất là thực tại khách quan, tồn tại độc lập với ý thức và được con người phản ánh trong cảm giác."}]'::jsonb
    end
  from "ConceptNode" n
  join _lesson_seed s on s.title = n."title"
  where s.content_ready = true
    and n."title" in ('Nguồn gốc của triết học', 'Phạm trù vật chất');

  insert into "Warmup" ("id", "nodeId", "type", "title", "image", "blanks", "answer", "story", "question", "options", "correctIndex", "reveal")
  select gen_random_uuid()::text, n."id", 'game', 'KÍNH LỌC CUỘC ĐỜI', null, null, null, null, null, null, null,
    'Hoàn thành trò chơi khởi động và sẵn sàng tiếp cận nguồn gốc triết học.'
  from "ConceptNode" n
  where n."title" = 'Nguồn gốc của triết học'
  union all
  select gen_random_uuid()::text, n."id", 'story', 'Từ sấm sét đến quy luật', null, null, null,
    'Một bộ tộc cổ đại tin rằng sấm sét là cơn giận của thần linh. Sau nhiều lần tế lễ mà thiên tai vẫn xảy ra, một người trẻ bắt đầu hỏi: liệu có quy luật tự nhiên nào đứng sau hiện tượng này không?',
    'Câu hỏi này thể hiện nguồn gốc nào của triết học?',
    '["Nguồn gốc nhận thức","Nguồn gốc kinh tế thị trường","Nguồn gốc nghệ thuật"]'::jsonb,
    0,
    'Đúng. Đó là nguồn gốc nhận thức: nhu cầu hiểu biết thế giới và vượt qua tư duy huyền thoại bằng lý lẽ.'
  from "ConceptNode" n
  where n."title" = 'Nguồn gốc của triết học'
  union all
  select gen_random_uuid()::text, n."id", 'image-guess', 'Hai mảnh ghép khai sinh triết học',
    'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=900&auto=format&fit=crop',
    'N H _ N   T H _ C   &   X _   H _ I',
    'nhận thức và xã hội',
    null, null, null, null,
    'Chính xác. Triết học ra đời từ hai nguồn gốc cơ bản: nguồn gốc nhận thức và nguồn gốc xã hội.'
  from "ConceptNode" n
  where n."title" = 'Nguồn gốc của triết học'
  union all
  select gen_random_uuid()::text, n."id", 'image-guess', 'Nhìn hình đoán khái niệm',
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=900&auto=format&fit=crop',
    'V _ T   C H _ T',
    'vật chất',
    null, null, null, null,
    'Vật chất là phạm trù trung tâm của chủ nghĩa duy vật biện chứng, tồn tại khách quan và độc lập với ý thức.'
  from "ConceptNode" n
  where n."title" = 'Phạm trù vật chất';

  insert into "Flashcard" ("id", "nodeId", "tag", "question", "answer")
  select gen_random_uuid()::text, n."id", 'Nguồn gốc triết học', 'Triết học ra đời vào khoảng thời gian nào?', 'Khoảng thế kỷ VIII - VI trước Công nguyên.'
  from "ConceptNode" n where n."title" = 'Nguồn gốc của triết học'
  union all
  select gen_random_uuid()::text, n."id", 'Nguồn gốc triết học', 'Triết học có hai nguồn gốc cơ bản nào?', 'Nguồn gốc nhận thức và nguồn gốc xã hội.'
  from "ConceptNode" n where n."title" = 'Nguồn gốc của triết học'
  union all
  select gen_random_uuid()::text, n."id", 'Khái niệm triết học', 'Triết học là gì?', 'Hệ thống tri thức lý luận chung nhất về thế giới, con người và vị trí con người trong thế giới.'
  from "ConceptNode" n where n."title" = 'Khái niệm triết học'
  union all
  select gen_random_uuid()::text, n."id", 'Phạm trù vật chất', 'Theo Lênin, vật chất là gì?', 'Thực tại khách quan được đem lại cho con người trong cảm giác và tồn tại không lệ thuộc vào cảm giác.'
  from "ConceptNode" n where n."title" = 'Phạm trù vật chất';

  insert into "Quiz" ("id", "nodeId", "type", "title", "description", "questions")
  select gen_random_uuid()::text, n."id", 'mcq', 'Trắc nghiệm Bài 1: Nguồn gốc triết học', 'Ôn tập nhanh nội dung nguồn gốc triết học.',
    '[{"question":"Triết học có mấy nguồn gốc cơ bản?","options":["Một","Hai: nhận thức và xã hội","Ba","Không xác định"],"correctIndex":1},{"question":"Nguồn gốc xã hội của triết học gắn với điều kiện nào?","options":["Xã hội chưa phân hóa","Lao động trí óc tách khỏi lao động chân tay và giai cấp xuất hiện","Mọi người đều làm nông nghiệp","Không có của cải dư thừa"],"correctIndex":1}]'::jsonb
  from "ConceptNode" n
  where n."title" = 'Nguồn gốc của triết học';

  insert into "DebateTopic" ("id", "title", "description", "initialPrompt")
  values
    (gen_random_uuid()::text, 'Chủ nghĩa Duy vật vs Chủ nghĩa Duy tâm', 'Cuộc đối đầu kinh điển về bản chất thế giới.', 'Giới duy tâm cho rằng sự vật chỉ là phức hợp cảm giác. Hãy dùng lập luận duy vật biện chứng để phản biện.'),
    (gen_random_uuid()::text, 'Giá trị thặng dư trong kỷ nguyên số và AI', 'Robot, thuật toán và tự động hóa có tạo ra giá trị thặng dư không?', 'Theo kinh tế chính trị Mác - Lênin, máy móc chuyển dịch giá trị chứ không tự tạo giá trị thặng dư. Lập trường của bạn là gì?'),
    (gen_random_uuid()::text, 'Ý thức và Trí tuệ nhân tạo', 'AI có thể có ý thức thật sự hay không?', 'Triết học xem ý thức là thuộc tính của bộ não người trong đời sống xã hội. Vậy AI có thể có ý thức không?');

  insert into "Debate" ("id", "nodeId", "topicId", "userId", "transcript")
  select gen_random_uuid()::text, n."id", null, student_id,
    jsonb_build_array(jsonb_build_object('speaker','Host','text','Hãy thảo luận luận điểm: ' || n."quickTake", 'time', 0))
  from "ConceptNode" n;

  insert into "Debate" ("id", "nodeId", "topicId", "userId", "transcript")
  select gen_random_uuid()::text, null, t."id", student_id,
    jsonb_build_array(jsonb_build_object('speaker','Host','text',t."initialPrompt", 'time', 0))
  from "DebateTopic" t;
end;
$$;

commit;
