export enum MapDiabetesTypeEnum {
  TYPE_1 = "Diabetes tipo 1",
  TYPE_2 = "Diabetes tipo 2",
  GESTATIONAL = "Diabetes gestacional",
  OTHER = "Outro",
  UNKNOWN = "Nao informado",
}

export type DiabetesTypeKey = keyof typeof MapDiabetesTypeEnum;

export function mapDiabetesType(value: string | null | undefined) {
  if (value && value in MapDiabetesTypeEnum) {
    return MapDiabetesTypeEnum[value as DiabetesTypeKey];
  }

  return MapDiabetesTypeEnum.UNKNOWN;
}
