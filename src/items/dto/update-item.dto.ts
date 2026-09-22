import { IsBoolean } from 'class-validator';

export class UpdateItemDto {
  @IsBoolean()
  bought: boolean;
}
