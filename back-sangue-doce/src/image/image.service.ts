import { Injectable } from "@nestjs/common";
import sharp from "sharp";

@Injectable()
export class ImageService {
  getMetadata(buffer: Buffer) {
    return sharp(buffer).metadata();
  }
}
