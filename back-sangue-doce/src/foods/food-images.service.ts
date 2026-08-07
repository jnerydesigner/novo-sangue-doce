import { PrismaService } from "@infra/database/prisma.service";
import { AwsS3Service } from "@infra/storage/aws-s3.service";
import { BadGatewayException, Injectable, NotFoundException } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { Readable } from "node:stream";
import type { UploadedImageFile } from "@app/uploads/types/uploaded-image-file.type";
import { ImageService } from "@app/image/image.service";

type WikimediaImageInfo = {
  descriptionurl?: string;
  extmetadata?: {
    Artist?: { value?: string };
    LicenseShortName?: { value?: string };
  };
  thumburl?: string;
  url?: string;
};

@Injectable()
export class FoodImagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly s3: AwsS3Service,
    private readonly imageService: ImageService,
  ) {}

  async findAndAttach(foodId: number) {
    const food = await this.prisma.foods.findUnique({
      where: { id: foodId },
      include: { images: true },
    });

    if (!food) {
      throw new NotFoundException("Food not found.");
    }

    // Se este alimento já possui uma imagem vinculada, não consulta a web nem
    // envia outro arquivo para o S3.
    if (food.images.length > 0) {
      return { food, image: food.images[0], reused: true };
    }

    // A imagem pertence ao grupo do alimento, não à descrição nutricional.
    // Ex.: "cereal matinal / milho" e "cereal matinal / milho açúcar"
    // compartilham a imagem do grupo "cereal".
    const imageGroupName = this.getImageGroupName(food.name);
    const existingImage = await this.prisma.foodImage.findUnique({
      where: { normalizedName: imageGroupName },
    });

    if (existingImage) {
      await this.prisma.foods.update({
        where: { id: food.id },
        data: { images: { connect: { id: existingImage.id } } },
      });

      const updatedFood = await this.prisma.foods.findUnique({
        where: { id: food.id },
        include: { images: true },
      });

      return { food: updatedFood, image: existingImage, reused: true };
    }

    const source = await this.searchWikimedia(imageGroupName);
    if (!source.url) {
      throw new BadGatewayException("Nenhuma imagem licenciada foi encontrada para o alimento.");
    }

    const response = await fetch(source.url);
    if (!response.ok) {
      throw new BadGatewayException("Nao foi possivel baixar a imagem encontrada.");
    }

    try {
      const uploaded = await this.s3.uploadStream({
        body: Readable.fromWeb(response.body as any),
        contentType: response.headers.get("content-type") ?? "image/jpeg",
        contentLength: this.getContentLength(response.headers.get("content-length")),
        key: `public/foods/${imageGroupName}/${randomUUID()}.jpg`,
      });

      const image = await this.prisma.foodImage.create({
        data: {
          normalizedName: imageGroupName,
          imageUrl: uploaded.url,
          s3Key: uploaded.key,
          sourceUrl: source.descriptionurl,
          sourceName: source.artist ?? "Wikimedia Commons",
          license: source.license,
          foods: { connect: { id: food.id } },
        },
      });

      const updatedFood = await this.prisma.foods.findUnique({
        where: { id: food.id },
        include: { images: true },
      });

      return { food: updatedFood, image, reused: false };
    } catch (error) {
      throw error;
    }
  }

  async attachManual(
    foodId: number,
    input: { imageUrl: string; s3Key?: string; sourceUrl?: string; sourceName?: string; license?: string },
  ) {
    const food = await this.prisma.foods.findUnique({ where: { id: foodId }, include: { images: true } });
    if (!food) throw new NotFoundException("Food not found.");
    if (food.images.length > 0) return { food, image: food.images[0], reused: true };

    const normalizedName = this.getImageGroupName(food.name);
    const existingImage = await this.prisma.foodImage.findUnique({ where: { normalizedName } });
    if (existingImage) {
      await this.prisma.foods.update({ where: { id: food.id }, data: { images: { connect: { id: existingImage.id } } } });
      return { food: await this.prisma.foods.findUnique({ where: { id: food.id }, include: { images: true } }), image: existingImage, reused: true };
    }

    const image = await this.prisma.foodImage.create({
      data: {
        normalizedName,
        imageUrl: input.imageUrl,
        s3Key: input.s3Key ?? input.imageUrl,
        sourceUrl: input.sourceUrl,
        sourceName: input.sourceName ?? "Cadastro manual",
        license: input.license,
        foods: { connect: { id: food.id } },
      },
    });
    return { food: await this.prisma.foods.findUnique({ where: { id: food.id }, include: { images: true } }), image, reused: false };
  }

  async attachManualUpload(
    foodId: number,
    file: UploadedImageFile | undefined,
    input: { sourceUrl?: string; sourceName?: string; license?: string },
  ) {
    if (!file) throw new BadGatewayException("Envie uma imagem no campo image.");
    const food = await this.prisma.foods.findUnique({ where: { id: foodId }, include: { images: true } });
    if (!food) throw new NotFoundException("Food not found.");
    if (food.images.length > 0) return { food, image: food.images[0], reused: true };

    const normalizedName = this.getImageGroupName(food.name);
    const existingImage = await this.prisma.foodImage.findUnique({ where: { normalizedName } });
    if (existingImage) {
      await this.prisma.foods.update({ where: { id: food.id }, data: { images: { connect: { id: existingImage.id } } } });
      return { food: await this.prisma.foods.findUnique({ where: { id: food.id }, include: { images: true } }), image: existingImage, reused: true };
    }

    const uploaded = await this.s3.uploadObject({
      buffer: file.buffer,
      contentType: file.mimetype,
      key: `public/foods/${normalizedName}/manual-${randomUUID()}`,
    });
    const image = await this.prisma.foodImage.create({
      data: {
        normalizedName, imageUrl: uploaded.url, s3Key: uploaded.key,
        sourceUrl: input.sourceUrl, sourceName: input.sourceName ?? "Upload manual", license: input.license,
        foods: { connect: { id: food.id } },
      },
    });
    return { food: await this.prisma.foods.findUnique({ where: { id: food.id }, include: { images: true } }), image, reused: false };
  }

  async updateManualUpload(
    foodId: number,
    file: UploadedImageFile | undefined,
    input: { sourceUrl?: string; sourceName?: string; license?: string },
  ) {
    if (!file) throw new BadGatewayException("Envie uma imagem no campo image.");
    const food = await this.prisma.foods.findUnique({ where: { id: foodId }, include: { images: true } });
    if (!food) throw new NotFoundException("Food not found.");

    const normalizedName = this.getImageGroupName(food.name);
    const existingImage = food.images[0] ?? await this.prisma.foodImage.findUnique({ where: { normalizedName } });
    if (!existingImage) return this.attachManualUpload(foodId, file, input);

    const optimizedImage = await this.imageService.toWebp(file.buffer, 78);
    const uploaded = await this.s3.uploadObject({
      buffer: optimizedImage,
      contentType: "image/webp",
      key: `public/foods/${normalizedName}/manual-${randomUUID()}.webp`,
    });

    const image = await this.prisma.foodImage.update({
      where: { id: existingImage.id },
      data: {
        imageUrl: uploaded.url,
        s3Key: uploaded.key,
        sourceUrl: input.sourceUrl,
        sourceName: input.sourceName ?? "Upload manual",
        license: input.license,
      },
    });

    await this.s3.deleteObject(existingImage.s3Key).catch(() => undefined);
    return { food: await this.prisma.foods.findUnique({ where: { id: food.id }, include: { images: true } }), image, replaced: true };
  }

  private getContentLength(value: string | null) {
    if (!value) {
      throw new BadGatewayException("A imagem encontrada nao informou o tamanho do arquivo.");
    }

    const contentLength = Number(value);
    if (!Number.isSafeInteger(contentLength) || contentLength <= 0) {
      throw new BadGatewayException("O tamanho da imagem encontrada e invalido.");
    }

    return contentLength;
  }

  private async searchWikimedia(name: string) {
    const params = new URLSearchParams({
      action: "query",
      format: "json",
      generator: "search",
      gsrnamespace: "6",
      gsrsearch: `${name} food`,
      gsrlimit: "1",
      origin: "*",
      prop: "imageinfo",
      iiprop: "url|extmetadata",
      iiurlwidth: "1600",
    });

    const response = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`);
    if (!response.ok) {
      throw new BadGatewayException("Nao foi possivel consultar o Wikimedia Commons.");
    }

    const payload = (await response.json()) as {
      query?: { pages?: Record<string, { imageinfo?: WikimediaImageInfo[]; fullurl?: string }> };
    };
    const page = Object.values(payload.query?.pages ?? {})[0];
    const info = page?.imageinfo?.[0];

    return {
      artist: info?.extmetadata?.Artist?.value,
      descriptionurl: info?.descriptionurl ?? page?.fullurl,
      license: info?.extmetadata?.LicenseShortName?.value,
      url: info?.thumburl ?? info?.url,
    };
  }

  private getImageGroupName(foodName: string) {
    const normalizedName = foodName
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/\b(cozido|cozida|frito|frita|assado|assada|grelhado|grelhada|cru|crua)\b/g, "")
      .replace(/[^a-z0-9]+/g, " ")
      .trim()

    // O primeiro termo representa o alimento comum; os demais qualificam
    // a preparação, marca ou variação e não devem mudar a imagem do grupo.
    return normalizedName.split(" ")[0] || "food";
  }
}
