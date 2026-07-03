import { Module, Global } from "@nestjs/common";
import { TTSService } from "./tts.service";

@Global()
@Module({
  providers: [TTSService],
  exports: [TTSService],
})
export class TTSModule {}
