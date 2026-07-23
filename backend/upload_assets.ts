import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";
import * as mime from "mime-types";
import * as dotenv from "dotenv";

dotenv.config();

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
    { src: "/Volumes/WorkSpace/Project/PhiloMind/data/asset/doi_tuong_04.png", dest: "chapter-1/1.1.c/doi_tuong_04.png" },
    { src: "/Volumes/WorkSpace/Project/PhiloMind/data/asset/1784802430681_3329002652664996422_3329002652664996422_50ab04a905c8ba8fbdf0201d13b5060e.jpg", dest: "chapter-1/1.1.e/house_design_materials.jpg" },
    { src: "/Volumes/WorkSpace/Project/PhiloMind/data/asset/1784802445772_3329002652664996422_3329002652664996422_9aeba97b976e1778e4f435c8a8a8880f.jpg", dest: "chapter-1/1.1.e/house_laws_cognition.jpg" },
    { src: "/Volumes/WorkSpace/Project/PhiloMind/data/asset/ngoi_nha.jpg", dest: "chapter-1/1.1.e/ngoi_nha.jpg" }
  ];

  for (const file of filesToUpload) {
    await uploadFile(file.src, file.dest);
  }
}

main().catch(console.error);
