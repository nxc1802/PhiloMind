import docx
import json
import re
import os

def parse_docx_to_json(docx_path, json_path):
    doc = docx.Document(docx_path)
    questions = []
    
    current_q = None
    
    for para in doc.paragraphs:
        text = para.text.strip()
        if not text:
            continue
            
        # Match "Câu 1:", "Câu 1.", "Câu 10: "
        if re.match(r"^Câu\s+\d+[:.]", text, re.IGNORECASE):
            if current_q and current_q.get("options") and "correctIndex" in current_q:
                questions.append(current_q)
                
            q_text = re.sub(r"^Câu\s+\d+[:.]\s*", "", text, flags=re.IGNORECASE)
            current_q = {
                "question": q_text,
                "options": [],
                "explanation": ""
            }
        elif re.match(r"^[A-Z][:.)]\s+", text) and current_q is not None:
            # Option line
            current_q["options"].append(text)
        elif re.match(r"^Đáp án[:.]?\s*", text, re.IGNORECASE) and current_q is not None:
            ans_str = re.sub(r"^Đáp án[:.]?\s*", "", text, flags=re.IGNORECASE).strip().upper()
            if ans_str:
                ans_char = ans_str[0] # Usually A, B, C, or D
                if 'A' <= ans_char <= 'D':
                    current_q["correctIndex"] = ord(ans_char) - ord('A')
        elif current_q is not None and "correctIndex" in current_q:
            # Lines after answer might be explanation
            if not current_q["explanation"]:
                current_q["explanation"] = text
            else:
                current_q["explanation"] += "\n" + text

    if current_q and current_q.get("options") and "correctIndex" in current_q:
        questions.append(current_q)
        
    print(f"Extracted {len(questions)} questions from {docx_path}")
    
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(questions, f, ensure_ascii=False, indent=2)

def main():
    base_dir = "d:/Workspace/Project/PhiloMind"
    data_dir = os.path.join(base_dir, "data")
    out_dir = os.path.join(base_dir, "backend", "prisma", "data")
    
    if not os.path.exists(out_dir):
        os.makedirs(out_dir)
        
    files = [
        ("Bộ câu hỏi chương 1.docx", "ch1.json"),
        ("Bộ câu hỏi chương 2.docx", "ch2.json"),
        ("Bộ câu hỏi chương 3.docx", "ch3.json")
    ]
    
    for in_name, out_name in files:
        in_path = os.path.join(data_dir, in_name)
        out_path = os.path.join(out_dir, out_name)
        if os.path.exists(in_path):
            parse_docx_to_json(in_path, out_path)
        else:
            print(f"File not found: {in_path}")

if __name__ == "__main__":
    main()
