import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";
import * as mime from "mime-types";

const supabaseUrl = process.env.SUPABASE_URL || "https://vqkliqnanzemrjifvawf.supabase.co/";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseKey) {
  console.error("Missing Supabase Key!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const BUCKET_NAME = "lesson-assets";

async function uploadFile(filePath: string, destPath: string) {
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    return null;
  }
  console.log(`Uploading ${filePath} to ${destPath}...`);
  const fileBuffer = fs.readFileSync(filePath);
  const contentType = mime.lookup(filePath) || "application/octet-stream";
  
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(destPath, fileBuffer, {
      contentType,
      upsert: true,
    });

  if (error) {
    console.error(`Error uploading ${filePath}:`, error.message);
    return null;
  }

  const { data: publicUrlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(destPath);
    
  console.log(`Success! Public URL: ${publicUrlData.publicUrl}`);
  return publicUrlData.publicUrl;
}

async function main() {
  const filesToUpload = [
    { src: "/Volumes/WorkSpace/Project/PhiloMind/data/asset/doi_tuong_01.png", dest: "chapter-1/1.1.c/doi_tuong_01.png" },
    { src: "/Volumes/WorkSpace/Project/PhiloMind/data/asset/doi_tuong_02.png", dest: "chapter-1/1.1.c/doi_tuong_02.png" },
    { src: "/Volumes/WorkSpace/Project/PhiloMind/data/asset/doi_tuong_03.png", dest: "chapter-1/1.1.c/doi_tuong_03.png" },
    { src: "/Volumes/WorkSpace/Project/PhiloMind/data/asset/doi_tuong_04.png", dest: "chapter-1/1.1.c/doi_tuong_04.png" }
  ];

  for (const file of filesToUpload) {
    await uploadFile(file.src, file.dest);
  }
}

main().catch(console.error);
