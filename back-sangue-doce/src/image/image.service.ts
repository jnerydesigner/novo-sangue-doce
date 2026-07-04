import { Injectable } from "@nestjs/common";
import sharp from "sharp";

@Injectable()
export class ImageService {
  metadata(buffer: Buffer) {
    return sharp(buffer).metadata();
  }

  async resize(buffer: Buffer, width: number, height?: number): Promise<Buffer> {
    return sharp(buffer)
      .resize({
        width,
        height,
        fit: "inside",
        withoutEnlargement: true,
      })
      .toBuffer();
  }

  async crop(buffer: Buffer, width: number, height: number): Promise<Buffer> {
    return sharp(buffer)
      .resize(width, height, {
        fit: "cover",
      })
      .toBuffer();
  }

  async rotate(buffer: Buffer): Promise<Buffer> {
    return sharp(buffer)
      .rotate() // utiliza a orientação EXIF automaticamente
      .toBuffer();
  }

  async jpeg(buffer: Buffer, quality = 80): Promise<Buffer> {
    return sharp(buffer).jpeg({ quality, mozjpeg: true }).toBuffer();
  }

  async png(buffer: Buffer): Promise<Buffer> {
    return sharp(buffer).png({ compressionLevel: 9 }).toBuffer();
  }

  async webp(buffer: Buffer, quality = 80): Promise<Buffer> {
    return sharp(buffer).webp({ quality }).toBuffer();
  }

  async avif(buffer: Buffer, quality = 70): Promise<Buffer> {
    return sharp(buffer).avif({ quality }).toBuffer();
  }

  async grayscale(buffer: Buffer): Promise<Buffer> {
    return sharp(buffer).grayscale().toBuffer();
  }

  async blur(buffer: Buffer, sigma = 1): Promise<Buffer> {
    return sharp(buffer).blur(sigma).toBuffer();
  }

  async sharpen(buffer: Buffer): Promise<Buffer> {
    return sharp(buffer).sharpen().toBuffer();
  }

  async flip(buffer: Buffer): Promise<Buffer> {
    return sharp(buffer).flip().toBuffer();
  }

  async flop(buffer: Buffer): Promise<Buffer> {
    return sharp(buffer).flop().toBuffer();
  }

  async extract(
    buffer: Buffer,
    left: number,
    top: number,
    width: number,
    height: number,
  ): Promise<Buffer> {
    return sharp(buffer).extract({ left, top, width, height }).toBuffer();
  }

  async extend(
    buffer: Buffer,
    top: number,
    bottom: number,
    left: number,
    right: number,
  ): Promise<Buffer> {
    return sharp(buffer).extend({ top, bottom, left, right }).toBuffer();
  }

  async toWebp(buffer: Buffer, quality = 80): Promise<Buffer> {
    return sharp(buffer)
      .webp({
        quality,
        effort: 6,
      })
      .toBuffer();
  }
}
